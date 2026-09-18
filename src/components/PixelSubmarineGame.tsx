import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DEPTH_ZONES, MULTIPLIERS_TABLE, WAGER_PRESETS, CERTIFIED_RTP } from '../constants/zones';
import { subAudio } from '../audio/ProceduralSubAudio';
import { IntelModal } from './IntelModal';
import { Volume2, VolumeX, HelpCircle, Waves } from 'lucide-react';

export const PixelSubmarineGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game Play States
  const [balance, setBalance] = useState<number>(100.00);
  const [wager, setWager] = useState<number>(1.00);
  const [isDiving, setIsDiving] = useState<boolean>(false);
  const [isBreached, setIsBreached] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [clearedCount, setClearedCount] = useState<number>(0);
  const [rollBytes, setRollBytes] = useState<number[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isIntelOpen, setIsIntelOpen] = useState<boolean>(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);

  // Animation & Physics Refs
  const depthMetersRef = useRef<number>(0);
  const targetDepthMetersRef = useRef<number>(0);
  const isDivingRef = useRef<boolean>(false);
  const isBreachedRef = useRef<boolean>(false);
  const clearedCountRef = useRef<number>(0);
  const rollBytesRef = useRef<number[]>([]);
  const screenShakeRef = useRef<number>(0);
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; size: number; color: string; life: number; maxLife: number }>>([]);
  const bubblesRef = useRef<Array<{ x: number; y: number; speed: number; size: number; wobble: number }>>([]);
  const seaCreaturesRef = useRef<Array<{ x: number; y: number; speed: number; type: 'fish' | 'jelly' | 'angler' | 'isopod'; color: string; size: number }>>([]);

  // Sync refs with state
  useEffect(() => {
    isDivingRef.current = isDiving;
  }, [isDiving]);
  useEffect(() => {
    isBreachedRef.current = isBreached;
  }, [isBreached]);
  useEffect(() => {
    clearedCountRef.current = clearedCount;
  }, [clearedCount]);
  useEffect(() => {
    rollBytesRef.current = rollBytes;
  }, [rollBytes]);

  // Toggle Mute
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    subAudio.setMuted(next);
  };

  // Trigger Submerge Dive
  const startDive = async () => {
    if (isDiving || balance < wager) return;

    // Deduct wager
    setBalance(prev => prev - wager);
    setIsDiving(true);
    setIsBreached(false);
    setClearedCount(0);
    setCurrentStage(0);
    setPayoutAmount(0);
    depthMetersRef.current = 0;
    targetDepthMetersRef.current = 0;

    // Audio triggers
    subAudio.startAmbient();
    subAudio.playDiveKlaxon();
    await new Promise(r => setTimeout(r, 500));
    subAudio.playBallastVent();

    // 5 independent random bytes [0..255]
    const rolls: number[] = [];
    const cryptoObj = window.crypto || (window as unknown as { msCrypto: Crypto }).msCrypto;
    const array = new Uint8Array(5);
    cryptoObj.getRandomValues(array);
    for (let i = 0; i < 5; i++) {
      rolls.push(array[i]);
    }
    setRollBytes(rolls);

    let survivedStages = 0;

    for (let stageIdx = 0; stageIdx < 5; stageIdx++) {
      setCurrentStage(stageIdx);
      const zone = DEPTH_ZONES[stageIdx];
      targetDepthMetersRef.current = zone.depthMeters;
      const roll = rolls[stageIdx];
      const passed = roll < zone.threshold;

      // Wait for submarine descent animation
      await new Promise(r => setTimeout(r, 1100));

      if (passed) {
        survivedStages = stageIdx + 1;
        setClearedCount(survivedStages);
        subAudio.playSonarPing(0.8 + stageIdx * 0.1);
        subAudio.playMechanicalTick();

        if (stageIdx >= 2) {
          subAudio.playHullGroan((stageIdx - 1) * 0.35);
        }

        // Zone 5 Challenger Deep Grand Jackpot!
        if (stageIdx === 4) {
          const win = wager * MULTIPLIERS_TABLE[5]; // 14.024x
          setPayoutAmount(win);
          setBalance(prev => prev + win);
          subAudio.playJackpotSurfaced();
          spawnWinParticles();
        }

        await new Promise(r => setTimeout(r, 650));
      } else {
        // Hull breached at this stage!
        setIsBreached(true);
        screenShakeRef.current = 24; // trigger pixel screen shake
        subAudio.playHullBreach();
        spawnBreachExplosion();

        // Award partial return if cleared >= 2
        if (survivedStages >= 2) {
          const win = wager * MULTIPLIERS_TABLE[survivedStages];
          setPayoutAmount(win);
          setBalance(prev => prev + win);
        }

        break;
      }
    }

    setIsDiving(false);
  };

  const spawnBreachExplosion = useCallback(() => {
    // Spawn 80 pixel explosion particles
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 8;
      particlesRef.current.push({
        x: 480,
        y: 270,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: 3 + Math.random() * 4,
        color: ['#ef4444', '#f97316', '#fbbf24', '#ffffff'][Math.floor(Math.random() * 4)],
        life: 0,
        maxLife: 30 + Math.random() * 20,
      });
    }
  }, []);

  const spawnWinParticles = useCallback(() => {
    // Spawn golden coin & confetti particles
    for (let i = 0; i < 100; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 1 + Math.random() * 6;
      particlesRef.current.push({
        x: 480,
        y: 270,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 2,
        size: 3 + Math.random() * 3,
        color: ['#34d399', '#fde047', '#f59e0b', '#38bdf8', '#ffffff'][Math.floor(Math.random() * 5)],
        life: 0,
        maxLife: 45 + Math.random() * 30,
      });
    }
  }, []);

  // Initialize Sea Creatures & Ambient Bubbles
  useEffect(() => {
    // Spawn ambient bubbles
    const bArr: Array<{ x: number; y: number; speed: number; size: number; wobble: number }> = [];
    for (let i = 0; i < 40; i++) {
      bArr.push({
        x: Math.random() * 960,
        y: Math.random() * 540,
        speed: 0.8 + Math.random() * 1.5,
        size: 2 + Math.floor(Math.random() * 3),
        wobble: Math.random() * Math.PI * 2,
      });
    }
    bubblesRef.current = bArr;

    // Spawn ambient pixel creatures across depth layers
    const cArr: Array<{ x: number; y: number; speed: number; type: 'fish' | 'jelly' | 'angler' | 'isopod'; color: string; size: number }> = [];
    for (let i = 0; i < 18; i++) {
      cArr.push({
        x: Math.random() * 960,
        y: 60 + Math.random() * 420,
        speed: (Math.random() > 0.5 ? 1 : -1) * (0.6 + Math.random() * 1.2),
        type: i < 8 ? 'fish' : (i < 13 ? 'jelly' : (i < 16 ? 'angler' : 'isopod')),
        color: ['#38bdf8', '#f43f5e', '#a855f7', '#fbbf24', '#2dd4bf'][i % 5],
        size: 4 + Math.floor(Math.random() * 4),
      });
    }
    seaCreaturesRef.current = cArr;
  }, []);

  // Main 60 FPS Canvas Game Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 0;

    const render = () => {
      frameCount++;

      // Smooth depth interpolation
      const diff = targetDepthMetersRef.current - depthMetersRef.current;
      depthMetersRef.current += diff * 0.06;

      // Update screen shake
      let shakeX = 0;
      let shakeY = 0;
      if (screenShakeRef.current > 0) {
        shakeX = (Math.random() - 0.5) * screenShakeRef.current;
        shakeY = (Math.random() - 0.5) * screenShakeRef.current;
        screenShakeRef.current *= 0.88;
        if (screenShakeRef.current < 0.5) screenShakeRef.current = 0;
      }

      ctx.save();
      ctx.translate(shakeX, shakeY);

      // Disable anti-aliasing for genuine crisp pixel art
      ctx.imageSmoothingEnabled = false;

      // 1. Draw Depth-Adaptive Ocean Background Biomes
      drawOceanBiomes(ctx, depthMetersRef.current, frameCount);

      // 2. Draw Ambient Sea Creatures & Bubbles
      drawSeaCreaturesAndBubbles(ctx, depthMetersRef.current, frameCount, seaCreaturesRef.current, bubblesRef.current, isDivingRef.current);

      // 3. Draw The Detailed Pixel Art Submarine
      drawPixelSubmarine(ctx, depthMetersRef.current, frameCount, isDivingRef.current, isBreachedRef.current);

      // 4. Draw Active Particle Bursts (Explosions / Win Confetti)
      drawParticles(ctx, particlesRef.current);

      // 5. Draw In-Game Integrated Tactical Depth Gate Rail (Left HUD)
      drawDepthGateRail(ctx, depthMetersRef.current, clearedCountRef.current, rollBytesRef.current, isDivingRef.current, isBreachedRef.current);

      // 6. Draw Mini Pixel CRT Sonar Radar (Top-Right HUD)
      drawMiniPixelRadar(ctx, frameCount, isDivingRef.current, isBreachedRef.current);

      // 7. Draw Top Arcade Telemetry Header Bar
      drawTopArcadeHeader(ctx, balance, depthMetersRef.current, isDivingRef.current);

      // 8. Draw Bottom Integrated Arcade Control Deck Bezel
      drawBottomArcadeDeck(ctx, wager, payoutAmount, isDivingRef.current, isBreachedRef.current, clearedCountRef.current, frameCount);

      // 9. Draw Big Center Event Banner if Breached or Jackpot
      if (isBreachedRef.current) {
        drawBreachBanner(ctx, depthMetersRef.current, frameCount);
      } else if (clearedCountRef.current === 5) {
        drawJackpotBanner(ctx, frameCount);
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [balance, wager, payoutAmount]);

  return (
    <div className="relative w-full h-full min-h-screen bg-[#02050c] flex flex-col items-center justify-center p-1 sm:p-3 select-none overflow-hidden font-mono">
      {/* Authentic Retro Arcade Cabinet Border / Frame */}
      <div className="relative w-full max-w-[1020px] aspect-[16/9.4] bg-[#070d18] border-4 border-[#1e293b] rounded-lg shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
        {/* Crisp Pixel Canvas */}
        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          className="w-full h-full object-contain"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Clickable Overlay Controls on the Bottom Deck */}
        <div className="absolute bottom-2 inset-x-3 z-30 flex items-center justify-between pointer-events-auto px-2">
          {/* Wager Presets as Arcade Coins */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className="text-[10px] text-amber-400 font-bold hidden md:inline tracking-wider">COIN:</span>
            {WAGER_PRESETS.map((amt) => (
              <button
                key={amt}
                onClick={() => !isDiving && setWager(amt)}
                disabled={isDiving}
                className={`px-2 sm:px-2.5 py-1 rounded text-[10px] sm:text-xs font-black transition-all border ${
                  wager === amt
                    ? 'bg-amber-500 text-slate-950 border-yellow-200 shadow-[0_0_10px_#f59e0b]'
                    : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-amber-400 hover:text-white'
                } ${isDiving ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
              >
                ${amt.toFixed(2)}
              </button>
            ))}
          </div>

          {/* Retro Digital Status / Payout Readout */}
          <div className="hidden md:flex items-center gap-2 bg-[#02050e]/95 border border-[#1e293b] rounded px-3 py-1 shadow-inner">
            <div className="flex flex-col">
              <span className="text-[7px] text-slate-500 uppercase tracking-widest font-bold">STATUS / PAYOUT</span>
              {payoutAmount > 0 ? (
                <span className="text-[10px] text-emerald-400 font-black animate-pulse tracking-wide">
                  WIN +${payoutAmount.toFixed(2)} ({MULTIPLIERS_TABLE[clearedCount]?.toFixed(2) || '0.00'}x)
                </span>
              ) : isBreached ? (
                <span className="text-[10px] text-rose-500 font-bold tracking-wide">
                  HULL BREACH
                </span>
              ) : isDiving ? (
                <span className="text-[10px] text-amber-400 font-bold tracking-wide animate-pulse">
                  DIVING GATE {currentStage + 1}/5
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 font-bold tracking-wide">
                  JACKPOT: 14.024x
                </span>
              )}
            </div>
          </div>

          {/* Big Retro Arcade SUBMERGE / DIVE Button */}
          <button
            onClick={startDive}
            disabled={isDiving || balance < wager}
            className={`px-6 sm:px-10 py-2.5 sm:py-3 rounded font-black text-xs sm:text-sm tracking-widest uppercase transition-all flex items-center gap-2 border-2 shadow-2xl ${
              isDiving
                ? 'bg-amber-950 border-amber-500 text-amber-400 cursor-wait animate-pulse'
                : balance < wager
                ? 'bg-slate-900 border-slate-700 text-slate-600 cursor-not-allowed'
                : 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 border-yellow-200 shadow-[0_0_25px_rgba(245,158,11,0.7)] cursor-pointer active:scale-95'
            }`}
          >
            <Waves className={`w-4 h-4 ${isDiving ? 'animate-spin' : ''}`} />
            <span>{isDiving ? 'DIVING...' : '★ SUBMERGE // DIVE ★'}</span>
          </button>

          {/* Intel / Audio Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsIntelOpen(true)}
              className="p-1.5 rounded bg-slate-900 border border-slate-700 hover:border-amber-400 text-amber-300 transition-all cursor-pointer"
              title="Mission Intel & Rules"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={handleToggleMute}
              className="p-1.5 rounded bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 transition-all cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Intel / Provable Fairness Modal */}
      <IntelModal
        isOpen={isIntelOpen}
        onClose={() => setIsIntelOpen(false)}
      />
    </div>
  );
};

// -------------------------------------------------------------
// PROCEDURAL PIXEL ART RENDER FUNCTIONS (Pure Canvas, Zero CSS)
// -------------------------------------------------------------

/**
 * 1. Draw Depth-Adaptive Ocean Background Biomes
 */
function drawOceanBiomes(ctx: CanvasRenderingContext2D, depth: number, frame: number) {
  // Depth progress 0.0 (surface) to 1.0 (11,000m)
  const frac = Math.min(depth / 11000, 1.0);

  // Dynamic sky & ocean gradients based on depth
  const grad = ctx.createLinearGradient(0, 30, 0, 480);
  if (frac < 0.15) {
    // Surface to 1,000m: Sunlit Cyan to Deep Blue
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(0.4, '#0369a1');
    grad.addColorStop(1, '#082f49');
  } else if (frac < 0.4) {
    // 1,000m - 3,000m: Twilight Deep Navy
    grad.addColorStop(0, '#082f49');
    grad.addColorStop(0.5, '#0c2238');
    grad.addColorStop(1, '#041221');
  } else if (frac < 0.7) {
    // 3,000m - 6,000m: Abyssal Midnight
    grad.addColorStop(0, '#041221');
    grad.addColorStop(0.6, '#020b14');
    grad.addColorStop(1, '#01060c');
  } else {
    // 6,000m - 11,000m: Mariana Hadal Trench Void
    grad.addColorStop(0, '#020813');
    grad.addColorStop(0.5, '#05040a');
    grad.addColorStop(1, '#080309');
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 30, 960, 450);

  // Sunlight Rays Shimmer on Surface (if depth < 1500m)
  if (depth < 1500) {
    const rayAlpha = Math.max(0, (1 - depth / 1500) * 0.25);
    ctx.fillStyle = `rgba(186, 230, 253, ${rayAlpha})`;
    for (let i = 0; i < 5; i++) {
      const x = 180 + i * 140 + Math.sin(frame * 0.02 + i) * 20;
      ctx.beginPath();
      ctx.moveTo(x, 30);
      ctx.lineTo(x + 80, 480);
      ctx.lineTo(x + 120, 480);
      ctx.lineTo(x + 20, 30);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Draw Distant Rocky Trench Walls in Background
  ctx.fillStyle = frac > 0.6 ? '#130c17' : '#081726';
  // Left cliff
  ctx.beginPath();
  ctx.moveTo(0, 100);
  ctx.lineTo(120, 180);
  ctx.lineTo(80, 290);
  ctx.lineTo(140, 390);
  ctx.lineTo(60, 480);
  ctx.lineTo(0, 480);
  ctx.closePath();
  ctx.fill();

  // Right cliff
  ctx.beginPath();
  ctx.moveTo(960, 80);
  ctx.lineTo(840, 190);
  ctx.lineTo(890, 300);
  ctx.lineTo(810, 400);
  ctx.lineTo(900, 480);
  ctx.lineTo(960, 480);
  ctx.closePath();
  ctx.fill();

  // Glowing Magma Fissures in Deep Hadal Trench (depth > 6000m)
  if (depth > 6000) {
    const glow = Math.sin(frame * 0.08) * 0.3 + 0.7;
    ctx.strokeStyle = `rgba(239, 68, 68, ${glow * 0.8})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(40, 320);
    ctx.lineTo(70, 360);
    ctx.lineTo(50, 410);
    ctx.moveTo(920, 280);
    ctx.lineTo(870, 340);
    ctx.lineTo(900, 410);
    ctx.stroke();
  }

  // Hydrothermal Vent Chimneys on Seabed (if depth > 9000m)
  if (depth > 9000) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(400, 440, 35, 40);
    ctx.fillRect(620, 430, 45, 50);

    // Chimney smoke particles
    ctx.fillStyle = 'rgba(249, 115, 22, 0.4)';
    for (let k = 0; k < 6; k++) {
      const sy = 430 - ((frame * 2 + k * 18) % 80);
      ctx.fillRect(412 + Math.sin(sy * 0.05) * 8, sy, 6, 6);
      ctx.fillRect(638 + Math.cos(sy * 0.05) * 10, sy, 8, 8);
    }
  }
}

/**
 * 2. Draw Sea Creatures & Ambient Bubbles
 */
function drawSeaCreaturesAndBubbles(
  ctx: CanvasRenderingContext2D,
  depth: number,
  frame: number,
  creatures: Array<{ x: number; y: number; speed: number; type: string; color: string; size: number }>,
  bubbles: Array<{ x: number; y: number; speed: number; size: number; wobble: number }>,
  isDiving: boolean
) {
  // Rising bubbles
  ctx.fillStyle = 'rgba(224, 242, 254, 0.75)';
  bubbles.forEach((b) => {
    b.y -= b.speed * (isDiving ? 2.5 : 1.0);
    b.x += Math.sin(frame * 0.05 + b.wobble) * 0.4;
    if (b.y < 35) {
      b.y = 475;
      b.x = Math.random() * 960;
    }
    ctx.fillRect(Math.round(b.x), Math.round(b.y), b.size, b.size);
  });

  // Sea creatures
  creatures.forEach((c) => {
    c.x += c.speed;
    if (c.x > 980) c.x = -20;
    if (c.x < -20) c.x = 980;

    const cy = c.y + Math.sin(frame * 0.04 + c.x * 0.02) * 8;
    const px = Math.round(c.x);
    const py = Math.round(cy);

    if (c.type === 'fish' && depth < 3500) {
      // 8-bit swimming fish
      ctx.fillStyle = c.color;
      ctx.fillRect(px, py, 8, 4);
      ctx.fillRect(px + (c.speed > 0 ? -4 : 8), py - 1, 3, 6); // tail
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + (c.speed > 0 ? 5 : 1), py + 1, 2, 2); // eye
    } else if (c.type === 'jelly' && depth >= 1000 && depth <= 7000) {
      // Pulsing bioluminescent jellyfish
      const pulse = Math.sin(frame * 0.1) * 2;
      ctx.fillStyle = c.color;
      ctx.fillRect(px - 4, py - 4 + pulse, 9, 6);
      // Tentacles
      ctx.fillRect(px - 3, py + 2 + pulse, 2, 8);
      ctx.fillRect(px, py + 2 + pulse, 2, 10);
      ctx.fillRect(px + 3, py + 2 + pulse, 2, 7);
    } else if (c.type === 'angler' && depth >= 4000) {
      // Abyssal Anglerfish with glowing lure
      ctx.fillStyle = '#334155';
      ctx.fillRect(px, py, 14, 10);
      ctx.fillRect(px + 10, py + 2, 4, 6); // teeth
      // Glowing lure
      const lureGlow = Math.sin(frame * 0.15) > 0 ? '#fde047' : '#eab308';
      ctx.fillStyle = lureGlow;
      ctx.fillRect(px + 16, py - 6, 4, 4);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px + 6, py);
      ctx.lineTo(px + 16, py - 4);
      ctx.stroke();
    }
  });
}

/**
 * 3. Draw The Detailed Pixel Art Submarine
 */
function drawPixelSubmarine(
  ctx: CanvasRenderingContext2D,
  _depth: number,
  frame: number,
  isDiving: boolean,
  isBreached: boolean
) {
  // Center submarine anchor coordinates
  const cx = 520;
  const bobY = 260 + (isDiving ? Math.sin(frame * 0.12) * 8 : Math.sin(frame * 0.05) * 12);
  const cy = Math.round(bobY);

  ctx.save();
  ctx.translate(cx, cy);

  // Pitch angle: dive downward (-14 deg) or roll on breach
  if (isDiving) {
    ctx.rotate(0.22 + Math.sin(frame * 0.1) * 0.03);
  } else if (isBreached) {
    ctx.rotate(-0.35 + (Math.random() - 0.5) * 0.1);
  } else {
    ctx.rotate(Math.sin(frame * 0.04) * 0.04);
  }

  // --- Volumetric Searchlight Cone ---
  const beamGrad = ctx.createLinearGradient(60, 0, 320, 0);
  beamGrad.addColorStop(0, 'rgba(103, 232, 249, 0.45)');
  beamGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.18)');
  beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

  ctx.fillStyle = beamGrad;
  ctx.beginPath();
  ctx.moveTo(56, -4);
  ctx.lineTo(340, -75);
  ctx.lineTo(340, 85);
  ctx.lineTo(56, 14);
  ctx.closePath();
  ctx.fill();

  // --- Submarine Main Hull (16-bit Bathyscaphe Yellow) ---
  // Lower dark steel ballast keel
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-65, 8, 120, 10);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-60, 5, 110, 6);

  // Main yellow cylindrical hull
  ctx.fillStyle = '#ca8a04'; // shadow
  ctx.fillRect(-60, -16, 115, 24);
  ctx.fillStyle = '#eab308'; // body
  ctx.fillRect(-58, -18, 110, 22);
  ctx.fillStyle = '#fef08a'; // top highlight
  ctx.fillRect(-54, -20, 100, 4);

  // Front hemispherical nosecone
  ctx.fillStyle = '#ca8a04';
  ctx.fillRect(52, -14, 10, 18);
  ctx.fillStyle = '#eab308';
  ctx.fillRect(58, -10, 8, 12);
  ctx.fillRect(64, -6, 6, 6);

  // Rear tail cone
  ctx.fillStyle = '#854d0e';
  ctx.fillRect(-70, -12, 12, 16);
  ctx.fillRect(-78, -8, 10, 10);

  // Structural Bronze Flange Rings
  ctx.fillStyle = '#78350f';
  [-40, -15, 10, 35].forEach((rx) => {
    ctx.fillRect(rx, -21, 5, 29);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(rx + 1, -21, 3, 29);
    ctx.fillStyle = '#78350f';
  });

  // Conning Tower (Sail / Bridge)
  ctx.fillStyle = '#ca8a04';
  ctx.fillRect(-8, -36, 26, 18);
  ctx.fillStyle = '#eab308';
  ctx.fillRect(-6, -38, 22, 18);
  ctx.fillStyle = '#1e293b'; // bridge cap
  ctx.fillRect(-7, -40, 24, 4);

  // Periscope & Radio Antenna Masts
  ctx.fillStyle = '#64748b';
  ctx.fillRect(4, -54, 3, 16);
  ctx.fillRect(1, -54, 8, 3); // periscope optics
  ctx.fillRect(-4, -48, 2, 10); // antenna

  // Red Emergency Beacon Lamp
  const beaconOn = isBreached ? (Math.floor(frame / 6) % 2 === 0) : (Math.floor(frame / 20) % 2 === 0);
  ctx.fillStyle = beaconOn ? '#ef4444' : '#450a0a';
  ctx.fillRect(-7, -43, 4, 4);

  // Pilot Cockpit Observation Dome (Glowing Cyan Glass with Diver Silhouette)
  ctx.fillStyle = '#0369a1';
  ctx.fillRect(20, -10, 18, 14);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(22, -8, 14, 10);
  ctx.fillStyle = '#bae6fd'; // specular shine
  ctx.fillRect(24, -6, 4, 4);
  // Pilot silhouette inside
  ctx.fillStyle = '#082f49';
  ctx.fillRect(26, -5, 6, 6);

  // Forward Dual Searchlight Projector Heads
  ctx.fillStyle = '#d97706';
  ctx.fillRect(50, -4, 8, 7);
  ctx.fillRect(50, 6, 8, 7);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(56, -3, 3, 5);
  ctx.fillRect(56, 7, 3, 5);

  // Hydroplanes / Diving Fins
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(12, 1, 14, 4);
  ctx.fillRect(-52, 1, 14, 4);
  ctx.fillRect(-72, -18, 10, 8); // top rudder

  // Spinning Twin Stern Propellers (4-frame pixel animation)
  const propFrame = Math.floor(frame / (isDiving ? 2 : 5)) % 4;
  ctx.fillStyle = '#d97706';
  ctx.fillRect(-82, -4, 5, 6); // shaft

  // Animated blade positions
  if (propFrame === 0) {
    ctx.fillRect(-85, -14, 4, 24);
  } else if (propFrame === 1) {
    ctx.fillRect(-86, -11, 4, 18);
  } else if (propFrame === 2) {
    ctx.fillRect(-85, -5, 4, 8);
  } else {
    ctx.fillRect(-86, -11, 4, 18);
  }

  // Bubble Wake streaming from propeller
  ctx.fillStyle = 'rgba(240, 249, 255, 0.85)';
  const bubbleSpd = isDiving ? 4 : 2;
  for (let b = 0; b < 6; b++) {
    const bx = -92 - ((frame * bubbleSpd + b * 22) % 120);
    const by = -2 + Math.sin(bx * 0.1) * 6;
    ctx.fillRect(bx, by, 3 + (b % 3), 3 + (b % 3));
  }

  ctx.restore();
}

