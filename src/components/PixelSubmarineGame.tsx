import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DEPTH_ZONES, MULTIPLIERS_TABLE, WAGER_PRESETS } from '../constants/zones';
import { subAudio } from '../audio/ProceduralSubAudio';
import { IntelModal } from './IntelModal';
import { Volume2, VolumeX, HelpCircle, Waves } from 'lucide-react';
import { draw16BitSubmarine } from '../graphics/pixelSubmarineRenderer';
import {
  drawOceanBiomes,
  drawFaunaAndBubbles,
  AmbientBubble,
  AmbientCreature
} from '../graphics/oceanBiomesRenderer';
import {
  drawTacticalDepthGateRail,
  drawCrtSonarScope,
  drawTopArcadeTelemetryBar,
  drawCrtScanlinesAndVignette,
  drawBreachImplosionBanner,
  drawJackpotVictoryBanner
} from '../graphics/tacticalHudRenderer';

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
  const bubblesRef = useRef<AmbientBubble[]>([]);
  const seaCreaturesRef = useRef<AmbientCreature[]>([]);

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
      } else {
        // Hull Implosion Breach!
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
    const bArr: AmbientBubble[] = [];
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

    const cArr: AmbientCreature[] = [];
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

      // 1. Draw 5-Layer Parallax Ocean Biomes
      drawOceanBiomes(ctx, depthMetersRef.current, frameCount);

      // 2. Draw Ambient Sea Fauna & Bubbles
      drawFaunaAndBubbles(ctx, depthMetersRef.current, frameCount, seaCreaturesRef.current, bubblesRef.current, isDivingRef.current);

      // 3. Draw The Detailed 16-Bit Bathyscaphe Submarine
      draw16BitSubmarine(ctx, {
        depth: depthMetersRef.current,
        frame: frameCount,
        isDiving: isDivingRef.current,
        isBreached: isBreachedRef.current,
      });

      // 4. Draw Active Particle Bursts (Explosions / Win Confetti)
      drawParticles(ctx, particlesRef.current);

      // 5. Draw Tactical Hadal Depth Gate Rail (Left HUD)
      drawTacticalDepthGateRail(ctx, {
        depth: depthMetersRef.current,
        balance,
        clearedCount: clearedCountRef.current,
        rollBytes: rollBytesRef.current,
        isDiving: isDivingRef.current,
        isBreached: isBreachedRef.current,
        frame: frameCount,
      });

      // 6. Draw 360° PPI CRT Sonar Radar (Top-Right HUD)
      drawCrtSonarScope(ctx, frameCount, isDivingRef.current, isBreachedRef.current);

      // 7. Draw Top Arcade Telemetry Header Bar
      drawTopArcadeTelemetryBar(ctx, balance, depthMetersRef.current);

      // 8. Draw Bottom Integrated Arcade Control Deck Bezel
      drawBottomArcadeDeck(ctx);

      // 9. Draw Event Banner if Breached or Jackpot
      if (isBreachedRef.current) {
        drawBreachImplosionBanner(ctx, depthMetersRef.current, frameCount);
      } else if (clearedCountRef.current === 5) {
        drawJackpotVictoryBanner(ctx, frameCount);
      }

      // 10. Draw Retro CRT Micro-Scanlines Shader & Corner Vignette
      drawCrtScanlinesAndVignette(ctx);

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
// LOCAL HELPER CANVAS FUNCTIONS
// -------------------------------------------------------------

function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; color: string; life: number; maxLife: number }>
) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life++;
    if (p.life >= p.maxLife) {
      particles.splice(i, 1);
      continue;
    }
    const alpha = 1 - p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.globalAlpha = alpha;
    ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
    ctx.globalAlpha = 1.0;
  }
}

function drawBottomArcadeDeck(ctx: CanvasRenderingContext2D) {
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
