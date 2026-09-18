import crypto from 'crypto';

const THRESHOLDS = [192, 160, 128, 96, 64];
const MULTIPLIERS = [0, 0, 0.50, 1.40, 5.00, 14.024];

console.log('Running 100,000-Round Monte Carlo E2E Simulation for DEPTH CHARGE...');

const ROUNDS = 100000;
let totalWager = 0;
let totalPayout = 0;
const stageReachCounts = [0, 0, 0, 0, 0, 0];

for (let r = 0; r < ROUNDS; r++) {
  const wager = 1.00;
  totalWager += wager;

  // 5 random bytes from crypto
  const bytes = crypto.randomBytes(5);
  let cleared = 0;

  for (let s = 0; s < 5; s++) {
    if (bytes[s] < THRESHOLDS[s]) {
      cleared++;
    } else {
      break; // hull breached
    }
  }

  stageReachCounts[cleared]++;
  const mult = MULTIPLIERS[cleared];
  totalPayout += wager * mult;
}

const realizedRTP = (totalPayout / totalWager) * 100;

console.log('\n--- SIMULATION RESULTS ---');
console.log(`Total Rounds: ${ROUNDS.toLocaleString()}`);
console.log(`Realized RTP: ${realizedRTP.toFixed(4)}% (Expected: 96.0000%)`);
console.log('Outcome Breakdown:');
for (let i = 0; i <= 5; i++) {
  const pct = ((stageReachCounts[i] / ROUNDS) * 100).toFixed(2);
  const label = i === 5 ? 'CHALLENGER DEEP JACKPOT' : `${i} Zones Cleared`;
  console.log(`  Stage ${i} [${label.padEnd(23)}]: ${stageReachCounts[i].toString().padStart(7)} (${pct}%)`);
}

if (Math.abs(realizedRTP - 96.0) > 2.0) {
  throw new Error(`Simulation RTP ${realizedRTP.toFixed(2)}% deviated beyond 3-sigma bounds from 96.00%`);
}

console.log('\n>>> E2E SIMULATION VERIFICATION PASSED! <<<\n');
