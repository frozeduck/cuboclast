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
  const discountLvl = engine.progression.getData().upgradeMerchantDiscount || 0;
  const relicOffer = engine.merchantRelicOffer ? RELICS_DATA[engine.merchantRelicOffer] : null;
  const relicCost = engine.getMerchantItemCost('RELIC');

  const items = [
    {
      id: 'BALLS' as const,
      title: 'Ricarica Munizioni (+2 Sfere)',
      description: 'Aggiunge immediatamente +2 Sfere alla riserva della Run corrente.',
      cost: engine.getMerchantItemCost('BALLS'),
      color: '#e4e4e7',
    },
    {
      id: 'DAMAGE' as const,
      title: 'Calibrazione Cannone (+1 Danno)',
      description: 'Aumenta di +1 il danno base di tutte le sfere per il resto della Run.',
      cost: engine.getMerchantItemCost('DAMAGE'),
      color: '#c87d65',
    },
    {
      id: 'BASKET' as const,
      title: 'Estensione Bobine (+40px Cestello)',
      description: 'Allarga il cestello magnetico di +40px per tutta la Run corrente.',
      cost: engine.getMerchantItemCost('BASKET'),
      color: '#7fa68e',
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
      className="fixed inset-0 z-50 bg-[#07080b]/96 flex items-center justify-center sm:p-4"
    >
      <div className="w-full h-full sm:h-auto sm:max-h-[92dvh] max-w-md bg-[#0c0e13] sm:border border-[#262a34] sm:rounded-2xl flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="shrink-0 bg-[#0c0e13] border-b border-[#222630] px-4 py-3.5 flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-mono font-bold text-[#d4b483] uppercase tracking-wider">
              STAZIONE DI RIFORNIMENTO · SETTORE {engine.pendingNextSector}
              {discountLvl > 0 ? ` · SCONTO -${discountLvl * 12}%` : ''}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100 uppercase tracking-wider mt-0.5">
              MERCANTE ORBITALE
            </h2>
          </div>

          <div className="h-9 px-3 rounded-lg bg-[#14171f] border border-[#2d323e] flex items-center">
            <span className="text-xs font-bold text-[#7c9cb4] tabular-nums">
              ◆ {shards}
            </span>
          </div>
        </div>

        {/* Current Run Status */}
        <div className="shrink-0 bg-[#10131a] border-b border-[#222630] px-4 py-2 flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>
            Sfere: <strong className="text-zinc-200">{engine.ballsRemaining}</strong>
          </span>
          <span>
            Danno: <strong className="text-[#d4b483]">{engine.getEffectiveBaseDamage().toFixed(1)}</strong>
          </span>
          <span>
            Reliquie: <strong className="text-[#9b95b8]">{engine.activeRelics.length}</strong>
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
                className="rounded-xl bg-[#13161e] border p-3.5 space-y-2"
                style={{ borderColor: bought ? '#222630' : `${item.color}55` }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-zinc-100">{item.title}</span>
                  <span
                    className="text-xs font-mono font-bold"
                    style={{ color: item.color }}
                  >
                    ◆ {item.cost}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
                <button
                  type="button"
                  disabled={!canAfford}
                  onClick={() => handleBuy(item.id)}
                  className={`w-full min-h-[40px] rounded-lg font-bold text-xs uppercase tracking-wider transition ${
                    bought
                      ? 'bg-[#0c0e13] text-[#7fa68e] border border-[#7fa68e]/40 cursor-default'
                      : canAfford
                      ? 'bg-zinc-200 text-zinc-950 cursor-pointer active:scale-95'
                      : 'bg-[#0c0e13] text-zinc-600 border border-[#222630] cursor-not-allowed'
                  }`}
                >
                  {bought ? '✓ ACQUISTATO' : `ACQUISTA · ◆ ${item.cost}`}
                </button>
              </div>
            );
          })}

          {relicOffer && (
            <div
              className="rounded-xl bg-[#13161e] border p-3.5 space-y-2"
              style={{
                borderColor: engine.merchantBoughtIds.includes('RELIC')
                  ? '#222630'
                  : '#9b95b866',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-zinc-100">
                  Reliquia: {relicOffer.title}
                </span>
                <span className="text-xs font-mono font-bold text-[#9b95b8]">◆ {relicCost}</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {relicOffer.description}
              </p>
              <button
                type="button"
                disabled={shards < relicCost || engine.merchantBoughtIds.includes('RELIC')}
                onClick={() => handleBuy('RELIC')}
                className={`w-full min-h-[40px] rounded-lg font-bold text-xs uppercase tracking-wider transition ${
                  engine.merchantBoughtIds.includes('RELIC')
                    ? 'bg-[#0c0e13] text-[#7fa68e] border border-[#7fa68e]/40 cursor-default'
                    : shards >= relicCost
                    ? 'bg-zinc-200 text-zinc-950 cursor-pointer active:scale-95'
                    : 'bg-[#0c0e13] text-zinc-600 border border-[#222630] cursor-not-allowed'
                }`}
              >
                {engine.merchantBoughtIds.includes('RELIC')
                  ? '✓ RELIQUIA EQUIPAGGIATA'
                  : `COMPRA RELIQUIA · ◆ ${relicCost}`}
              </button>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="shrink-0 bg-[#0c0e13] border-t border-[#222630] p-3.5">
          <button
            type="button"
            data-testid="leave-merchant-btn"
            onClick={() => engine.leaveRunMerchant()}
            className="w-full min-h-[48px] rounded-xl bg-zinc-200 text-zinc-950 font-bold text-sm uppercase tracking-wider active:scale-[0.99] cursor-pointer"
          >
            ENTRA NEL SETTORE {engine.pendingNextSector} →
          </button>
        </div>
      </div>
    </div>
  );
};
