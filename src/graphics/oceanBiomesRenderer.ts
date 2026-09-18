/**
 * 5-Layer Parallax Ocean Biomes & Atmospheric Deep-Sea Fauna Renderer
 * Powered by authentic 16-bit pixel art assets for the Galleon Shipwreck and Abyssal Leviathan.
 * Features gentle organic kinematics, water caustics & godrays, hydrothermal black smokers,
 * and hadal magma rifts.
 */

import { assetManager } from './assetLoader';

export interface AmbientBubble {
  x: number;
  y: number;
  speed: number;
  size: number;
  wobble: number;
}

export interface AmbientCreature {
  x: number;
  y: number;
  speed: number;
  type: 'fish' | 'jelly' | 'angler' | 'isopod';
  color: string;
  size: number;
}

export function drawOceanBiomes(
  ctx: CanvasRenderingContext2D,
  depth: number,
  frame: number
) {
  // Depth progress from 0.0 (surface) to 1.0 (11,000m)
  const frac = Math.min(Math.max(depth / 11000, 0), 1.0);

  // -------------------------------------------------------------
  // 1. DYNAMIC OCEAN WATER GRADIENT
  // -------------------------------------------------------------
  const bgGrad = ctx.createLinearGradient(0, 32, 0, 480);
  if (frac < 0.15) {
    // Surface to 1,000m (Sunlight Epipelagic)
    bgGrad.addColorStop(0, '#0284c7');
    bgGrad.addColorStop(0.5, '#0369a1');
    bgGrad.addColorStop(1, '#075985');
  } else if (frac < 0.4) {
    // 1,000m - 3,000m (Twilight Mesopelagic)
    bgGrad.addColorStop(0, '#075985');
    bgGrad.addColorStop(0.5, '#0c2238');
    bgGrad.addColorStop(1, '#081726');
  } else if (frac < 0.7) {
    // 3,000m - 6,000m (Midnight Bathypelagic)
    bgGrad.addColorStop(0, '#081726');
    bgGrad.addColorStop(0.6, '#030814');
    bgGrad.addColorStop(1, '#02040a');
  } else {
    // 6,000m - 11,000m (Hadal Abyss / Challenger Deep)
    bgGrad.addColorStop(0, '#02040a');
    bgGrad.addColorStop(0.5, '#010308');
    bgGrad.addColorStop(1, '#000104');
  }

  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 32, 960, 448);

  // -------------------------------------------------------------
  // 2. BIOME 1: SURFACE SUNLIGHT WATER CAUSTICS & GODRAYS (0 - 1,500m)
  // -------------------------------------------------------------
  if (frac < 0.22) {
    const rayAlpha = Math.max(0, 1 - frac / 0.22);
    ctx.save();
    for (let i = 0; i < 7; i++) {
      const rayX = 80 + i * 130 + Math.sin(frame * 0.015 + i) * 20;
      const rayWidth = 45 + Math.sin(frame * 0.02 + i * 2) * 12;
      const rayGrad = ctx.createLinearGradient(rayX, 32, rayX + 60, 420);
      rayGrad.addColorStop(0, `rgba(255, 255, 255, ${0.25 * rayAlpha})`);
      rayGrad.addColorStop(0.4, `rgba(56, 189, 248, ${0.15 * rayAlpha})`);
      rayGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(rayX, 32);
      ctx.lineTo(rayX + rayWidth, 32);
      ctx.lineTo(rayX + rayWidth + 80, 450);
      ctx.lineTo(rayX + 30, 450);
      ctx.closePath();
      ctx.fill();
    }

    // Coral Reef Shelf at seabed of Sunlight zone
    const coralY = 430 - (depth * 0.06);
    if (coralY < 480 && coralY > 300) {
      drawPixelCoralReef(ctx, coralY, frame);
    }
    ctx.restore();
  }

  // -------------------------------------------------------------
  // 3. BIOME 3: SUNKEN 18TH-CENTURY GALLEON SHIPWRECK (2,500m - 5,800m)
  // -------------------------------------------------------------
  if (depth > 2000 && depth < 6200) {
    const wreckProgress = (depth - 2000) / 4200;
    const wreckY = 460 - (wreckProgress * 200);
    drawSunkenGalleon(ctx, 580, wreckY, frame);
  }

  // -------------------------------------------------------------
  // 4. BIOME 4: HYDROTHERMAL BLACK SMOKERS (5,500m - 9,000m)
  // -------------------------------------------------------------
  if (depth > 5000 && depth < 9500) {
    const smokerProgress = (depth - 5000) / 4500;
    const smokerY = 480 - (smokerProgress * 180);
    drawHydrothermalSmokers(ctx, smokerY, frame);
  }

  // -------------------------------------------------------------
  // 5. BIOME 5: HADAL MAGMA FISSURES & LEVIATHAN (8,000m - 11,000m)
  // -------------------------------------------------------------
  if (depth > 7500) {
    drawHadalMagmaFissures(ctx, frame);
    drawAbyssalLeviathan(ctx, depth, frame);
  }

  // -------------------------------------------------------------
  // 6. MARIANA TRENCH CLIFF WALLS (Layered Parallax)
  // -------------------------------------------------------------
  drawTrenchCanyonWalls(ctx, depth, frac);
}

