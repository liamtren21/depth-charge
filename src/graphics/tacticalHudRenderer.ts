/**
 * Tactical In-Game Naval HUD, CRT Sonar Radar & Scanlines Shader Renderer
 * Features Hadal Depth Gate ladder with hazard chevrons, LED status jewel lamps,
 * cryptographic roll verification telemetry, 360° PPI CRT sonar radar,
 * top telemetry header bar, and micro-scanline CRT shader overlay.
 */

import { DEPTH_ZONES, MULTIPLIERS_TABLE, CERTIFIED_RTP } from '../constants/zones';

export interface HudRenderOptions {
  depth: number;
  balance: number;
  clearedCount: number;
  rollBytes: number[];
  isDiving: boolean;
  isBreached: boolean;
  frame: number;
}

/**
 * 1. Draw Integrated Tactical Hadal Depth Gate Rail (Left HUD)
 */
export function drawTacticalDepthGateRail(
  ctx: CanvasRenderingContext2D,
  options: HudRenderOptions
) {
  const { depth, clearedCount, rollBytes, isDiving, isBreached, frame } = options;

  const hx = 12;
  const hy = 42;
  const hw = 230;
  const hh = 426;

  ctx.save();

  // Tactical HUD Background Panel
  ctx.fillStyle = 'rgba(3, 7, 18, 0.88)';
  ctx.fillRect(hx, hy, hw, hh);
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2;
  ctx.strokeRect(hx, hy, hw, hh);

  // Top Title Bar with Hazard Warning Chevrons
  ctx.fillStyle = '#082f49';
  ctx.fillRect(hx, hy, hw, 26);
  ctx.strokeStyle = '#0369a1';
  ctx.strokeRect(hx, hy, hw, 26);

  // Hazard Chevrons (Yellow & Black stripes at top corner)
  for (let s = 0; s < 5; s++) {
    ctx.fillStyle = s % 2 === 0 ? '#f59e0b' : '#0f172a';
    ctx.fillRect(hx + hw - 42 + s * 8, hy + 4, 6, 18);
  }

  // Header Title
  ctx.font = 'bold 8px "Press Start 2P", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('HADAL DEPTH GATES', hx + 10, hy + 17);

  // Draw 5 Zone Gate Cards
  const cardH = 72;
  const cardGap = 6;
  const startY = hy + 32;

  for (let i = 0; i < 5; i++) {
    const zone = DEPTH_ZONES[i];
    const cy = startY + i * (cardH + cardGap);
    const isPast = clearedCount > i;
    const isCurrent = isDiving && depth >= (i === 0 ? 0 : DEPTH_ZONES[i - 1].depthMeters) && depth < zone.depthMeters;
    const isFailedHere = isBreached && clearedCount === i;
    const roll = rollBytes[i];

    // Card Background
    if (isFailedHere) {
      // Crimson Implosion Breach Card
      ctx.fillStyle = 'rgba(225, 29, 72, 0.45)';
      ctx.fillRect(hx + 6, cy, hw - 12, cardH);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.strokeRect(hx + 6, cy, hw - 12, cardH);
    } else if (isPast) {
      // Survived Emerald Green Card
      ctx.fillStyle = 'rgba(5, 150, 105, 0.35)';
      ctx.fillRect(hx + 6, cy, hw - 12, cardH);
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.strokeRect(hx + 6, cy, hw - 12, cardH);
    } else if (isCurrent) {
      // Actively Diving Amber Pulse Card
      const pulseAlpha = Math.sin(frame * 0.1) * 0.2 + 0.3;
      ctx.fillStyle = `rgba(245, 158, 11, ${pulseAlpha})`;
      ctx.fillRect(hx + 6, cy, hw - 12, cardH);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.strokeRect(hx + 6, cy, hw - 12, cardH);
    } else {
      // Standby Slate Card
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(hx + 6, cy, hw - 12, cardH);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(hx + 6, cy, hw - 12, cardH);
    }

    // Depth & Name
    ctx.font = 'bold 8px "Press Start 2P", monospace';
    ctx.fillStyle = isFailedHere ? '#fda4af' : (isPast ? '#6ee7b7' : (isCurrent ? '#fde047' : '#94a3b8'));
    ctx.fillText(`${zone.depthMeters}M`, hx + 12, cy + 18);

    // Multiplier Badge
    const mult = MULTIPLIERS_TABLE[i + 1];
    ctx.fillStyle = isFailedHere ? '#fda4af' : (isPast ? '#34d399' : (isCurrent ? '#fbbf24' : '#64748b'));
    ctx.font = 'bold 8px "Press Start 2P", monospace';
    ctx.fillText(`${mult.toFixed(2)}x`, hx + hw - 64, cy + 18);

    // Zone Title
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(zone.name.toUpperCase(), hx + 12, cy + 34);

    // Cryptographic Roll Byte Telemetry
    ctx.font = '6px "Press Start 2P", monospace';
    if (roll !== undefined && (isPast || isFailedHere)) {
      const passed = roll < zone.threshold;
      ctx.fillStyle = passed ? '#34d399' : '#f43f5e';
      ctx.fillText(`R:${roll} ${passed ? '<' : '>='} ${zone.threshold}`, hx + 12, cy + 54);

      // Status indicator icon
      ctx.font = '10px monospace';
      ctx.fillText(passed ? '✔' : '✗', hx + hw - 26, cy + 54);
    } else {
      ctx.fillStyle = '#475569';
      ctx.fillText(`< ${zone.threshold} (T:${i + 1})`, hx + 12, cy + 54);
      ctx.fillText('•', hx + hw - 26, cy + 54);
    }
  }

  ctx.restore();
}

