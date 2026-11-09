import React, { useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { RELICS_DATA } from '../types/game';

interface RunMerchantModalProps {
  engine: GameEngine;
}

export const RunMerchantModal: React.FC<RunMerchantModalProps> = ({ engine }) => {
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const shards = engine.progression.getData().quantumShards;
  const relicOffer = engine.merchantRelicOffer ? RELICS_DATA[engine.merchantRelicOffer] : null;

  const items = [
    {
      id: 'BALLS' as const,
      title: 'Ricarica Munizioni (+2 Sfere)',
      description: 'Aggiunge immediatamente +2 Sfere alla riserva della Run corrente.',
      cost: 20,
      color: '#00e5ff',
    },
    {
      id: 'DAMAGE' as const,
      title: 'Calibrazione Cannone (+1 Danno)',
      description: 'Aumenta di +1 il danno base di tutte le sfere per il resto della Run.',
      cost: 35,
      color: '#ff6b00',
    },
    {
      id: 'BASKET' as const,
      title: 'Estensione Bobine (+40px Cestello)',
      description: 'Allarga il cestello magnetico di +40px per tutta la Run corrente.',
      cost: 25,
      color: '#00ff88',
    },
  ];

  const handleBuy = (itemType: 'BALLS' | 'DAMAGE' | 'BASKET' | 'RELIC') => {
    if (engine.buyRunMerchantItem(itemType)) {
      refresh();
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Mercante Orbitale In-Run"
      className="fixed inset-0 z-50 bg-[#080b12]/96 flex items-center justify-center sm:p-4"
    >
      <div className="w-full h-full sm:h-auto sm:max-h-[92dvh] max-w-md bg-[#090d16] sm:border-2 border-[#ffe600] sm:rounded-2xl flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="shrink-0 bg-[#090d16] border-b border-[#1e2e48] px-4 py-3.5 flex items-center justify-between gap-2">
          <div>
            <div className="text-xs font-mono font-bold text-[#ffe600] uppercase tracking-wider">
              STAZIONE DI RIFORNIMENTO · SETTORE {engine.pendingNextSector}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white uppercase tracking-wider mt-0.5">
              MERCANTE ORBITALE
            </h2>
          </div>

          <div className="h-9 px-3 rounded-lg bg-[#141d2d] border-2 border-[#38bdf8] flex items-center">
            <span className="text-xs font-bold text-[#38bdf8] tabular-nums">
              ◆ {shards}
            </span>
          </div>
        </div>

        {/* Current Run Status */}
        <div className="shrink-0 bg-[#0c121e] border-b border-[#1e2e48] px-4 py-2 flex items-center justify-between text-xs font-mono text-slate-300">
          <span>
            Sfere: <strong className="text-[#00e5ff]">{engine.ballsRemaining}</strong>
          </span>
          <span>
            Danno: <strong className="text-[#ffe600]">{1 + engine.runBonusDamage}</strong>
          </span>
          <span>
            Reliquie: <strong className="text-[#a855f7]">{engine.activeRelics.length}</strong>
          </span>
        </div>

        {/* Single Scrollable Body */}
        <div
          data-testid="run-merchant-scroll-body"
          className="flex-1 min-h-0 modal-scroll p-4 space-y-2.5"
        >
          {items.map((item) => {
            const bought = engine.merchantBoughtIds.includes(item.id);
            const canAfford = shards >= item.cost && !bought;

            return (
              <div
                key={item.id}
                className="rounded-xl bg-[#141d2d] border-2 p-3.5 space-y-2"
                style={{ borderColor: bought ? '#1e2e48' : item.color }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-white">{item.title}</span>
                  <span
                    className="text-xs font-mono font-bold"
                    style={{ color: item.color }}
                  >
                    ◆ {item.cost}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                <button
                  type="button"
                  disabled={!canAfford}
                  onClick={() => handleBuy(item.id)}
                  className={`w-full min-h-[40px] rounded-lg font-bold text-xs uppercase tracking-wider transition ${
                    bought
                      ? 'bg-[#090d16] text-[#00ff88] border border-[#00ff88]/40 cursor-default'
                      : canAfford
                      ? 'bg-[#ffe600] text-[#080b12] cursor-pointer active:scale-95'
                      : 'bg-[#090d16] text-slate-500 border border-[#1e2e48] cursor-not-allowed'
                  }`}
                >
                  {bought ? '✓ ACQUISTATO' : `ACQUISTA · ◆ ${item.cost}`}
                </button>
              </div>
            );
          })}

          {relicOffer && (
            <div
              className="rounded-xl bg-[#141d2d] border-2 p-3.5 space-y-2"
              style={{
                borderColor: engine.merchantBoughtIds.includes('RELIC')
                  ? '#1e2e48'
                  : '#a855f7',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-white">
                  Reliquia: {relicOffer.title}
                </span>
                <span className="text-xs font-mono font-bold text-[#a855f7]">◆ 45</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {relicOffer.description}
              </p>
              <button
                type="button"
                disabled={shards < 45 || engine.merchantBoughtIds.includes('RELIC')}
                onClick={() => handleBuy('RELIC')}
                className={`w-full min-h-[40px] rounded-lg font-bold text-xs uppercase tracking-wider transition ${
                  engine.merchantBoughtIds.includes('RELIC')
                    ? 'bg-[#090d16] text-[#00ff88] border border-[#00ff88]/40 cursor-default'
                    : shards >= 45
                    ? 'bg-[#a855f7] text-white cursor-pointer active:scale-95'
                    : 'bg-[#090d16] text-slate-500 border border-[#1e2e48] cursor-not-allowed'
                }`}
              >
                {engine.merchantBoughtIds.includes('RELIC')
                  ? '✓ RELIQUIA EQUIPAGGIATA'
                  : 'COMPRA RELIQUIA · ◆ 45'}
              </button>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="shrink-0 bg-[#090d16] border-t border-[#1e2e48] p-3.5">
          <button
            type="button"
            data-testid="leave-merchant-btn"
            onClick={() => engine.leaveRunMerchant()}
            className="w-full min-h-[48px] rounded-xl bg-[#00e5ff] text-[#080b12] font-bold text-sm uppercase tracking-wider active:scale-[0.99] cursor-pointer"
          >
            ENTRA NEL SETTORE {engine.pendingNextSector} →
          </button>
        </div>
      </div>
    </div>
  );
};
