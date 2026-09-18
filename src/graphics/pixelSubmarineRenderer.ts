/**
 * 16-Bit Neo-Geo Style Bathyscaphe Submarine Sprite Renderer
 * Powered by high-definition 16-bit pixel art assets with dynamic physics,
 * volumetric searchlight cone, and structural breach effects.
 */

import { assetManager } from './assetLoader';

export interface SubmarineRenderOptions {
  depth: number;
  frame: number;
  isDiving: boolean;
  isBreached: boolean;
}

export function draw16BitSubmarine(
  ctx: CanvasRenderingContext2D,
  options: SubmarineRenderOptions
) {
  const { frame, isDiving, isBreached } = options;

  // Center position of submarine
  const cx = 480;
  // Natural buoyancy gentle bobbing
  const bobbing = Math.sin(frame * 0.03) * 3;
  const cy = 265 + bobbing;

  // Dynamic pitch tilt: dives nose-down by 6 degrees, tilts down when breached
  let tilt = 0;
  if (isBreached) {
    tilt = 0.22 + Math.sin(frame * 0.08) * 0.04; // sinking nose-first
  } else if (isDiving) {
    tilt = 0.09 + Math.sin(frame * 0.06) * 0.02; // diving attitude
  } else {
    tilt = Math.sin(frame * 0.025) * 0.015; // gentle idle tilt
  }

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tilt);

  // -------------------------------------------------------------
  // 1. DUAL VOLUMETRIC SEARCHLIGHT BEAMS (Foreground Illumination)
  // -------------------------------------------------------------
  if (!isBreached) {
    ctx.save();
    const lightConeGrad = ctx.createRadialGradient(38, -12, 4, 200, 10, 240);
    lightConeGrad.addColorStop(0, 'rgba(254, 240, 138, 0.60)');
    lightConeGrad.addColorStop(0.25, 'rgba(253, 224, 71, 0.35)');
    lightConeGrad.addColorStop(0.65, 'rgba(56, 189, 248, 0.14)');
    lightConeGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');

    ctx.fillStyle = lightConeGrad;
    ctx.beginPath();
    ctx.moveTo(38, -16);
    ctx.lineTo(360, -55);
    ctx.lineTo(380, 85);
    ctx.lineTo(38, -4);
    ctx.closePath();
    ctx.fill();

    // Hot-spot core beam
    const coreGrad = ctx.createLinearGradient(38, -10, 220, 10);
    coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    coreGrad.addColorStop(0.35, 'rgba(254, 240, 138, 0.45)');
    coreGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.moveTo(38, -14);
    ctx.lineTo(240, -25);
    ctx.lineTo(250, 35);
    ctx.lineTo(38, -8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // -------------------------------------------------------------
  // 2. COUNTER-ROTATING BRASS PROPELLER STREAMING BUBBLE WAKES
  // -------------------------------------------------------------
  const propX = -84;
  const propY = 8;
  const wakeCount = isDiving ? 4 : 2;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  for (let w = 0; w < wakeCount; w++) {
    const wx = propX - 8 - (frame * 1.5 + w * 12) % 40;
    const wy = propY + Math.sin(frame * 0.1 + w) * 5;
    ctx.fillRect(Math.floor(wx), Math.floor(wy), 2, 2);
  }

  // -------------------------------------------------------------
  // 3. MAIN BATHYSCAPHE SPRITE
  // -------------------------------------------------------------
  const subImg = assetManager.getImage('submarine');
  if (subImg) {
    // Render the high-definition 16-bit arcade submarine asset
    const sw = 176;
    const sh = 113;
    ctx.drawImage(subImg, -sw / 2, -sh / 2, sw, sh);
  } else {
    // Procedural fallback
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-50, -10, 100, 25);
  }

  // -------------------------------------------------------------
  // 4. HULL STRESS FRACTURE ON BREACH
  // -------------------------------------------------------------
  if (isBreached) {
    ctx.save();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, -5);
    ctx.lineTo(5, 8);
    ctx.lineTo(15, -2);
    ctx.moveTo(2, 6);
    ctx.lineTo(0, 18);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}
