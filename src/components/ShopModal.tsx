import React, { useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { soundEngine } from '../audio/soundEngine';

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
    <div
      role="dialog"
      aria-label="Archivio Upgrade"
      className="fixed inset-0 z-50 bg-[#080b12]/96 flex items-center justify-center sm:p-4"
    >
      <div className="w-full h-full sm:h-auto sm:max-h-[90dvh] max-w-lg bg-[#090d16] sm:border-2 border-[#38bdf8] sm:rounded-2xl flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="shrink-0 bg-[#090d16] border-b border-[#1e2e48] px-4 py-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#38bdf8] uppercase tracking-wider leading-none">
              ARCHIVIO UPGRADE
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Potenziamenti permanenti tra tutte le run
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-[#082a2e] border border-[#38bdf8] text-[#38bdf8] font-mono font-bold text-xs tabular-nums">
            ◆ {data.quantumShards}
          </div>
        </div>

        {/* Single Scrollable Body */}
        <div className="flex-1 min-h-0 modal-scroll p-4 space-y-3">
          {/* Slot 1: Extra Balls */}
          <div className="rounded-xl bg-[#141d2d] border-2 border-[#00e5ff] p-3.5 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-white">SFERE INIZIALI EXTRA</div>
              <p className="text-xs text-slate-300 mt-0.5">
                +1 sfera garantita all'inizio di ogni settore
              </p>
              <div className="text-xs font-mono text-[#00e5ff] mt-1 tabular-nums">
                Livello: {data.upgradeExtraBalls} / 3
              </div>
            </div>

            {data.upgradeExtraBalls >= 3 ? (
              <span className="px-3 py-2 rounded-lg bg-[#063528] border border-[#00ff88] text-[#00ff88] text-xs font-bold">
                MAX
              </span>
            ) : (
              <button
                type="button"
                onClick={handleBuyBalls}
                disabled={data.quantumShards < prog.getCostExtraBalls()}
                className={`min-h-[42px] px-4 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0 ${
                  data.quantumShards >= prog.getCostExtraBalls()
                    ? 'bg-[#00e5ff] text-[#080b12] cursor-pointer active:scale-95'
                    : 'bg-[#1e2e48] text-slate-400 cursor-not-allowed'
                }`}
              >
                ◆ {prog.getCostExtraBalls()}
              </button>
            )}
          </div>

          {/* Slot 2: Basket Width */}
          <div className="rounded-xl bg-[#141d2d] border-2 border-[#00ff88] p-3.5 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-white">AMPIEZZA CESTELLO</div>
              <p className="text-xs text-slate-300 mt-0.5">
                +15px larghezza per catture e sfere extra più facili
              </p>
              <div className="text-xs font-mono text-[#00ff88] mt-1 tabular-nums">
                Livello: {data.upgradeBasketWidth} / 3
              </div>
            </div>

            {data.upgradeBasketWidth >= 3 ? (
              <span className="px-3 py-2 rounded-lg bg-[#063528] border border-[#00ff88] text-[#00ff88] text-xs font-bold">
                MAX
              </span>
            ) : (
              <button
                type="button"
                onClick={handleBuyBasket}
                disabled={data.quantumShards < prog.getCostBasketWidth()}
                className={`min-h-[42px] px-4 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0 ${
                  data.quantumShards >= prog.getCostBasketWidth()
                    ? 'bg-[#00ff88] text-[#080b12] cursor-pointer active:scale-95'
                    : 'bg-[#1e2e48] text-slate-400 cursor-not-allowed'
                }`}
              >
                ◆ {prog.getCostBasketWidth()}
              </button>
            )}
          </div>

          {/* Slot 3: Reroll */}
          <div className="rounded-xl bg-[#141d2d] border-2 border-[#a855f7] p-3.5 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-white">REROLL AGGIUNTIVO</div>
              <p className="text-xs text-slate-300 mt-0.5">
                +1 cambio di carte reliquia utilizzabile per partita
              </p>
              <div className="text-xs font-mono text-[#a855f7] mt-1 tabular-nums">
                Livello: {data.upgradeRerolls} / 2
              </div>
            </div>

            {data.upgradeRerolls >= 2 ? (
              <span className="px-3 py-2 rounded-lg bg-[#063528] border border-[#00ff88] text-[#00ff88] text-xs font-bold">
                MAX
              </span>
            ) : (
              <button
                type="button"
                onClick={handleBuyReroll}
                disabled={data.quantumShards < prog.getCostRerolls()}
                className={`min-h-[42px] px-4 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0 ${
                  data.quantumShards >= prog.getCostRerolls()
                    ? 'bg-[#a855f7] text-[#080b12] cursor-pointer active:scale-95'
                    : 'bg-[#1e2e48] text-slate-400 cursor-not-allowed'
                }`}
              >
                ◆ {prog.getCostRerolls()}
              </button>
            )}
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-center font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-[#141d2d] border border-[#1e2e48]">
              <div className="text-white font-bold tabular-nums">{data.runsPlayed}</div>
              <div className="text-[10px] text-slate-400">PARTITE</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#141d2d] border border-[#1e2e48]">
              <div className="text-[#00ff88] font-bold tabular-nums">{data.victories}</div>
              <div className="text-[10px] text-slate-400">VITTORIE</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#141d2d] border border-[#1e2e48]">
              <div className="text-[#00e5ff] font-bold tabular-nums">
                {data.totalCubesDestroyed}
              </div>
              <div className="text-[10px] text-slate-400">CUBI</div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="shrink-0 bg-[#090d16] border-t border-[#1e2e48] p-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[46px] rounded-xl bg-[#00e5ff] text-[#080b12] font-bold text-sm uppercase tracking-wider cursor-pointer active:scale-[0.99]"
          >
            INDIETRO
          </button>
        </div>
      </div>
    </div>
  );
};
