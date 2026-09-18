/**
 * 16-Bit Neo-Geo Style Bathyscaphe Submarine Procedural Sprite Renderer
 * Features 3-tone metallic dithering, industrial rivets, geodesic observation dome,
 * animated diver pilot, 4-frame brass propellers, and volumetric searchlight beam.
 */

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
  // Natural buoyancy bobbing
  const bobbing = Math.sin(frame * 0.04) * 3;
  const cy = 265 + bobbing;

  // Dynamic pitch tilt: dives nose-down by 6 degrees, tilts down when breached
  let tilt = 0;
  if (isBreached) {
    tilt = 0.22 + Math.sin(frame * 0.1) * 0.06; // sinking nose-first
  } else if (isDiving) {
    tilt = 0.09 + Math.sin(frame * 0.08) * 0.02; // diving attitude
  } else {
    tilt = Math.sin(frame * 0.03) * 0.015; // gentle idle tilt
  }

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tilt);

  // -------------------------------------------------------------
  // 1. DUAL VOLUMETRIC SEARCHLIGHT BEAMS (Foreground Illumination)
  // -------------------------------------------------------------
  if (!isBreached) {
    ctx.save();
    const lightConeGrad = ctx.createRadialGradient(55, 6, 4, 180, 20, 240);
    lightConeGrad.addColorStop(0, 'rgba(254, 240, 138, 0.55)');
    lightConeGrad.addColorStop(0.2, 'rgba(253, 224, 71, 0.30)');
    lightConeGrad.addColorStop(0.6, 'rgba(56, 189, 248, 0.12)');
    lightConeGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');

    ctx.fillStyle = lightConeGrad;
    ctx.beginPath();
    ctx.moveTo(52, 2);
    ctx.lineTo(340, -45);
    ctx.lineTo(360, 85);
    ctx.lineTo(52, 14);
    ctx.closePath();
    ctx.fill();

    // Hot-spot core beam
    const coreGrad = ctx.createLinearGradient(52, 8, 200, 14);
    coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    coreGrad.addColorStop(0.3, 'rgba(254, 240, 138, 0.4)');
    coreGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.moveTo(52, 6);
    ctx.lineTo(220, -10);
    ctx.lineTo(230, 30);
    ctx.lineTo(52, 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // -------------------------------------------------------------
  // 2. COUNTER-ROTATING BRASS PROPELLERS & BUBBLE WAKES
  // -------------------------------------------------------------
  const propFrame = Math.floor(frame * (isDiving ? 0.6 : 0.25)) % 4;
  const propX = -58;
  const propY = 6;

  // Propeller shaft mounting bracket
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(propX + 2, propY - 4, 6, 8);
  ctx.fillStyle = '#475569';
  ctx.fillRect(propX + 4, propY - 3, 3, 6);

  // Rotating brass blades (4-frame cycle)
  ctx.fillStyle = '#f59e0b';
  if (propFrame === 0) {
    ctx.fillRect(propX - 3, propY - 14, 4, 28);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(propX - 2, propY - 12, 2, 24);
  } else if (propFrame === 1) {
    ctx.fillRect(propX - 4, propY - 10, 6, 20);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(propX - 3, propY - 8, 3, 16);
  } else if (propFrame === 2) {
    ctx.fillRect(propX - 5, propY - 4, 8, 8);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(propX - 4, propY - 2, 6, 4);
  } else {
    ctx.fillRect(propX - 4, propY - 10, 6, 20);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(propX - 2, propY - 8, 3, 16);
  }

  // Propeller hub nut
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(propX - 1, propY - 2, 4, 4);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(propX, propY - 1, 2, 2);

  // -------------------------------------------------------------
  // 3. MAIN BATHYSCAPHE HULL (16-Bit 3-Tone Shading & Rivets)
  // -------------------------------------------------------------
  // Dark structural outline / silhouette
  ctx.fillStyle = '#451a03';
  ctx.fillRect(-52, -13, 102, 38);
  ctx.fillRect(-48, -15, 94, 42);
  ctx.fillRect(48, -7, 6, 26); // Nose contour

  // Underside deep shadow plate
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-50, 12, 98, 12);
  ctx.fillRect(-44, 20, 86, 6);

  // Lower midtone armor plating
  ctx.fillStyle = '#b45309';
  ctx.fillRect(-50, 4, 98, 12);

  // Main industrial yellow body plate
  ctx.fillStyle = '#d97706';
  ctx.fillRect(-50, -8, 98, 14);

  // Upper sunlit metallic highlight deck
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(-48, -12, 94, 8);
  ctx.fillStyle = '#fde047';
  ctx.fillRect(-44, -14, 86, 3); // crisp specular highlight stripe

  // Industrial Plate Seams (Vertical Paneling)
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-28, -13, 2, 36);
  ctx.fillRect(-2, -13, 2, 36);
  ctx.fillRect(24, -13, 2, 36);

  // Industrial Rivets (2x2 metallic dots along panel seams)
  ctx.fillStyle = '#fef08a';
  const rivetXs = [-44, -20, 6, 32];
  for (const rx of rivetXs) {
    ctx.fillRect(rx, -10, 2, 2);
    ctx.fillRect(rx, 2, 2, 2);
    ctx.fillRect(rx, 14, 2, 2);
  }

  // Heavy Ballast Keel / Sled Runners at base
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-42, 24, 82, 5);
  ctx.fillStyle = '#334155';
  ctx.fillRect(-40, 25, 78, 2);
  // Skid mounting struts
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-32, 20, 4, 5);
  ctx.fillRect(0, 20, 4, 5);
  ctx.fillRect(28, 20, 4, 5);

  // Reinforced Nose Bumper & High-Pressure Lamp Mount
  ctx.fillStyle = '#334155';
  ctx.fillRect(48, -2, 6, 16);
  ctx.fillStyle = '#64748b';
  ctx.fillRect(50, 0, 3, 12);
  ctx.fillStyle = '#fef08a'; // Searchlight bulb lens
  ctx.fillRect(52, 3, 3, 6);

  // -------------------------------------------------------------
  // 4. CONNING TOWER SAIL & PERISCOPE ARRAY
  // -------------------------------------------------------------
  // Conning tower base
  ctx.fillStyle = '#451a03';
  ctx.fillRect(-12, -31, 24, 18);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(-10, -29, 20, 16);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(-8, -29, 6, 15); // highlight on tower
  ctx.fillStyle = '#78350f';
  ctx.fillRect(6, -29, 3, 15); // tower shadow

  // Hatch wheel on top of sail
  ctx.fillStyle = '#64748b';
  ctx.fillRect(-6, -32, 12, 2);

  // Optical Periscope Mast
  ctx.fillStyle = '#334155';
  ctx.fillRect(-4, -42, 3, 11);
  ctx.fillStyle = '#64748b';
  ctx.fillRect(-6, -44, 7, 3);
  ctx.fillStyle = '#38bdf8'; // periscope optical glass glint
  ctx.fillRect(-1, -43, 2, 2);

  // Communications VLF Radio Antenna Mast
  ctx.fillStyle = '#475569';
  ctx.fillRect(4, -46, 2, 16);
  // Antenna blinking beacon LED
  const beaconBlink = Math.floor(frame / 20) % 2 === 0;
  ctx.fillStyle = beaconBlink ? '#ef4444' : '#7f1d1d';
  ctx.fillRect(3, -48, 4, 3);

  // -------------------------------------------------------------
  // 5. GEODESIC OBSERVATION DOME & ANIMATED DIVER PILOT
  // -------------------------------------------------------------
  const domeX = 14;
  const domeY = -4;
  const domeRadius = 13;

  // Cast-brass porthole frame ring
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.arc(domeX, domeY, domeRadius + 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.arc(domeX, domeY, domeRadius + 1, 0, Math.PI * 2);
  ctx.fill();

  // Glass lens interior (Deep ocean cyan)
  ctx.fillStyle = '#082f49';
  ctx.beginPath();
  ctx.arc(domeX, domeY, domeRadius - 1, 0, Math.PI * 2);
  ctx.fill();

  // Animated Diver Pilot inside dome
  ctx.save();
  ctx.beginPath();
  ctx.arc(domeX, domeY, domeRadius - 2, 0, Math.PI * 2);
  ctx.clip();

  // Diver body / suit
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(domeX - 6, domeY + 2, 12, 10);

  // Diver helmet
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(domeX - 4, domeY - 5, 8, 8);
  // Diver visor
  ctx.fillStyle = '#0369a1';
  ctx.fillRect(domeX - 2, domeY - 3, 6, 4);

  // Helmet HUD light (amber status blink)
  const helmetBlink = Math.floor(frame / 35) % 2 === 0;
  ctx.fillStyle = isBreached ? '#ef4444' : (helmetBlink ? '#fbbf24' : '#0284c7');
  ctx.fillRect(domeX + 1, domeY - 2, 2, 2);

  ctx.restore();

  // Glass Specular Sheen (Curved reflection stripe)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.arc(domeX - 3, domeY - 3, domeRadius - 4, -Math.PI * 0.7, -Math.PI * 0.1);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.stroke();

  // Hull Stress Fracture on Breach
  if (isBreached) {
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(domeX - 4, domeY - 6);
    ctx.lineTo(domeX + 2, domeY);
    ctx.lineTo(domeX + 6, domeY - 4);
    ctx.moveTo(domeX, domeY);
    ctx.lineTo(domeX - 2, domeY + 5);
    ctx.stroke();
  }

  ctx.restore();
}
