export interface DepthZoneConfig {
  id: number;
  name: string;
  zone: string;
  depthMeters: number;
  pressureAtm: number;
  threshold: number; // out of 256
  multiplier: number; // e.g. 0.50, 1.40, 5.00, 14.024
  description: string;
}

export type DiveState = 
  | 'IDLE' 
  | 'SUBMERGING' 
  | 'PASSING_ZONE' 
  | 'BREACH' 
  | 'JACKPOT_SURFACED' 
  | 'ROUND_RESOLVED';

export interface RoundResult {
  gameId: string;
  wager: number;
  clearedStages: number; // 0 to 5
  multiplier: number;
  payout: number;
  rollBytes: number[];
  isBreach: boolean;
  breachStage: number | null; // 0 to 4 if breached, null if reached 11,000m
  seed: string;
  timestamp: number;
}

export interface SonarBlip {
  id: number;
  distance: number; // 0.0 to 1.0 (relative to radar radius)
  angle: number; // in radians
  intensity: number; // 0.0 to 1.0
  type: 'trench' | 'anomaly' | 'creature';
}

export interface SubmarineTelemetry {
  depthMeters: number;
  pressureAtm: number;
  hullIntegrity: number; // 0% to 100%
  oxygenPercent: number; // 99.8%
  currentStageIndex: number; // 0 to 4
  diveSpeedMps: number; // descent rate in m/s
}
