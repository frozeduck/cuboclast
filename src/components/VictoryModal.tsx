import React, { useEffect } from 'react';
import { GameEngine } from '../game/GameEngine';
import confetti from 'canvas-confetti';
import { Trophy, Infinity as InfinityIcon, RotateCcw, Sparkles } from 'lucide-react';

interface VictoryModalProps {
  engine: GameEngine;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ engine }) => {
  useEffect(() => {
    // Fire festive victory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#00e5ff', '#00ff88', '#ffe600', '#ff007f'],
      });
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="absolute inset-0 bg-[#04060a]/92 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-[#090d16] border-2 border-emerald-400 rounded-3xl p-6 sm:p-7 shadow-[0_0_60px_rgba(0,255,136,0.3)] text-center relative flex flex-col gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-2">
            <Trophy className="w-3.5 h-3.5" /> Settore 10 Purificato
          </div>
          <h2 className="text-3xl font-black tracking-wider text-emerald-400 uppercase">
            Tesseract Sconfitto!
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Hai purificato tutti i 10 settori della galassia quantica!
          </p>
        </div>

        {/* Stats */}
        <div className="bg-[#0f172a] border border-[#1e2e48] rounded-2xl p-4 flex flex-col gap-2.5 text-left text-xs font-mono">
          <div className="flex items-center justify-between text-slate-300">
            <span>Punteggio Finale:</span>
            <span className="font-bold text-emerald-400 text-base">
              {engine.score.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Schegge Quantiche Run:</span>
            <span className="font-bold text-sky-400">◆ +{engine.quantumShardsRun}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Bonus Sfere Salve:</span>
            <span className="font-bold text-amber-300">
              +{ (engine.ballsRemaining * 2000).toLocaleString() }
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 pt-1">
          <button
            onClick={() => engine.startEndlessLoop()}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-sm uppercase tracking-wider transition shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 active:scale-98"
          >
            <InfinityIcon className="w-5 h-5 stroke-[2.5]" />
            ∞ Entra nel Loop Endless
          </button>

          <button
            onClick={() => engine.initGame()}
            className="w-full py-3 rounded-2xl bg-[#141d2d] hover:bg-[#1e2e48] border border-cyan-500/50 text-cyan-300 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 active:scale-98"
          >
            <RotateCcw className="w-4 h-4" />
            Menu Principale
          </button>
        </div>
      </div>
    </div>
  );
};