/**
 * 4. Draw Active Particle Bursts (Explosions / Win Confetti)
 */
function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; color: string; life: number; maxLife: number }>
) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life++;

    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);

    if (p.life >= p.maxLife) {
      particles.splice(i, 1);
    }
  }
}

/**
 * 5. Draw In-Game Integrated Tactical Depth Gate Rail (Left HUD)
 */
function drawDepthGateRail(
  ctx: CanvasRenderingContext2D,
  depth: number,
  clearedCount: number,
  rollBytes: number[],
  isDiving: boolean,
  isBreached: boolean
) {
  // Bounding box for left in-game HUD
  const rx = 18;
  const ry = 42;
  const rw = 250;
  const rh = 405;

  // Dark retro arcade HUD panel with scanline grid
  ctx.fillStyle = 'rgba(2, 6, 18, 0.88)';
  ctx.fillRect(rx, ry, rw, rh);
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2;
  ctx.strokeRect(rx, ry, rw, rh);

  // Header
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(rx, ry, rw, 22);
  ctx.font = 'bold 9px "Press Start 2P", monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('HADAL DEPTH GATES', rx + 10, ry + 15);

  // 5 Depth Gate Checkpoints
  DEPTH_ZONES.forEach((zone, idx) => {
    const gy = ry + 32 + idx * 72;
    const isCleared = clearedCount > idx;
    const isCurrent = isDiving && depth >= (idx > 0 ? DEPTH_ZONES[idx - 1].depthMeters : 0) && depth < zone.depthMeters;
    const isBreachedHere = isBreached && clearedCount === idx;
    const roll = rollBytes[idx];

    // Gate Box
    ctx.fillStyle = isBreachedHere
      ? 'rgba(153, 27, 27, 0.85)'
      : isCleared
      ? 'rgba(6, 78, 59, 0.85)'
      : isCurrent
      ? 'rgba(146, 64, 14, 0.85)'
      : 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(rx + 8, gy, rw - 16, 64);

    ctx.strokeStyle = isBreachedHere
      ? '#ef4444'
      : isCleared
      ? '#10b981'
      : isCurrent
      ? '#f59e0b'
      : '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(rx + 8, gy, rw - 16, 64);

    // Gate Title & Depth
    ctx.font = 'bold 9px "Press Start 2P", monospace';
    ctx.fillStyle = isCleared ? '#6ee7b7' : isBreachedHere ? '#fca5a5' : '#f8fafc';
    ctx.fillText(`${zone.depthMeters}M`, rx + 16, gy + 16);

    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(zone.zone, rx + 16, gy + 28);

    // Multiplier & Status
    ctx.font = 'bold 9px "Press Start 2P", monospace';
    ctx.fillStyle = idx === 4 ? '#fde047' : zone.multiplier > 0 ? '#34d399' : '#94a3b8';
    ctx.fillText(zone.multiplier > 0 ? `${zone.multiplier.toFixed(2)}x` : '0.00x', rx + 175, gy + 16);

    // Roll result or threshold
    ctx.font = '8px "Press Start 2P", monospace';
    if (roll !== undefined) {
      const pass = roll < zone.threshold;
      ctx.fillStyle = pass ? '#34d399' : '#f87171';
      ctx.fillText(`R:${roll} ${pass ? '✔' : '✖'}`, rx + 16, gy + 50);
    } else {
      ctx.fillStyle = '#64748b';
      ctx.fillText(`< ${zone.threshold} (T:${idx + 1})`, rx + 16, gy + 50);
    }

    // Status icon
    ctx.fillText(isCleared ? '✔' : isBreachedHere ? '✖' : isCurrent ? '▶' : '•', rx + 205, gy + 50);
  });
}

