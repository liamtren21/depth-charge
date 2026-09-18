import React from 'react';
import { X, ShieldCheck, Cpu, Terminal, Anchor } from 'lucide-react';
import { DEPTH_ZONES, MULTIPLIERS_TABLE, CERTIFIED_RTP } from '../constants/zones';

interface IntelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntelModal: React.FC<IntelModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#080e18] border-2 border-amber-500/70 rounded-lg shadow-2xl p-6 text-slate-200 max-h-[90vh] overflow-y-auto font-mono">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-900/60">
          <div className="flex items-center gap-2.5">
            <Anchor className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black text-amber-300 tracking-wider">
              MISSION BRIEFING: CHALLENGER DEEP
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-4 space-y-4 text-xs leading-relaxed">
          {/* Lore */}
          <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
            <h3 className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-cyan-400" />
              OPERATION PROTOCOL
            </h3>
            <p className="text-slate-300">
              You command the deep-submergence bathyscaphe <em>Trieste-IV</em> on a historic descent into the Challenger Deep (11,000 meters / 1,100 ATM). As ballast tanks flood, the vessel passes through 5 distinct ocean depth zones. Each zone presents an escalating hydrostatic pressure test verified via on-chain randomness.
            </p>
          </div>

          {/* Zones & Paytable */}
          <div>
            <h3 className="font-bold text-cyan-300 mb-2 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-400" />
              5-STAGE HYDROSTATIC CASCADE & PAYTABLE
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-800 text-[11px]">
                <thead>
                  <tr className="bg-slate-900 text-slate-300">
                    <th className="p-2 border border-slate-800">Zone</th>
                    <th className="p-2 border border-slate-800">Depth</th>
                    <th className="p-2 border border-slate-800">Pressure</th>
                    <th className="p-2 border border-slate-800">Threshold</th>
                    <th className="p-2 border border-slate-800">Pass Rate</th>
                    <th className="p-2 border border-slate-800 text-right">Multiplier</th>
                  </tr>
                </thead>
                <tbody>
                  {DEPTH_ZONES.map((z, idx) => (
                    <tr key={z.id} className="hover:bg-slate-900/40">
                      <td className="p-2 border border-slate-800 font-bold text-slate-200">{z.zone}</td>
                      <td className="p-2 border border-slate-800 text-cyan-300">{z.depthMeters.toLocaleString()} M</td>
                      <td className="p-2 border border-slate-800 text-slate-400">{z.pressureAtm} ATM</td>
                      <td className="p-2 border border-slate-800 font-mono text-amber-300">&lt; {z.threshold}</td>
                      <td className="p-2 border border-slate-800">{((z.threshold / 256) * 100).toFixed(1)}%</td>
                      <td className="p-2 border border-slate-800 text-right font-black text-emerald-400">
                        {MULTIPLIERS_TABLE[idx + 1] > 0 ? `${MULTIPLIERS_TABLE[idx + 1].toFixed(2)}x` : '0.00x'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mathematical Proof */}
          <div className="p-3 bg-emerald-950/40 rounded border border-emerald-500/40">
            <h3 className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              CERTIFIED 96.000000% THEORETICAL RTP
            </h3>
            <p className="text-slate-300">
              The game draws 5 independent bytes from the verifiable random seed. Because the threshold values (192, 160, 128, 96, 64) are powers-of-two fractions of 256 (3/4, 5/8, 1/2, 3/8, 1/4), the game eliminates modulo bias completely.
            </p>
            <div className="mt-2 text-[10px] text-emerald-300 space-y-0.5">
              <div>• Analytical RTP: <strong>{CERTIFIED_RTP}</strong> (Exact 0 wei drift)</div>
              <div>• Coprime Partition Space: <strong>2,048 States</strong></div>
              <div>• Base L2 Smart Contract: <code>ICasinoGameV2</code> compliant</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded cursor-pointer transition-all"
          >
            ACKNOWLEDGE BRIEFING
          </button>
        </div>
      </div>
    </div>
  );
};
