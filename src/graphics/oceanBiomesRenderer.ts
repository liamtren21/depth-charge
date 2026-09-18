/**
 * 5-Layer Parallax Ocean Biomes & Atmospheric Deep-Sea Fauna Renderer
 * Features water caustics & godrays, bioluminescent jellyfish with sine tentacles,
 * 18th-century galleon shipwreck, anglerfish, hydrothermal black smokers,
 * hadal magma rifts, and the distant Abyssal Leviathan silhouette at 11,000m.
 */

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
      const rayX = 80 + i * 130 + Math.sin(frame * 0.02 + i) * 25;
      const rayWidth = 45 + Math.sin(frame * 0.03 + i * 2) * 15;
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
  // 3. BIOME 3: SUNKEN 18TH-CENTURY GALLEON SHIPWRECK (2,500m - 5,500m)
  // -------------------------------------------------------------
  if (depth > 2200 && depth < 6200) {
    const wreckProgress = (depth - 2200) / 4000;
    const wreckY = 460 - (wreckProgress * 220);
    drawSunkenGalleon(ctx, 620, wreckY, frame);
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
  if (depth > 7800) {
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
  // Deep reef rock base
  ctx.fillStyle = '#164e63';
  ctx.fillRect(580, baseCoralY, 380, 50);

  // Multi-colored coral branches
  const corals = [
    { x: 620, color: '#f43f5e', h: 32 },
    { x: 670, color: '#fbbf24', h: 42 },
    { x: 740, color: '#a855f7', h: 38 },
    { x: 810, color: '#2dd4bf', h: 48 },
    { x: 890, color: '#f97316', h: 34 },
  ];

  for (const c of corals) {
    ctx.fillStyle = c.color;
    const sway = Math.sin(frame * 0.04 + c.x) * 3;
    // Coral stem
    ctx.fillRect(c.x + sway, baseCoralY - c.h, 6, c.h);
    ctx.fillRect(c.x - 6 + sway * 1.2, baseCoralY - c.h + 8, 18, 5);
    ctx.fillRect(c.x - 4 + sway * 1.4, baseCoralY - c.h, 14, 4);
  }
  ctx.restore();
}

/**
 * Sunken 18th-Century Galleon Shipwreck resting on a shelf
 */
function drawSunkenGalleon(ctx: CanvasRenderingContext2D, gx: number, gy: number, frame: number) {
  ctx.save();
  // Hull silhouette (rotted oak wood)
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.moveTo(gx - 80, gy + 20);
  ctx.lineTo(gx + 110, gy + 10);
  ctx.lineTo(gx + 130, gy - 25);
  ctx.lineTo(gx - 40, gy - 15);
  ctx.closePath();
  ctx.fill();

  // Planking texture & barnacles
  ctx.fillStyle = '#292524';
  ctx.fillRect(gx - 60, gy - 10, 150, 6);
  ctx.fillRect(gx - 50, gy, 140, 6);

  // Barnacles & deep-sea bioluminescent algae
  ctx.fillStyle = '#0d9488';
  for (let i = 0; i < 6; i++) {
    const algaGlow = Math.sin(frame * 0.05 + i) * 0.3 + 0.7;
    ctx.globalAlpha = algaGlow;
    ctx.fillRect(gx - 30 + i * 22, gy - 6 + (i % 2) * 8, 3, 3);
  }
  ctx.globalAlpha = 1.0;

  // Snapped Mainmast & Rigging
  ctx.fillStyle = '#44403c';
  ctx.fillRect(gx + 20, gy - 70, 6, 60);
  // Broken tilted mast spar
  ctx.save();
  ctx.translate(gx + 22, gy - 70);
  ctx.rotate(0.5);
  ctx.fillRect(-20, 0, 45, 4);
  ctx.restore();

  // Cannon portholes
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(gx - 20, gy - 4, 8, 8);
  ctx.fillRect(gx + 20, gy - 4, 8, 8);
  ctx.fillRect(gx + 60, gy - 4, 8, 8);

  ctx.restore();
}

/**
 * Hydrothermal Black Smokers venting mineral plumes
 */
function drawHydrothermalSmokers(ctx: CanvasRenderingContext2D, sy: number, frame: number) {
  ctx.save();
  const chimneys = [
    { x: 680, w: 28, h: 90 },
    { x: 820, w: 22, h: 110 },
  ];

  for (const chim of chimneys) {
    // Basalt pillar chimney
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(chim.x, sy - chim.h, chim.w, chim.h + 60);
    ctx.fillStyle = '#292524';
    ctx.fillRect(chim.x + 4, sy - chim.h + 6, chim.w - 8, chim.h + 50);

    // Chimney crater rim
    ctx.fillStyle = '#b45309';
    ctx.fillRect(chim.x - 2, sy - chim.h - 4, chim.w + 4, 6);

    // Billowing Black Smoke Plumes (Procedural particle clusters)
    for (let p = 0; p < 8; p++) {
      const pOffset = (frame * 1.5 + p * 18) % 110;
      const px = chim.x + chim.w / 2 + Math.sin(frame * 0.06 + p) * 14;
      const py = sy - chim.h - pOffset;
      const pSize = 6 + (pOffset * 0.18);
      const alpha = Math.max(0, 1 - pOffset / 110) * 0.55;

      ctx.fillStyle = `rgba(15, 23, 42, ${alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, pSize, 0, Math.PI * 2);
      ctx.fill();

      // Glowing sulfur sparks inside the plume
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

  // Oceanic void seabed sediment
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, floorY, 960, 15);

  // Glowing Magma Fissures
  const fissures = [
    { x1: 340, x2: 430 },
    { x1: 520, x2: 660 },
    { x1: 720, x2: 860 },
  ];

  for (const f of fissures) {
    const pulse = Math.sin(frame * 0.08 + f.x1) * 0.25 + 0.75;
    // Outer red glow
    ctx.fillStyle = `rgba(239, 68, 68, ${0.4 * pulse})`;
    ctx.fillRect(f.x1 - 4, floorY + 2, (f.x2 - f.x1) + 8, 8);

    // Bright core magma line
    ctx.fillStyle = `rgba(245, 158, 11, ${0.9 * pulse})`;
    ctx.fillRect(f.x1, floorY + 4, f.x2 - f.x1, 3);
    ctx.fillStyle = `rgba(254, 240, 138, ${0.95 * pulse})`;
    ctx.fillRect(f.x1 + 10, floorY + 5, (f.x2 - f.x1) - 20, 1);
  }
  ctx.restore();
}

/**
 * Mythical Abyssal Leviathan (Silhouetted colossus at 11,000m)
 */
function drawAbyssalLeviathan(ctx: CanvasRenderingContext2D, depth: number, frame: number) {
  if (depth < 8200) return;

  ctx.save();
  const alpha = Math.min(1.0, (depth - 8200) / 2000);
  ctx.globalAlpha = 0.45 * alpha;

  // Massive slow creature swimming across the distant background
  const lx = ((frame * 0.4) % 1400) - 300;
  const ly = 240 + Math.sin(frame * 0.02) * 16;

  // Massive serpentine body segments
  ctx.fillStyle = '#020617';
  for (let s = 0; s < 12; s++) {
    const segX = lx - s * 22;
    const segY = ly + Math.sin(frame * 0.04 - s * 0.4) * 12;
    const segRadius = 32 - s * 2;
    if (segRadius > 4) {
      ctx.beginPath();
      ctx.arc(segX, segY, segRadius, 0, Math.PI * 2);
      ctx.fill();

      // Dorsal ridge spikes
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(segX, segY - segRadius);
      ctx.lineTo(segX - 8, segY - segRadius - 14);
      ctx.lineTo(segX + 8, segY - segRadius);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Glowing golden Leviathan Eye
  ctx.globalAlpha = 0.85 * alpha;
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(lx + 18, ly - 6, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(lx + 19, ly - 7, 2, 2);

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

  // Shaded inner canyon ridge
  ctx.fillStyle = '#091527';
  ctx.beginPath();
  ctx.moveTo(880, 32);
  ctx.lineTo(855, 170);
  ctx.lineTo(875, 300);
  ctx.lineTo(830, 410);
  ctx.lineTo(860, 480);
  ctx.lineTo(960, 480);
  ctx.lineTo(960, 32);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Ambient Marine Fauna & Bubbles (Siphonophores with sine tentacles, Anglerfish, etc.)
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

  // 1. Bubbles rising with sine wobble
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  for (const b of bubbles) {
    b.y -= isDiving ? b.speed * 2.8 : b.speed;
    b.wobble += 0.05;
    const wx = b.x + Math.sin(b.wobble) * 4;

    if (b.y < 34) {
      b.y = 476;
      b.x = Math.random() * 960;
    }

    ctx.fillRect(Math.floor(wx), Math.floor(b.y), b.size, b.size);
  }

  // 2. Bioluminescent Creatures & Fauna
  for (const c of creatures) {
    c.x += c.speed;
    if (c.x > 980) c.x = -30;
    if (c.x < -30) c.x = 980;

    const cy = c.y + Math.sin(frame * 0.04 + c.x) * 6;

    if (c.type === 'jelly') {
      // Siphonophore / Bioluminescent Jellyfish with sinuous tentacles
      ctx.fillStyle = c.color;
      ctx.beginPath();
      ctx.arc(c.x, cy, c.size, Math.PI, 0); // bell dome
      ctx.fill();

      // Trailing tentacles
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 1;
      for (let t = -2; t <= 2; t++) {
        const tx = c.x + t * 2;
        ctx.beginPath();
        ctx.moveTo(tx, cy);
        const wave = Math.sin(frame * 0.08 + t + c.x * 0.1) * 5;
        ctx.quadraticCurveTo(tx + wave, cy + 12, tx - wave * 0.5, cy + 22);
        ctx.stroke();
      }
    } else if (c.type === 'angler') {
      // Deep-Sea Anglerfish with glowing lure
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(c.x - 10, cy - 6, 20, 12); // body
      // Tail
      ctx.beginPath();
      ctx.moveTo(c.x - 10, cy);
      ctx.lineTo(c.x - 16, cy - 6);
      ctx.lineTo(c.x - 16, cy + 6);
      ctx.closePath();
      ctx.fill();

      // Sharp white teeth
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(c.x + 8, cy - 2, 2, 4);

      // Angler Esca Lure
      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(c.x + 2, cy - 6);
      ctx.quadraticCurveTo(c.x + 10, cy - 18, c.x + 16, cy - 10);
      ctx.stroke();

      // Pulsing Bioluminescent Lure Bulb
      const lurePulse = Math.sin(frame * 0.1) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(254, 240, 138, ${lurePulse})`;
      ctx.beginPath();
      ctx.arc(c.x + 16, cy - 10, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Standard schooling fish
      ctx.fillStyle = c.color;
      ctx.fillRect(c.x - 4, cy - 2, 8, 4);
      // Tail
      ctx.fillRect(c.x - (c.speed > 0 ? 6 : -4), cy - 3, 2, 6);
    }
  }

  ctx.restore();
}
