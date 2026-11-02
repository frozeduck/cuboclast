import React, { useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { soundEngine } from '../audio/soundEngine';
import { ShoppingBag, ArrowLeft, PlusCircle, Maximize2, RefreshCw, Snowflake, Compass, Check } from 'lucide-react';

interface ShopModalProps {
  engine: GameEngine;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ engine, onClose }) => {
  const [, setTick] = useState(0);
  const prog = engine.progression;
  const data = prog.getData();

  const handleBuyBalls = () => {
    if (prog.buyExtraBalls()) {
      soundEngine.playRelicSelect();
      setTick((t) => t + 1);
    }
  };

  const handleBuyBasket = () => {
    if (prog.buyBasketWidth()) {
      soundEngine.playRelicSelect();
      setTick((t) => t + 1);
    }
  };

  const handleBuyReroll = () => {
    if (prog.buyReroll()) {
      soundEngine.playRelicSelect();
      setTick((t) => t + 1);
    }
  };

  return (
    <div className="absolute inset-0 bg-[#04060a]/92 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="w-full max-w-lg my-auto bg-[#090d16] border-2 border-sky-400 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(56,189,248,0.2)] text-center relative flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1e2e48] pb-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#141d2d] hover:bg-[#1e2e48] border border-[#1e2e48] text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Indietro</span>
          </button>

          <div className="flex items-center gap-2 bg-sky-950/60 border border-sky-500/40 rounded-full px-3.5 py-1 text-sky-300 font-mono font-bold text-sm">
            <span>◆ {data.quantumShards} Schegge</span>
          </div>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-wider text-white uppercase">
            Archivio <span className="text-sky-400">Upgrade</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Miglioramenti permanenti salvati tra tutte le run
          </p>
        </div>

        {/* Upgrade Cards List */}
        <div className="flex flex-col gap-3">
          {/* 1. Sfere Iniziali Extra */}
          <div className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e2e48] flex items-center justify-between gap-3 text-left">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Sfere Iniziali Extra</h4>
                <p className="text-xs text-slate-400">
                  +1 sfera garantita all'inizio di ogni settore
                </p>
                <div className="flex items-center gap-1 mt-1 text-[11px] font-mono text-cyan-400">
                  Livello: {data.upgradeExtraBalls} / 3
                </div>
              </div>
            </div>

            {data.upgradeExtraBalls >= 3 ? (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                <Check className="w-4 h-4" /> MAX
              </span>
            ) : (
              <button
                onClick={handleBuyBalls}
                disabled={data.quantumShards < prog.getCostExtraBalls()}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                  data.quantumShards >= prog.getCostExtraBalls()
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                ◆ {prog.getCostExtraBalls()}
              </button>
            )}
          </div>

          {/* 2. Ampiezza Cestello */}
          <div className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e2e48] flex items-center justify-between gap-3 text-left">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Maximize2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Larghezza Cestello</h4>
                <p className="text-xs text-slate-400">
                  +15px larghezza per catture e sfere extra più facili
                </p>
                <div className="flex items-center gap-1 mt-1 text-[11px] font-mono text-emerald-400">
                  Livello: {data.upgradeBasketWidth} / 3
                </div>
              </div>
            </div>

            {data.upgradeBasketWidth >= 3 ? (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                <Check className="w-4 h-4" /> MAX
              </span>
            ) : (
              <button
                onClick={handleBuyBasket}
                disabled={data.quantumShards < prog.getCostBasketWidth()}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                  data.quantumShards >= prog.getCostBasketWidth()
                    ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                ◆ {prog.getCostBasketWidth()}
              </button>
            )}
          </div>

          {/* 3. Reroll Bonus */}
          <div className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e2e48] flex items-center justify-between gap-3 text-left">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Reroll Aggiuntivo</h4>
                <p className="text-xs text-slate-400">
                  +1 cambio di carte reliquia utilizzabile per partita
                </p>
                <div className="flex items-center gap-1 mt-1 text-[11px] font-mono text-purple-400">
                  Livello: {data.upgradeRerolls} / 2
                </div>
              </div>
            </div>

            {data.upgradeRerolls >= 2 ? (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                <Check className="w-4 h-4" /> MAX
              </span>
            ) : (
              <button
                onClick={handleBuyReroll}
                disabled={data.quantumShards < prog.getCostRerolls()}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                  data.quantumShards >= prog.getCostRerolls()
                    ? 'bg-purple-400 hover:bg-purple-300 text-slate-950 shadow-md shadow-purple-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                ◆ {prog.getCostRerolls()}
              </button>
            )}
          </div>
        </div>

        {/* Global Stats Footer */}
        <div className="pt-2 border-t border-[#1e2e48] grid grid-cols-3 gap-2 text-center text-xs font-mono text-slate-400">
          <div className="p-2 rounded-xl bg-[#141d2d]/60">
            <div className="text-white font-bold">{data.runsPlayed}</div>
            <div className="text-[10px] text-slate-400">Partite</div>
          </div>
          <div className="p-2 rounded-xl bg-[#141d2d]/60">
            <div className="text-emerald-400 font-bold">{data.victories}</div>
            <div className="text-[10px] text-slate-400">Vittorie</div>
          </div>
          <div className="p-2 rounded-xl bg-[#141d2d]/60">
            <div className="text-cyan-400 font-bold">{data.totalCubesDestroyed}</div>
            <div className="text-[10px] text-slate-400">Cubi Distrutti</div>
          </div>
        </div>
      </div>
    </div>
  );
};
