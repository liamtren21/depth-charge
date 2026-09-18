// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICasinoGameV2 {
    event GameCreated(address indexed player, uint256 indexed gameId, uint256 wager);
    event GameResolved(address indexed player, uint256 indexed gameId, uint256 payout, bytes outcomeData);

    function play(bytes calldata gameData) external payable returns (uint256 gameId);
    function settle(uint256 gameId, bytes32 vrfSeed) external returns (uint256 payout);
}
