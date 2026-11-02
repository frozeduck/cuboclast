import React from 'react';
import { GameEngine } from '../game/GameEngine';
import { RotateCcw, ShoppingBag, Trophy, Flame } from 'lucide-react';

interface GameOverModalProps {
  engine: GameEngine;
  onOpenShop: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ engine, onOpenShop }) => {
  const progData = engine.progression.getData();

  return (
    <div className="absolute inset-0 bg-[#04060a]/92 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-[#090d16] border-2 border-pink-500 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(255,0,127,0.25)] text-center relative flex flex-col gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-950/60 border border-pink-500/40 text-pink-400 text-xs font-bold tracking-widest uppercase mb-2">
            <Flame className="w-3.5 h-3.5" /> Run Conclusa
          </div>
          <h2 className="text-3xl font-black tracking-wider text-pink-500 uppercase">
            Sfere Esaurite
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Il Tesseract ha respinto il tuo assalto quantico
          </p>
        </div>

        {/* Stats Summary */}
        <div className="bg-[#0f172a] border border-[#1e2e48] rounded-2xl p-4 flex flex-col gap-2.5 text-left text-xs font-mono">
          <div className="flex items-center justify-between text-slate-300">
            <span>Settore Raggiunto:</span>
            <span className="font-bold text-white text-sm">Settore {engine.currentLevel}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Punteggio Finale:</span>
            <span className="font-bold text-amber-300 text-base">
              {engine.score.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Schegge Quantiche Run:</span>
            <span className="font-bold text-sky-400">◆ +{engine.quantumShardsRun}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300 border-t border-slate-800 pt-2">
            <span>Cubi Frantumati Totali:</span>
            <span className="font-bold text-slate-400">
              {progData.totalCubesDestroyed.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 pt-1">
          <button
            onClick={() => engine.initGame()}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-sm uppercase tracking-wider transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-98"
          >
            <RotateCcw className="w-4 h-4 stroke-[3]" />
            Nuova Run
          </button>

          <button
            onClick={onOpenShop}
            className="w-full py-3 rounded-2xl bg-[#141d2d] hover:bg-[#1e2e48] border border-sky-400/60 text-sky-300 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 active:scale-98"
          >
            <ShoppingBag className="w-4 h-4 text-sky-400" />
            Archivio Upgrade (◆ {progData.quantumShards})
          </button>
        </div>
      </div>
    </div>
  );
};
