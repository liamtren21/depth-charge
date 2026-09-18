# Depth Charge: 16-Bit Neo-Geo Arcade Pixel Art Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the visual presentation of Depth Charge into an authentic, visually stunning 16-bit Neo-Geo / Dave the Diver grade arcade experience with procedural multi-tone dithered submarine sprites, 5-layer parallax ocean biomes (caustics, galleon shipwreck, black smokers, abyssal leviathan), CRT scanline shaders, and integrated tactical naval HUD.

**Architecture:** Split procedural canvas graphics into dedicated modular renderers (`pixelSubmarineRenderer.ts`, `oceanBiomesRenderer.ts`, `tacticalHudRenderer.ts`) managed by the central 60 FPS loop in `PixelSubmarineGame.tsx`, preserving the exact 2,048-state on-chain casino engine and certified 96.000000% RTP.

**Tech Stack:** React 19, TypeScript, HTML5 Canvas 2D (pure procedural pixel rendering, zero CSS drawing hacks), Web Audio API, Tailwind CSS, Vite.

---

## File Structure

- **Create**:
  - `src/graphics/pixelSubmarineRenderer.ts`: High-fidelity 16-bit bathyscaphe sprite (3-tone metallic dithering, industrial rivets, geodesic dome with animated diver pilot, 4-frame rotating brass propellers, dynamic pitch tilt, volumetric searchlight cone).
  - `src/graphics/oceanBiomesRenderer.ts`: 5 distinct parallax ocean biomes (sunlit water caustics & godrays, bioluminescent jellyfish with sine-wave tentacles, 18th-century galleon shipwreck & anglerfish, hydrothermal black smokers, hadal magma trench with distant Abyssal Leviathan silhouette).
  - `src/graphics/tacticalHudRenderer.ts`: Diegetic naval HUD (hazard chevrons, LED status lamps, cryptographic roll verification telemetry, 360° phosphor CRT sonar PPI radar, top arcade telemetry bar, CRT scanline overlay).
- **Modify**:
  - `src/components/PixelSubmarineGame.tsx`: Integrate modular renderers into the 60 FPS animation loop, connect bottom arcade control deck with retro LED scoreboard and glowing submerge button.
- **Test/Verify**:
  - `scripts/verify-rtp.mjs` & `scripts/test_dive_simulation_e2e.mjs`: Regression test suites for mathematical integrity.
  - Chrome DevTools MCP: Full visual inspection on `http://localhost:3302/`.

---

### Task 1: High-Fidelity 16-Bit Bathyscaphe Sprite Renderer

**Files:**
- Create: `src/graphics/pixelSubmarineRenderer.ts`

- [ ] **Step 1: Implement `pixelSubmarineRenderer.ts` with 3-tone metallic shading, rivets, animated diver, and volumetric spotlight**
  - High-visibility yellow Trieste hull with highlight, midtone, and deep shadow.
  - Rivet seams along plate junctions.
  - Animated diver pilot inside cyan observation dome.
  - 4-frame brass propeller rotation with trailing bubble wake.
  - Volumetric radial searchlight illuminating particles.

- [ ] **Step 2: Verify compilation with `npx tsc --noEmit`**
  Run: `npx tsc --noEmit`
  Expected: No TypeScript errors.

- [ ] **Step 3: Commit**
  Run: `git add src/graphics/pixelSubmarineRenderer.ts && git commit -m "feat(graphics): implement high-fidelity 16-bit bathyscaphe sprite renderer"`

---

### Task 2: 5-Layer Parallax Ocean Biomes & Abyssal Leviathan Renderer

**Files:**
- Create: `src/graphics/oceanBiomesRenderer.ts`

- [ ] **Step 1: Implement `oceanBiomesRenderer.ts` with procedural caustics, fauna, shipwrecks, and leviathan**
  - Stage 1: Water caustics, sine godrays, coral reef, schooling fish.
  - Stage 2: Twilight ocean, marine snow, bioluminescent siphonophores with sinuous tentacles.
  - Stage 3: Midnight blackness, 18th-century galleon shipwreck, glowing anglerfish.
  - Stage 4: Mariana Hadal canyon walls, hydrothermal black smokers with billowing particle smoke plumes, giant isopods.
  - Stage 5: Challenger Deep void floor, glowing magma fissures, distant Abyssal Leviathan silhouette.

- [ ] **Step 2: Verify compilation with `npx tsc --noEmit`**
  Run: `npx tsc --noEmit`
  Expected: No TypeScript errors.

- [ ] **Step 3: Commit**
  Run: `git add src/graphics/oceanBiomesRenderer.ts && git commit -m "feat(graphics): implement 5-layer parallax ocean biomes and leviathan renderer"`

---

### Task 3: Tactical In-Game HUD, Sonar Scope & CRT Scanlines Renderer

**Files:**
- Create: `src/graphics/tacticalHudRenderer.ts`

- [ ] **Step 1: Implement `tacticalHudRenderer.ts` with diegetic glass HUD, sonar, and scanline shader**
  - Hadal Depth Gate ladder with hazard chevrons, LED status jewel lamps, and cryptographic roll verification bytes.
  - 360° PPI CRT Sonar radar scope with sweeping phosphor beam and terrain echo blips.
  - Top arcade telemetry bar.
  - Micro-scanlines (1px alternating scanline overlay) and corner vignette.
  - Breach warning and jackpot celebration banners.

- [ ] **Step 2: Verify compilation with `npx tsc --noEmit`**
  Run: `npx tsc --noEmit`
  Expected: No TypeScript errors.

- [ ] **Step 3: Commit**
  Run: `git add src/graphics/tacticalHudRenderer.ts && git commit -m "feat(graphics): implement tactical naval HUD, sonar scope and CRT scanline overlay"`

---

### Task 4: Integrate Modular Renderers into PixelSubmarineGame & Bottom Arcade Deck

**Files:**
- Modify: `src/components/PixelSubmarineGame.tsx`

- [ ] **Step 1: Refactor `PixelSubmarineGame.tsx` to use modular renderers**
  - Connect `pixelSubmarineRenderer`, `oceanBiomesRenderer`, and `tacticalHudRenderer` in the 60 FPS loop.
  - Maintain interactive bottom arcade deck with glowing coin buttons, retro LED scoreboard, and dive trigger.
  - Ensure zero text overlap and responsive aspect ratio.

- [ ] **Step 2: Verify build and tests**
  Run: `npm run build && npm test`
  Expected: Clean build and certified 96.000000% RTP with 0 delta.

- [ ] **Step 3: Commit**
  Run: `git add src/components/PixelSubmarineGame.tsx && git commit -m "refactor: integrate 16-bit modular pixel art renderers into PixelSubmarineGame"`

---

### Task 5: Visual Verification, Production Deployment & GitHub Synchronization

**Files:**
- Modify: `walkthrough.md`
- Modify: `README.md` (if any visual links need updating)

- [ ] **Step 1: Visual inspection via Chrome DevTools MCP**
  - Start local dev server if needed.
  - Capture screenshots at surface idle, dive descent, hull breach, and jackpot states.
  - Verify crisp 16-bit pixel art, CRT scanlines, and fluid animations.

- [ ] **Step 2: Deploy to Vercel Production**
  Run: `vercel --prod --yes`
  Expected: Successful deployment with clean live URL.

- [ ] **Step 3: Push to GitHub**
  Run: `git push origin main`
  Expected: Updated repository on `https://github.com/liamtren21/depth-charge`.

- [ ] **Step 4: Update walkthrough.md with final screenshots and results**