/**
 * 2. Draw 360° PPI CRT Sonar Scope (Top-Right HUD)
 */
export function drawCrtSonarScope(
  ctx: CanvasRenderingContext2D,
  frame: number,
  isDiving: boolean,
  isBreached: boolean
) {
  const rx = 850;
  const ry = 48;
  const r = 40;

  ctx.save();

  // Dark Forest Green Phosphor CRT Screen
  ctx.fillStyle = '#021810';
  ctx.beginPath();
  ctx.arc(rx, ry + r, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = isBreached ? '#ef4444' : '#10b981';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Concentric Nautical Range Rings
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(rx, ry + r, r * 0.33, 0, Math.PI * 2);
  ctx.arc(rx, ry + r, r * 0.66, 0, Math.PI * 2);
  ctx.stroke();

  // Crosshairs
  ctx.beginPath();
  ctx.moveTo(rx - r, ry + r);
  ctx.lineTo(rx + r, ry + r);
  ctx.moveTo(rx, ry);
  ctx.lineTo(rx, ry + r * 2);
  ctx.stroke();

  // 60 FPS Rotating Radial Sweep Beam
  const sweepAngle = (frame * (isDiving ? 0.08 : 0.04)) % (Math.PI * 2);

  // Phosphor persistence tail
  const tailGrad = ctx.createRadialGradient(rx, ry + r, 0, rx, ry + r, r);
  tailGrad.addColorStop(0, 'rgba(52, 211, 153, 0.4)');
  tailGrad.addColorStop(1, 'rgba(5, 150, 105, 0)');
  ctx.fillStyle = tailGrad;
  ctx.beginPath();
  ctx.moveTo(rx, ry + r);
  ctx.arc(rx, ry + r, r, sweepAngle - 0.5, sweepAngle);
  ctx.closePath();
  ctx.fill();

  // Sweep Leading Line
  ctx.strokeStyle = isBreached ? '#f87171' : '#6ee7b7';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(rx, ry + r);
  ctx.lineTo(rx + Math.cos(sweepAngle) * r, ry + r + Math.sin(sweepAngle) * r);
  ctx.stroke();

  // Dynamic Acoustic Sonar Blips
  const blip1Angle = 1.2;
  const blipDiff1 = Math.abs((sweepAngle - blip1Angle + Math.PI * 2) % (Math.PI * 2));
  if (blipDiff1 < 1.0) {
    const blipAlpha = 1.0 - blipDiff1;
    ctx.fillStyle = `rgba(251, 191, 36, ${blipAlpha})`;
    ctx.fillRect(rx + 18, ry + r - 12, 3, 3);
  }

  const blip2Angle = 3.6;
  const blipDiff2 = Math.abs((sweepAngle - blip2Angle + Math.PI * 2) % (Math.PI * 2));
  if (blipDiff2 < 1.0) {
    const blipAlpha = 1.0 - blipDiff2;
    ctx.fillStyle = `rgba(239, 68, 68, ${blipAlpha})`;
    ctx.fillRect(rx - 16, ry + r + 16, 3, 3);
  }

  // Label
  ctx.font = '6px "Press Start 2P", monospace';
  ctx.fillStyle = isBreached ? '#f87171' : '#34d399';
  ctx.fillText('SONAR 360°', rx - 26, ry + r * 2 + 12);

  ctx.restore();
}

/**
 * 3. Draw Top Arcade Telemetry Header Bar
 */
export function drawTopArcadeTelemetryBar(
  ctx: CanvasRenderingContext2D,
  balance: number,
  depth: number
) {
  // Top Header Background
  ctx.fillStyle = '#040b17';
  ctx.fillRect(0, 0, 960, 32);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, 30, 960, 2);

  ctx.font = 'bold 8px "Press Start 2P", monospace';

  // Game Title
  ctx.fillStyle = '#f59e0b';
  ctx.fillText('DEPTH CHARGE // MARIANA 11,000M', 14, 20);

  // Certified RTP Indicator
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`RTP: ${CERTIFIED_RTP}`, 420, 20);

  // Player Balance / Credits
  ctx.fillStyle = '#34d399';
  ctx.fillText(`1UP: $${balance.toFixed(2)}`, 580, 20);

  // Live Depth & Pressure
  const atm = Math.round(1 + (depth / 10));
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`DEPTH: ${Math.round(depth)}M [${atm}ATM]`, 740, 20);
}