/**
 * 6. Draw Mini Pixel CRT Sonar Radar (Top-Right HUD)
 */
function drawMiniPixelRadar(
  ctx: CanvasRenderingContext2D,
  frame: number,
  isDiving: boolean,
  isBreached: boolean
) {
  const rx = 820;
  const ry = 42;
  const r = 52;

  // Radar circular scope background
  ctx.save();
  ctx.fillStyle = '#02180d';
  ctx.beginPath();
  ctx.arc(rx + r, ry + r, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Range rings
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(rx + r, ry + r, r * 0.35, 0, Math.PI * 2);
  ctx.arc(rx + r, ry + r, r * 0.7, 0, Math.PI * 2);
  ctx.stroke();

  // Crosshairs
  ctx.beginPath();
  ctx.moveTo(rx, ry + r);
  ctx.lineTo(rx + r * 2, ry + r);
  ctx.moveTo(rx + r, ry);
  ctx.lineTo(rx + r, ry + r * 2);
  ctx.stroke();

  // Sweeping Radar Line
  const sweepAngle = (frame * (isDiving ? 0.08 : 0.04)) % (Math.PI * 2);
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(rx + r, ry + r);
  ctx.lineTo(rx + r + Math.cos(sweepAngle) * r, ry + r + Math.sin(sweepAngle) * r);
  ctx.stroke();

  // Echo blip
  const blipX = rx + r + Math.cos(1.8) * (r * 0.6);
  const blipY = ry + r + Math.sin(1.8) * (r * 0.6);
  ctx.fillStyle = isBreached ? '#ef4444' : '#34d399';
  ctx.fillRect(Math.round(blipX), Math.round(blipY), 4, 4);

  // Center Sub position
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(rx + r - 2, ry + r - 2, 4, 4);

  // Label
  ctx.font = '7px "Press Start 2P", monospace';
  ctx.fillStyle = '#34d399';
  ctx.fillText('SONAR 360°', rx + 14, ry + r * 2 + 14);

  ctx.restore();
}

/**
 * 7. Draw Top Arcade Telemetry Header Bar
 */
function drawTopArcadeHeader(
  ctx: CanvasRenderingContext2D,
  balance: number,
  depth: number,
  _isDiving: boolean
) {
  // Top Header Background
  ctx.fillStyle = '#040b17';
  ctx.fillRect(0, 0, 960, 32);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, 30, 960, 2);

  ctx.font = 'bold 9px "Press Start 2P", monospace';

  // Game Title
  ctx.fillStyle = '#f59e0b';
  ctx.fillText('DEPTH CHARGE // MARIANA 11,000M', 16, 20);

  // Certified RTP Indicator
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`RTP: ${CERTIFIED_RTP}`, 430, 20);

  // Player Balance / Credits
  ctx.fillStyle = '#34d399';
  ctx.fillText(`1UP: $${balance.toFixed(2)}`, 580, 20);

  // Live Depth & Pressure
  const atm = Math.round(1 + (depth / 10));
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`DEPTH: ${Math.round(depth)}M [${atm}ATM]`, 740, 20);
}

