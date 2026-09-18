/**
 * DEPTH CHARGE: Challenger Deep Mariana Trench Submarine Descent
 * Theoretical RTP & Exact Combinatorial Verification Script
 * 
 * Target RTP: 96.000000%
 * Modulo Bias: 0.000000% (Binary-exact byte thresholds over [0, 255])
 */

const THRESHOLDS = [192, 160, 128, 96, 64]; // out of 256
// Corresponding probabilities:
// Stage 0 (1,000m): 192/256 = 3/4 = 0.75
// Stage 1 (3,000m): 160/256 = 5/8 = 0.625
// Stage 2 (6,000m): 128/256 = 1/2 = 0.500
// Stage 3 (8,500m):  96/256 = 3/8 = 0.375
// Stage 4 (11,000m): 64/256 = 1/4 = 0.250

// Multipliers in basis points (10000 = 1.00x)
// Progression: 0x -> 0x -> 0.50x -> 1.40x -> 5.00x -> 14.0240x
const MULTIPLIERS_BPS = [
  0,        // 0 stages cleared (breach at surface) -> 0.00x
  0,        // 1 stage cleared (breach at 1,000m)   -> 0.00x
  5000,     // 2 stages cleared (cleared 3,000m)    -> 0.50x
  14000,    // 3 stages cleared (cleared 6,000m)    -> 1.40x
  50000,    // 4 stages cleared (cleared 8,500m)    -> 5.00x
  140240,   // 5 stages cleared (CHALLENGER DEEP)   -> 14.0240x
];

console.log('===============================================================');
console.log('  DEPTH CHARGE: CHALLENGER DEEP - THEORETICAL RTP VERIFICATION ');
console.log('===============================================================\n');

// 1. Analytical Probability & EV Calculation
const p_pass = THRESHOLDS.map(t => t / 256);
const p_fail = p_pass.map(p => 1 - p);

// Probabilities of clearing exactly N stages:
const P = [];
P[0] = p_fail[0]; // Failed stage 0
P[1] = p_pass[0] * p_fail[1]; // Passed 0, failed 1
P[2] = p_pass[0] * p_pass[1] * p_fail[2]; // Passed 0, 1, failed 2
P[3] = p_pass[0] * p_pass[1] * p_pass[2] * p_fail[3]; // Passed 0, 1, 2, failed 3
P[4] = p_pass[0] * p_pass[1] * p_pass[2] * p_pass[3] * p_fail[4]; // Passed 0..3, failed 4
P[5] = p_pass[0] * p_pass[1] * p_pass[2] * p_pass[3] * p_pass[4]; // Passed all 5

console.log('Stage-by-Stage Probabilities and Payouts:');
console.log('---------------------------------------------------------------');
let totalProb = 0;
let totalEV = 0;

for (let i = 0; i <= 5; i++) {
  const mult = MULTIPLIERS_BPS[i] / 10000;
  const ev = P[i] * mult;
  totalProb += P[i];
  totalEV += ev;
  const label = i === 5 ? 'CHALLENGER DEEP JACKPOT' : `${i} Zone(s) Cleared`;
  console.log(
    `Stage ${i} [${label.padEnd(24)}]: P = ${(P[i] * 100).toFixed(6)}% | Multiplier = ${mult.toFixed(4).padStart(7)}x | EV = ${(ev * 100).toFixed(6)}%`
  );
}

console.log('---------------------------------------------------------------');
console.log(`Total Probability:    ${(totalProb * 100).toFixed(6)}%`);
console.log(`Total Analytical RTP: ${(totalEV * 100).toFixed(6)}%`);
console.log('Target RTP:           96.000000%\n');

// 2. Exact Integer / Rational Arithmetic Check
// Total states = 4 * 8 * 2 * 8 * 4 = 2048 coprime states
const states_total = 2048n;
const count0 = 1n * 8n * 2n * 8n * 4n; // fail at 0: 1/4 -> 512
const count1 = 3n * 3n * 2n * 8n * 4n; // pass 0 (3), fail 1 (3) -> 576
const count2 = 3n * 5n * 1n * 8n * 4n; // pass 0 (3), pass 1 (5), fail 2 (1) -> 480
const count3 = 3n * 5n * 1n * 5n * 4n; // pass 0..2, fail 3 (5) -> 300
const count4 = 3n * 5n * 1n * 3n * 3n; // pass 0..3, fail 4 (3) -> 135
const count5 = 3n * 5n * 1n * 3n * 1n; // pass 0..4 (all) -> 45

const sumStates = count0 + count1 + count2 + count3 + count4 + count5;
if (sumStates !== states_total) {
  throw new Error(`State partitioning error: sum ${sumStates} != ${states_total}`);
}

const totalPayoutNumerator =
  count0 * BigInt(MULTIPLIERS_BPS[0]) +
  count1 * BigInt(MULTIPLIERS_BPS[1]) +
  count2 * BigInt(MULTIPLIERS_BPS[2]) +
  count3 * BigInt(MULTIPLIERS_BPS[3]) +
  count4 * BigInt(MULTIPLIERS_BPS[4]) +
  count5 * BigInt(MULTIPLIERS_BPS[5]);

// Target numerator for exactly 96% with 10000 BPS: 0.96 * 10000 * 2048 = 19,660,800
const expectedNumerator = 2048n * 9600n;

console.log('Exact Integer Rational Proof:');
console.log(`- State space partitions: [${count0}, ${count1}, ${count2}, ${count3}, ${count4}, ${count5}] (sum = ${sumStates})`);
console.log(`- Exact Payout Numerator: ${totalPayoutNumerator}`);
console.log(`- Target Numerator (96%): ${expectedNumerator}`);
const diff = totalPayoutNumerator - expectedNumerator;
console.log(`- Delta:                  ${diff} units`);

if (diff !== 0n) {
  throw new Error(`RTP deviation detected: Delta is ${diff}`);
}

console.log('\n>>> SUCCESS: RTP IS CERTIFIED TO BE EXACTLY 96.000000% (ZERO DRIFT)! <<<\n');
process.exit(0);
