# Depth Charge // Challenger Deep 11,000M

* **Live Demo**: [https://depth-charge-sage.vercel.app](https://depth-charge-sage.vercel.app)
* **Smart Contract**: [`contracts/DepthCharge.sol`](contracts/DepthCharge.sol) (`ICasinoGameV2` on Base L2)
* **Hackathon Category**: Original Casino Game for **Chain Jam Vol. 1**

---

A 16-bit arcade submarine descent casino game built on the **Chain Casino SDK (`ICasinoGameV2`)** for Base L2.

Instead of another generic web dashboard with card panels, Depth Charge runs inside a **single, unified retro arcade cabinet**. Players pilot a deep-sea bathyscaphe into the Mariana Trench through 5 hydrostatic pressure gates toward a **14.024x Grand Jackpot** at the Challenger Deep floor, with partial recovery multipliers kicking in past 3,000 meters.

- **Certified Theoretical RTP**: Exactly `96.000000%` (0-wei drift across 2,048 states).
- **Engine**: 100% procedural HTML5 Canvas pixel art engine (no external image assets, zero CSS hacks, 180 kB production bundle).
- **Audio**: Procedural Web Audio API synthesizer (no MP3/WAV downloads; real-time FM synthesis for hull stress groans, dive klaxons, and sonar chirps).

---

## How It Works

A round consists of a pressurized dive through 5 ocean depth gates. Each gate requires clearing a random byte threshold [0, 255] derived from a VRF seed:

| Depth Gate | Depth | Pressure | Roll Check | Pass Rate | Multiplier | Expected Value |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Gate 1: Twilight** | 1,000 m | 100 ATM | `roll[0] < 192` | 192/256 = 75.0% | 0.00x | 0.000000% |
| **Gate 2: Midnight** | 3,000 m | 300 ATM | `roll[1] < 160` | 160/256 = 62.5% | 0.50x | 11.718750% |
| **Gate 3: Abyssal** | 6,000 m | 600 ATM | `roll[2] < 128` | 128/256 = 50.0% | 1.40x | 20.507813% |
| **Gate 4: Hadal** | 8,500 m | 850 ATM | `roll[3] < 96` | 96/256 = 37.5% | 5.00x | 32.958984% |
| **Gate 5: Void Floor** | 11,000 m | 1,100 ATM | `roll[4] < 64` | 64/256 = 25.0% | **14.0240x** | 30.814453% |
| **TOTAL** | | | | | | **96.000000%** |

### Implosion & Partial Recovery
- If the hull breaches before Gate 2, the wager is lost.
- If the vessel breaches at Gate 3 or Gate 4, the player receives a partial salvage return (`0.50x` or `1.40x` of the wager), keeping risk engaging and smoothing bankroll variance.
- Reaching Gate 5 awards the **14.024x Challenger Deep Grand Jackpot**.

---

## The Math Proof: Zero-Wei Drift

Every threshold is a power-of-two fraction of 256 (192/256 = 3/4, 160/256 = 5/8, 128/256 = 1/2, 96/256 = 3/8, 64/256 = 1/4), eliminating modulo bias completely.

Factoring the 5 stages into a common denominator gives an exact partition of 2,048 coprime states:

```
State Counts = [512, 576, 480, 300, 135, 45] (Sum = 2,048)
```

Calculating expected payout in basis points (10,000 bps = 1.00x):

- Stage 0 (0 zones): 512 × 0 = 0
- Stage 1 (1 zone): 576 × 0 = 0
- Stage 2 (2 zones): 480 × 5,000 = 2,400,000
- Stage 3 (3 zones): 300 × 14,000 = 4,200,000
- Stage 4 (4 zones): 135 × 50,000 = 6,750,000
- Stage 5 (5 zones): 45 × 140,240 = 6,310,800
- **Total Payout Numerator**: 19,660,800
- **Target (96% of 2,048)**: 2,048 × 9,600 = 19,660,800
- **Difference**: 0 (Exact zero-wei drift)

Verify anytime:
```bash
npm run test:rtp
```

---

## Visuals & Sound: Under the Hood

### 1. Unified 16-Bit Pixel Engine
- Runs on an internal `960x540` canvas scaled up with `image-rendering: pixelated` to give an authentic Neo-Geo arcade feel.
- Procedural submarine sprite with conning tower, observation dome with animated diver pilot, spinning brass dual propellers with trailing bubble wake, and a sweeping volumetric searchlight beam cutting through the water.
- Vertical parallax descent passing through 5 distinct ocean layers: sunlit surface chop, bioluminescent siphonophores, sunken 18th-century galleon shipwreck on trench shelves, hydrothermal black smoker chimneys venting bubble plumes, and molten magma rifts on the hadal seabed.
- In-game HUD rendered directly inside the canvas: tactical depth ladder with real-time roll verification bytes (`R: 73 ✔`, `R: 183 ✗`) and a 360° phosphor CRT sonar radar with acoustic echo blips.

### 2. Procedural Web Audio API
All sound is generated mathematically on the client using the browser's Web Audio API:
- **Active Sonar Ping**: 1,050 Hz pure carrier chirp with exponential underwater reverberation.
- **Hull Stress Groan**: Frequency-modulated sawtooth run through a resonant bandpass filter simulating thick steel plate compression.
- **Two-Tone Dive Klaxon**: Authentic retro alarm siren ("AWOOGA" dive buzzer).
- **Ballast Vent**: Filtered white noise simulating high-pressure air clearing ballast tanks.
- **Hull Breach Implosion**: Sub-bass shockwave impulse coupled with metal tearing crunch.

---

## Smart Contract Integration (`contracts/DepthCharge.sol`)

The on-chain contract implements the official **`ICasinoGameV2`** standard on Base L2:

```solidity
interface ICasinoGameV2 {
    function calculateOutcome(
        uint256 wager,
        uint256 vrfSeed,
        bytes calldata extraData
    ) external view returns (uint256 payout, bytes memory telemetry);
}
```

- Slices the `vrfSeed` into five individual 8-bit bytes (r0 to r4).
- Evaluates survival sequentially against the threshold array `[192, 160, 128, 96, 64]`.
- Zeroes payout on stage 0-1 breaches; returns exact partial returns or the 14.024x jackpot.
- Encodes full round telemetry (stages cleared, roll bytes, depth reached) for provably fair verification in block explorers.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation
```bash
git clone https://github.com/liamtren21/depth-charge.git
cd depth-charge
npm install
```

### Development Server
```bash
npm run dev
```
Open `http://localhost:3302` in your browser.

### Test Suites
```bash
# Verify analytical 96.000000% RTP with exact integer math
npm run test:rtp

# Run 100,000-round Monte Carlo simulation
npm run test:e2e
```

### Production Build
```bash
npm run build
```
Outputs an optimized, standalone static production build in `dist/` (bundle size: ~180 kB).

---

## License
MIT
