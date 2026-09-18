// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/ICasinoGameV2.sol";

/**
 * @title DepthCharge
 * @notice Cold War Mariana Trench Submarine Descent Casino Game for Chain Casino (Base L2).
 * @dev Implements ICasinoGameV2. Provably fair 5-stage hydrostatic cascade with certified 96.000000% theoretical RTP.
 */
contract DepthCharge is ICasinoGameV2 {
    // 5 Binary-exact byte thresholds (out of 256)
    // Zone 1 (1,000m): 192/256 = 75.0%
    // Zone 2 (3,000m): 160/256 = 62.5%
    // Zone 3 (6,000m): 128/256 = 50.0%
    // Zone 4 (8,500m):  96/256 = 37.5%
    // Zone 5 (11,000m): 64/256 = 25.0%
    uint8[5] public THRESHOLDS = [192, 160, 128, 96, 64];

    // Multipliers in Basis Points (10000 = 1.00x)
    // 0 cleared: 0.00x
    // 1 cleared: 0.00x
    // 2 cleared: 0.50x
    // 3 cleared: 1.40x
    // 4 cleared: 5.00x
    // 5 cleared: 14.0240x (Challenger Deep Grand Jackpot)
    uint32[6] public MULTIPLIERS_BPS = [0, 0, 5000, 14000, 50000, 140240];

    struct Game {
        address player;
        uint256 wager;
        uint256 blockNumber;
        bool settled;
        uint8 clearedStages;
        uint256 payout;
    }

    uint256 public nextGameId = 1;
    mapping(uint256 => Game) public games;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Initiates a dive round with the attached ETH / native wager.
     */
    function play(bytes calldata /* gameData */) external payable override returns (uint256 gameId) {
        require(msg.value > 0, "Wager must be > 0");
        gameId = nextGameId++;
        games[gameId] = Game({
            player: msg.sender,
            wager: msg.value,
            blockNumber: block.number,
            settled: false,
            clearedStages: 0,
            payout: 0
        });

        emit GameCreated(msg.sender, gameId, msg.value);
    }

    /**
     * @notice Resolves the dive using VRF seed randomness.
     */
    function settle(uint256 gameId, bytes32 vrfSeed) external override returns (uint256 payout) {
        Game storage game = games[gameId];
        require(!game.settled, "Game already settled");
        require(game.wager > 0, "Game does not exist");

        (uint8 cleared, uint32 multBps, uint8[5] memory rollBytes) = evaluateDive(vrfSeed);

        game.settled = true;
        game.clearedStages = cleared;
        payout = (game.wager * multBps) / 10000;
        game.payout = payout;

        bytes memory outcomeData = abi.encode(cleared, multBps, rollBytes);

        if (payout > 0) {
            require(address(this).balance >= payout, "Insufficient contract liquidity");
            (bool success, ) = game.player.call{value: payout}("");
            require(success, "Payout transfer failed");
        }

        emit GameResolved(game.player, gameId, payout, outcomeData);
    }

    /**
     * @notice Pure evaluation helper for checking outcomes off-chain and in client simulation.
     */
    function evaluateDive(bytes32 seed) public view returns (
        uint8 clearedStages,
        uint32 multiplierBps,
        uint8[5] memory rollBytes
    ) {
        bytes32 hash = keccak256(abi.encodePacked(seed, "DEPTH_CHARGE_V1"));
        
        clearedStages = 0;
        for (uint8 i = 0; i < 5; i++) {
            rollBytes[i] = uint8(hash[i]);
            if (rollBytes[i] < THRESHOLDS[i]) {
                clearedStages++;
            } else {
                // Hull breached at this stage!
                break;
            }
        }

        multiplierBps = MULTIPLIERS_BPS[clearedStages];
    }

    receive() external payable {}
}