/**
 * Coral Reef Shelf for Epipelagic Zone
 */
function drawPixelCoralReef(ctx: CanvasRenderingContext2D, baseCoralY: number, frame: number) {
  ctx.save();
  ctx.fillStyle = '#164e63';
  ctx.fillRect(580, baseCoralY, 380, 50);

  const corals = [
    { x: 620, color: '#f43f5e', h: 32 },
    { x: 670, color: '#fbbf24', h: 42 },
    { x: 740, color: '#a855f7', h: 38 },
    { x: 810, color: '#2dd4bf', h: 48 },
    { x: 890, color: '#f97316', h: 34 },
  ];

  for (const c of corals) {
    ctx.fillStyle = c.color;
    const sway = Math.sin(frame * 0.03 + c.x) * 2;
    ctx.fillRect(c.x + sway, baseCoralY - c.h, 6, c.h);
    ctx.fillRect(c.x - 6 + sway * 1.2, baseCoralY - c.h + 8, 18, 5);
  }
  ctx.restore();
}

/**
 * Sunken 18th-Century Galleon Shipwreck (High-Definition 16-Bit Asset)
 */
function drawSunkenGalleon(ctx: CanvasRenderingContext2D, gx: number, gy: number, _frame: number) {
  ctx.save();
  const wreckImg = assetManager.getImage('shipwreck');
  if (wreckImg) {
    // High-definition 16-bit pirate galleon asset
    const ww = 250;
    const wh = 147;
    ctx.drawImage(wreckImg, gx, gy - wh / 2, ww, wh);
  } else {
    // Fallback silhouette
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(gx, gy, 120, 40);
  }
  ctx.restore();
}

/**
 * Hydrothermal Black Smokers venting mineral plumes
 */