/**
 * 8. Draw Bottom Integrated Arcade Control Deck Bezel
 */
function drawBottomArcadeDeck(
  ctx: CanvasRenderingContext2D,
  _wager: number,
  _payout: number,
  _isDiving: boolean,
  _isBreached: boolean,
  _clearedCount: number,
  _frame: number
) {
  // Bottom Deck Frame
  const dy = 480;
  ctx.fillStyle = '#040914';
  ctx.fillRect(0, dy, 960, 60);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, dy, 960, 2);

  // Subtle Arcade Deck Bezel Grid Accent
  ctx.fillStyle = '#0c1a2f';
  for (let x = 12; x < 950; x += 32) {
    ctx.fillRect(x, dy + 6, 16, 1);
  }
}

/**
 * 9. Draw Breach & Implosion Arcade Banner
 */
function drawBreachBanner(ctx: CanvasRenderingContext2D, depth: number, frame: number) {
  const flash = Math.floor(frame / 8) % 2 === 0;
  ctx.fillStyle = 'rgba(69, 10, 10, 0.92)';
  ctx.fillRect(280, 210, 460, 95);
  ctx.strokeStyle = flash ? '#ef4444' : '#b91c1c';
  ctx.lineWidth = 3;
  ctx.strokeRect(280, 210, 460, 95);

  ctx.font = 'bold 12px "Press Start 2P", monospace';
  ctx.fillStyle = '#fecaca';
  ctx.textAlign = 'center';
  ctx.fillText('! HULL IMPLOSION DETECTED !', 510, 245);

  ctx.font = '8px "Press Start 2P", monospace';
  ctx.fillStyle = '#f87171';
  ctx.fillText(`CRITICAL PRESSURE AT ${Math.round(depth)} METERS`, 510, 268);
  ctx.fillText('HULL STRESS EXCEEDED VESSEL RATING', 510, 285);
  ctx.textAlign = 'left';
}

/**
 * 10. Draw Challenger Deep Grand Jackpot Banner
 */
function drawJackpotBanner(ctx: CanvasRenderingContext2D, frame: number) {
  const flash = Math.floor(frame / 6) % 2 === 0;
  ctx.fillStyle = 'rgba(6, 78, 59, 0.94)';
  ctx.fillRect(260, 200, 500, 105);
  ctx.strokeStyle = flash ? '#fde047' : '#10b981';
  ctx.lineWidth = 4;
  ctx.strokeRect(260, 200, 500, 105);

  ctx.font = 'bold 13px "Press Start 2P", monospace';
  ctx.fillStyle = '#fef08a';
  ctx.textAlign = 'center';
  ctx.fillText('★ CHALLENGER DEEP CONQUERED ★', 510, 238);

  ctx.font = '10px "Press Start 2P", monospace';
  ctx.fillStyle = '#34d399';
  ctx.fillText('14.0240x GRAND JACKPOT SECURED!', 510, 265);

  ctx.font = '8px "Press Start 2P", monospace';
  ctx.fillStyle = '#a7f3d0';
  ctx.fillText('11,000 METERS OCEAN FLOOR REACHED', 510, 288);
  ctx.textAlign = 'left';
}
