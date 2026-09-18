import { DepthZoneConfig } from '../types/game';

export const DEPTH_ZONES: DepthZoneConfig[] = [
  {
    id: 0,
    name: 'ZONE 1: MESOPELAGIC',
    zone: 'TWILIGHT ZONE',
    depthMeters: 1000,
    pressureAtm: 100,
    threshold: 192, // 75.00% pass
    multiplier: 0.0,
    description: 'Faint blue sunlight fades into cold dark waters. Ballast compression begins.',
  },
  {
    id: 1,
    name: 'ZONE 2: BATHYPELAGIC',
    zone: 'MIDNIGHT ZONE',
    depthMeters: 3000,
    pressureAtm: 300,
    threshold: 160, // 62.50% pass
    multiplier: 0.50,
    description: 'Total optical darkness. Hydrostatic hull groan begins. First recovery threshold.',
  },
  {
    id: 2,
    name: 'ZONE 3: ABYSSOPELAGIC',
    zone: 'ABYSSAL PLAIN',
    depthMeters: 6000,
    pressureAtm: 600,
    threshold: 128, // 50.00% pass
    multiplier: 1.40,
    description: 'Sub-zero temperatures and massive pressure. Bioluminescent siphonophores drift past.',
  },
  {
    id: 3,
    name: 'ZONE 4: HADALPELAGIC',
    zone: 'HADAL TRENCH',
    depthMeters: 8500,
    pressureAtm: 850,
    threshold: 96, // 37.50% pass
    multiplier: 5.00,
    description: 'Sheer undersea cliffs of the Mariana Trench. Hull rivets groan under 850 atmospheres.',
  },
  {
    id: 4,
    name: 'ZONE 5: CHALLENGER DEEP',
    zone: 'OCEANIC VOID FLOOR',
    depthMeters: 11000,
    pressureAtm: 1100,
    threshold: 64, // 25.00% pass
    multiplier: 14.024,
    description: 'Bottom of the Earth: 11,000 meters. 1.1 metric tons per square centimeter!',
  },
];

export const MULTIPLIERS_TABLE = [0, 0, 0.50, 1.40, 5.00, 14.024];

export const WAGER_PRESETS = [0.10, 0.50, 1.00, 5.00, 10.00, 25.00];

export const CERTIFIED_RTP = '96.000000%';