function drawHydrothermalSmokers(ctx: CanvasRenderingContext2D, sy: number, frame: number) {
  ctx.save();
  const chimneys = [
    { x: 700, w: 28, h: 90 },
    { x: 840, w: 22, h: 110 },
  ];

  for (const chim of chimneys) {
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(chim.x, sy - chim.h, chim.w, chim.h + 60);
    ctx.fillStyle = '#292524';
    ctx.fillRect(chim.x + 4, sy - chim.h + 6, chim.w - 8, chim.h + 50);

    ctx.fillStyle = '#b45309';
    ctx.fillRect(chim.x - 2, sy - chim.h - 4, chim.w + 4, 6);

    for (let p = 0; p < 7; p++) {
      const pOffset = (frame * 1.2 + p * 20) % 110;
      const px = chim.x + chim.w / 2 + Math.sin(frame * 0.04 + p) * 10;
      const py = sy - chim.h - pOffset;
      const pSize = 5 + (pOffset * 0.16);
      const alpha = Math.max(0, 1 - pOffset / 110) * 0.5;

      ctx.fillStyle = `rgba(15, 23, 42, ${alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, pSize, 0, Math.PI * 2);
      ctx.fill();

      if (p % 2 === 0) {
        ctx.fillStyle = `rgba(245, 158, 11, ${alpha * 1.2})`;
        ctx.fillRect(px - 1, py - 1, 2, 2);
      }
    }
  }
  ctx.restore();
}

/**
 * Hadal Magma Fissures along the trench floor
 */
function drawHadalMagmaFissures(ctx: CanvasRenderingContext2D, frame: number) {
  ctx.save();
  const floorY = 465;

  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, floorY, 960, 15);

  const fissures = [
    { x1: 340, x2: 430 },
    { x1: 520, x2: 660 },
    { x1: 720, x2: 860 },
  ];

  for (const f of fissures) {
    const pulse = Math.sin(frame * 0.05 + f.x1) * 0.2 + 0.8;
    ctx.fillStyle = `rgba(239, 68, 68, ${0.4 * pulse})`;
    ctx.fillRect(f.x1 - 4, floorY + 2, (f.x2 - f.x1) + 8, 8);

    ctx.fillStyle = `rgba(245, 158, 11, ${0.9 * pulse})`;
    ctx.fillRect(f.x1, floorY + 4, f.x2 - f.x1, 3);
  }
  ctx.restore();
}

/**
 * Mythical Abyssal Leviathan (Smooth, Majestic 16-Bit Colossus)
 */
function drawAbyssalLeviathan(ctx: CanvasRenderingContext2D, depth: number, frame: number) {
  if (depth < 7800) return;

  ctx.save();
  const alpha = Math.min(1.0, (depth - 7800) / 2200);
  ctx.globalAlpha = 0.55 * alpha;

  // Gentle, slow, majestic glide across the abyss (zero jittering/shaking)
  const lx = 960 - ((frame * 0.3) % 1500);
  const ly = 160 + Math.sin(frame * 0.012) * 6;

  const levImg = assetManager.getImage('leviathan');
  if (levImg) {
    // Draw the magnificent 16-bit abyssal leviathan asset
    const lw = 340;
    const lh = 158;
    ctx.drawImage(levImg, lx, ly, lw, lh);
  } else {
    // Fallback
    ctx.fillStyle = '#020617';
    ctx.fillRect(lx, ly, 180, 50);
  }

  ctx.restore();
}

/**
 * Mariana Trench Canyon Basalt Walls (Parallax scrolling)
 */
function drawTrenchCanyonWalls(ctx: CanvasRenderingContext2D, _depth: number, frac: number) {
  ctx.save();
  const wallAlpha = Math.min(1.0, frac * 2.2);
  ctx.globalAlpha = wallAlpha;

  // Right trench wall silhouette
  ctx.fillStyle = '#050b14';
  ctx.beginPath();
  ctx.moveTo(850, 32);
  ctx.lineTo(820, 160);
  ctx.lineTo(845, 290);
  ctx.lineTo(790, 390);
  ctx.lineTo(830, 480);
  ctx.lineTo(960, 480);
  ctx.lineTo(960, 32);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Ambient Marine Fauna & Bubbles (Gentle, Natural Swimming Kinematics)
 */
export function drawFaunaAndBubbles(
  ctx: CanvasRenderingContext2D,
  _depth: number,
  frame: number,
  creatures: AmbientCreature[],
  bubbles: AmbientBubble[],
  isDiving: boolean
) {
  ctx.save();

  // 1. Bubbles rising smoothly
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  for (const b of bubbles) {
    b.y -= isDiving ? b.speed * 2.5 : b.speed;
    b.wobble += 0.03;
    const wx = b.x + Math.sin(b.wobble) * 2.5;

    if (b.y < 34) {
      b.y = 476;
      b.x = Math.random() * 960;
    }

    ctx.fillRect(Math.floor(wx), Math.floor(b.y), b.size, b.size);
  }

  // 2. Bioluminescent Creatures with Smooth, Gentle Undulation
  for (const c of creatures) {
    c.x += c.speed;
    if (c.x > 980) c.x = -30;
    if (c.x < -30) c.x = 980;

    // Smooth, gentle 2px vertical drift (fixed: no more violent shaking!)
    const cy = c.y + Math.sin(frame * 0.015 + c.x * 0.01) * 2;

    if (c.type === 'jelly') {
      ctx.fillStyle = c.color;
      ctx.beginPath();
      ctx.arc(c.x, cy, c.size, Math.PI, 0);
      ctx.fill();

      // Soft, natural wave for tentacles
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 1;
      for (let t = -2; t <= 2; t++) {
        const tx = c.x + t * 2;
        ctx.beginPath();
        ctx.moveTo(tx, cy);
        const wave = Math.sin(frame * 0.03 + t + c.x * 0.02) * 2;
        ctx.quadraticCurveTo(tx + wave, cy + 10, tx - wave * 0.5, cy + 18);
        ctx.stroke();
      }
    } else if (c.type === 'angler') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(c.x - 10, cy - 6, 20, 12);
      ctx.beginPath();
      ctx.moveTo(c.x - 10, cy);
      ctx.lineTo(c.x - 16, cy - 6);
      ctx.lineTo(c.x - 16, cy + 6);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(c.x + 8, cy - 2, 2, 4);

      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(c.x + 2, cy - 6);
      ctx.quadraticCurveTo(c.x + 10, cy - 16, c.x + 14, cy - 8);
      ctx.stroke();

      const lurePulse = Math.sin(frame * 0.08) * 0.25 + 0.75;
      ctx.fillStyle = `rgba(254, 240, 138, ${lurePulse})`;
      ctx.beginPath();
      ctx.arc(c.x + 14, cy - 8, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = c.color;
      ctx.fillRect(c.x - 4, cy - 2, 8, 4);
      ctx.fillRect(c.x - (c.speed > 0 ? 6 : -4), cy - 3, 2, 6);
    }
  }

  ctx.restore();
}
