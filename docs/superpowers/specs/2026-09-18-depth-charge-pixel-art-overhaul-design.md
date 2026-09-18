# Design Spec: Depth Charge — 16-Bit Neo-Geo Arcade Pixel Art Overhaul

- **Target Project**: Depth Charge // Challenger Deep 11,000M
- **Repository**: `https://github.com/liamtren21/depth-charge`
- **Date**: 2026-09-18
- **Status**: Approved by User

---

## 1. Problem Statement & Motivation
The previous implementation of *Depth Charge* relied on basic primitive `fillRect` canvas calls for the submarine and environment. While functionally complete and mathematically sound (certified 96% RTP with zero-wei drift), the visual presentation lacked depth, shading, and the high-production polish expected of high-end retro arcade classics (such as *Metal Slug*, *Dave the Diver*, or Neo-Geo games). 

This design spec outlines the comprehensive visual and shader overhaul to elevate *Depth Charge* into an authentic, visually stunning 16-bit arcade experience within a single, unified cabinet screen.

---

## 2. Core Architecture & Visual Systems

### A. Submarine Bathyscaphe 16-Bit Pixel Art Sprite
1. **Multi-Tone Dithering & Metallic Shading**:
   - High-visibility deep-sea yellow reinforced titanium hull with three-tone color stepping (sunlit gold highlight, industrial yellow midtone, dark ochre/umber shadow).
   - Industrial rivet seams lining hull panels.
   - Conning tower with periscope optics reflecting a cyan glint.
   - Geodesic observation dome rendered with three-tone translucent glass shading, containing an animated diver pilot sprite with a rhythmic blinking helmet light.
   - Dual counter-rotating brass propellers with a 4-frame rotation cycle producing dynamic trailing pixel bubble wakes.
2. **Organic Physics**:
   - Natural idle buoyancy bobbing (sine wave oscillation).
   - Dynamic dive pitch: vessel pitches 6-8° downward during descent and levels out at depth gates.
3. **Volumetric Dynamic Searchlight Cone**:
   - Dual-layer radial alpha gradient cone illuminating the dark abyss.
   - Suspended marine snow particles dynamically illuminate with high brightness when passing through the light beam.

### B. 5-Layer Parallax Ocean Biomes
1. **Stage 1 (0 – 1,000m: Sunlight Zone)**:
   - Animated procedural water caustics and godrays undulating across the water column.
   - Swimming multi-colored reef fish schools and detailed coral silhouettes at the shelf base.
2. **Stage 2 (1,000m – 3,000m: Twilight Zone)**:
   - Deep indigo ocean transition with dense marine snow drift.
   - Semi-transparent bioluminescent siphonophores and jellyfish with soft, undulating tentacles (sine wave kinematics).
3. **Stage 3 (3,000m – 6,000m: Midnight Zone)**:
   - Pitch void black ocean, illuminated exclusively by the bathyscaphe searchlight.
   - Sunken 18th-century galleon shipwreck resting on trench rock shelves with shattered masts and barnacle-encrusted timber.
   - Predatory anglerfish with glowing bioluminescent lure pulsing in the darkness.
4. **Stage 4 (6,000m – 8,500m: Hadal Trench)**:
   - Vertical Mariana Trench canyon walls with layered parallax depth.
   - Hydrothermal black smoker chimneys venting billowing pixel smoke plumes and sulfur bubble clusters.
   - Deep-sea giant isopods crawling across rock shelves.
5. **Stage 5 (8,500m – 11,000m: Oceanic Void Floor / Challenger Deep)**:
   - Trench floor featuring glowing red/amber magma fissures and thermal vents.
   - **Abyssal Leviathan**: A massive ancient sea creature silhouette gliding slowly across the distant background with pulsing yellow eyes, delivering a grand, cinematic atmosphere.

### C. Tactical In-Game HUD & Arcade Control Deck
1. **Hadal Depth Gate Ladder (Left HUD)**:
   - Semi-transparent industrial naval telemetry HUD integrated into the viewport.
   - Industrial hazard chevrons, LED status jewel lamps (standby amber, clear emerald green, breach crimson red).
   - Real-time cryptographic roll byte verification telemetry (`R: 73 < 192 ✔`).
2. **360° PPI CRT Sonar Scope (Top-Right HUD)**:
   - 60 FPS sweeping radial beam with exponential phosphor persistence trail.
   - Concentric nautical range rings (3km, 6km, 8.5km, 11km).
   - Sonar blips corresponding to trench walls and marine fauna.
3. **Bottom Arcade Deck & LED Scoreboard**:
   - Arcade coin wager selectors ($0.10, $0.50, $1.00, $5.00, $10.00, $25.00) with tactile metallic bevels.
   - Dual-row retro LED scoreboard: `STATUS`, `WIN: +$X.XX (X.XXx)`, and `CERTIFIED RTP: 96.000000%`.
   - Glowing retro arcade `★ SUBMERGE // DIVE ★` button with pulsating amber edge lighting.
4. **Retro CRT Arcade Shader & Cabinet Bezel**:
   - Micro-scanlines (1px alternating scanline layer at 12% opacity).
   - Subtle vignette around the cabinet corners.
   - Phosphor bloom on bright emissive elements (searchlight beam, neon LEDs, explosion sparks).

### D. Dynamic Event FX
1. **Hull Implosion Breach**:
   - Multi-directional screen shake (24px decay).
   - 80-particle metallic shrapnel and explosion blast.
   - Crimson flashing warning banner: `! HULL IMPLOSION DETECTED // CRITICAL PRESSURE AT XXXX METERS !`.
   - Automated insurance salvage payout credited if survived >= 2 gates.
2. **Grand Jackpot Surfacing**:
   - 120-particle golden coin and confetti shower.
   - Victory klaxon fanfare and celebratory golden banner: `★ CHALLENGER DEEP CONQUERED! 14.024X GRAND JACKPOT ★`.

---

## 3. Mathematical Integrity & Smart Contract Compliance
- **RTP Target**: Exactly 96.000000% (0-wei drift across 2,048 coprime states).
- **Thresholds**: `[192, 160, 128, 96, 64]` out of 256.
- **Multipliers**: `[0x, 0x, 0.50x, 1.40x, 5.00x, 14.024x]`.
- **Contract**: `contracts/DepthCharge.sol` adhering to `ICasinoGameV2` on Base L2.
- **Verification Suites**: `npm run test:rtp` and `npm run test:e2e` remain mandatory regression gates.

---

## 4. Verification Plan
- **Automated Tests**:
  - `npm run test:rtp` &rarr; 0 delta, exact 96.000000% theoretical RTP.
  - `npm run test:e2e` &rarr; 100,000-round Monte Carlo simulation converging to expected EV.
- **Visual & UI Verification**:
  - Local dev server verification via Chrome DevTools MCP.
  - Full dive sequence testing (surface idle, descent through 5 biomes, breach particle explosion, jackpot victory confetti).
  - Production build verification (`npm run build`).
  - Vercel production deployment and live testing.