/**
 * 4. Draw Retro CRT Micro-Scanlines Shader & Corner Vignette
 */
export function drawCrtScanlinesAndVignette(ctx: CanvasRenderingContext2D) {
  ctx.save();

  // 1px Alternating Horizontal Scanlines (12% opacity)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  for (let y = 32; y < 480; y += 2) {
    ctx.fillRect(0, y, 960, 1);
  }

  // Corner Vignette Shadow (Arcade CRT Glass Curvature)
  const vigGrad = ctx.createRadialGradient(480, 256, 360, 480, 256, 560);
  vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vigGrad.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
  ctx.fillStyle = vigGrad;
  ctx.fillRect(0, 32, 960, 448);

  ctx.restore();
}

/**
 * 5. Draw Hull Breach Implosion Warning Banner
 */
export function drawBreachImplosionBanner(
  ctx: CanvasRenderingContext2D,
  depth: number,
  frame: number
) {
  ctx.save();
  const bx = 340;
  const by = 210;
  const bw = 300;
  const bh = 70;

  // Flash border
  const flash = Math.floor(frame / 6) % 2 === 0;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
  ctx.fillRect(bx, by, bw, bh);
  ctx.strokeStyle = flash ? '#ef4444' : '#7f1d1d';
  ctx.lineWidth = 3;
  ctx.strokeRect(bx, by, bw, bh);

  ctx.font = 'bold 8px "Press Start 2P", monospace';
  ctx.fillStyle = '#ef4444';
  ctx.fillText('! HULL IMPLOSION DETECTED !', bx + 22, by + 26);

  ctx.font = '6px "Press Start 2P", monospace';
  ctx.fillStyle = '#fca5a5';
  ctx.fillText(`CRITICAL PRESSURE AT ${Math.round(depth)} METERS`, bx + 22, by + 44);
  ctx.fillText('HULL STRESS EXCEEDED VESSEL RATING', bx + 22, by + 56);

  ctx.restore();
}

/**
 * 6. Draw Grand Jackpot Challenger Deep Celebration Banner
 */
export function drawJackpotVictoryBanner(
  ctx: CanvasRenderingContext2D,
  frame: number
) {
  ctx.save();
  const bx = 300;
  const by = 190;
  const bw = 380;
  const bh = 85;

  const glow = Math.sin(frame * 0.1) * 0.3 + 0.7;
  ctx.fillStyle = 'rgba(3, 7, 18, 0.96)';
  ctx.fillRect(bx, by, bw, bh);
  ctx.strokeStyle = `rgba(245, 158, 11, ${glow})`;
  ctx.lineWidth = 3;
  ctx.strokeRect(bx, by, bw, bh);

  ctx.font = 'bold 9px "Press Start 2P", monospace';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText('★ CHALLENGER DEEP CONQUERED! ★', bx + 26, by + 30);

  ctx.font = 'bold 11px "Press Start 2P", monospace';
  ctx.fillStyle = '#34d399';
  ctx.fillText('14.024x GRAND JACKPOT', bx + 58, by + 52);

  ctx.font = '7px "Press Start 2P", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('11,000 METERS // OCEANIC VOID REACHED', bx + 24, by + 70);

  ctx.restore();
}
