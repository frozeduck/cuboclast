import React, { useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { soundEngine } from '../audio/soundEngine';
import {
  MetaUpgradeCategory,
  MetaUpgradeId,
  META_UPGRADES_DATA,
  META_UPGRADE_ORDER,
} from '../types/game';

interface ShopModalProps {
  engine: GameEngine;
  onClose: () => void;
}

type FilterTab = 'ALL' | MetaUpgradeCategory;

export const ShopModal: React.FC<ShopModalProps> = ({ engine, onClose }) => {
  const [, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [confirmReset, setConfirmReset] = useState(false);

  const prog = engine.progression;
  const data = prog.getData();

  const handleBuy = (id: MetaUpgradeId) => {
    if (prog.buyUpgrade(id)) {
      soundEngine.playRelicSelect();
      soundEngine.triggerHaptic(30);
      setTick((t) => t + 1);
    }
  };

  const handleRefundAll = () => {
    const refunded = prog.refundAllUpgrades();
    if (refunded > 0) {
      soundEngine.playShardCollect();
      soundEngine.triggerHaptic(50);
      setConfirmReset(false);
      setTick((t) => t + 1);
    }
  };

  const totalInvested = prog.getTotalShardsInvestedInUpgrades();
  const totalLevelsBought = META_UPGRADE_ORDER.reduce(
    (sum, id) => sum + prog.getUpgradeLevel(id),
    0
  );
  const totalMaxLevels = META_UPGRADE_ORDER.reduce(
    (sum, id) => sum + prog.getUpgradeMaxLevel(id),
    0
  );

  const visibleUpgrades = META_UPGRADE_ORDER.filter((id) => {
    if (activeTab === 'ALL') return true;
    return META_UPGRADES_DATA[id].category === activeTab;
  });

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: 'ALL', label: 'TUTTI', count: META_UPGRADE_ORDER.length },
    {
      id: 'OFFENSE',
      label: 'BALISTICA',
      count: META_UPGRADE_ORDER.filter((k) => META_UPGRADES_DATA[k].category === 'OFFENSE').length,
    },
    {
      id: 'DEFENSE',
      label: 'DIFESA',
      count: META_UPGRADE_ORDER.filter((k) => META_UPGRADES_DATA[k].category === 'DEFENSE').length,
    },
    {
      id: 'ECONOMY',
      label: 'ECONOMIA',
      count: META_UPGRADE_ORDER.filter((k) => META_UPGRADES_DATA[k].category === 'ECONOMY').length,
    },
  ];

  return (
    <div
      role="dialog"
      aria-label="Archivio Upgrade"
      className="fixed inset-0 z-50 bg-[#07080b]/96 flex items-center justify-center sm:p-4"
    >
      <div className="w-full h-full sm:h-auto sm:max-h-[92dvh] max-w-lg bg-[#0c0e13] sm:border border-[#262a34] sm:rounded-2xl flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="shrink-0 bg-[#0c0e13] border-b border-[#222630] px-4 py-3 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-zinc-100 uppercase tracking-wider leading-none">
                ARCHIVIO UPGRADE
              </h2>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#151821] border border-[#2a2f3d] text-zinc-400 tabular-nums">
                {totalLevelsBought}/{totalMaxLevels} LV
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              10 moduli permanenti divisi in Balistica, Difesa ed Economia
            </p>
          </div>

          <div
            data-testid="shop-shard-balance"
            className="px-3 py-1.5 rounded-lg bg-[#14171f] border border-[#2d323e] text-[#d4b483] font-mono font-bold text-xs tabular-nums shrink-0"
          >
            ◆ {data.quantumShards}
          </div>
        </div>

        {/* Category Filter Bar */}
        <div className="shrink-0 bg-[#0f1218] border-b border-[#222630] px-3 py-2 grid grid-cols-4 gap-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[34px] px-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-tight whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-zinc-200 text-zinc-950'
                    : 'bg-[#151922] text-zinc-400 border border-[#242936] hover:text-zinc-200'
                }`}
              >
                {tab.label} · {tab.count}
              </button>
            );
          })}
        </div>

        {/* Active Permanent Bonuses Summary Strip */}
        <div className="shrink-0 bg-[#11141c] border-b border-[#222630] px-4 py-2 flex items-center justify-between gap-2 text-[11px] font-mono text-zinc-400 tabular-nums">
          <span>
            Sfere: <strong className="text-zinc-100">{6 + prog.getUpgradeLevel('EXTRA_BALLS')}</strong>
          </span>
          <span>
            Danno: <strong className="text-[#c87d65]">{(1 + prog.getUpgradeLevel('BASE_DAMAGE') * 0.5).toFixed(1)}</strong>
          </span>
          <span>
            Crit: <strong className="text-[#c46d75]">{prog.getUpgradeLevel('CRIT_CHANCE') * 5}%</strong>
          </span>
          <span>
            Corazza: <strong className="text-[#d4b483]">+{prog.getUpgradeLevel('ARMOR_PIERCE')}</strong>
          </span>
          <span>
            Schegge: <strong className="text-[#7c9cb4]">+{prog.getUpgradeLevel('SHARD_MULTIPLIER') * 20}%</strong>
          </span>
        </div>

        {/* Single Scrollable Body */}
        <div
          data-testid="shop-upgrades-scroll-body"
          className="flex-1 min-h-0 modal-scroll p-3.5 space-y-2.5"
        >
          {visibleUpgrades.map((id) => {
            const info = META_UPGRADES_DATA[id];
            const lvl = prog.getUpgradeLevel(id);
            const maxLvl = info.maxLevel;
            const isMax = lvl >= maxLvl;
            const cost = prog.getUpgradeCost(id);
            const canAfford = !isMax && data.quantumShards >= cost;

            return (
              <div
                key={id}
                data-testid={`upgrade-card-${id}`}
                className="rounded-xl bg-[#13161e] border border-[#262b38] p-3.5 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#181c26] border border-[#2c3242]"
                        style={{ color: info.color }}
                      >
                        {info.categoryLabel}
                      </span>
                      <span className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
                        {info.title}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      {info.description}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="shrink-0">
                    {isMax ? (
                      <span className="inline-flex items-center justify-center min-h-[40px] px-3.5 rounded-lg bg-[#16201c] border border-[#7fa68e]/50 text-[#7fa68e] text-xs font-mono font-bold">
                        MAX
                      </span>
                    ) : (
                      <button
                        type="button"
                        aria-label={`Potenzia ${info.title}`}
                        onClick={() => handleBuy(id)}
                        disabled={!canAfford}
                        className={`min-h-[40px] px-3.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition tabular-nums ${
                          canAfford
                            ? 'bg-zinc-200 text-zinc-950 cursor-pointer active:scale-95'
                            : 'bg-[#181c26] text-zinc-500 border border-[#252a36] cursor-not-allowed'
                        }`}
                      >
                        ◆ {cost}
                      </button>
                    )}
                  </div>
                </div>

                {/* Segmented Level Bar & Effect Readout */}
                <div className="pt-1 border-t border-[#1e222d] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 shrink-0" aria-label={`Livello ${lvl} su ${maxLvl}`}>
                    {Array.from({ length: maxLvl }).map((_, idx) => (
                      <span
                        key={idx}
                        className="w-3.5 h-1.5 rounded-xs transition-colors"
                        style={{
                          backgroundColor: idx < lvl ? info.color : '#232834',
                        }}
                      />
                    ))}
                    <span className="text-[11px] font-mono text-zinc-400 ml-1 whitespace-nowrap tabular-nums">
                      LV {lvl}/{maxLvl}
                    </span>
                  </div>

                  <div
                    className="text-[11px] font-mono font-semibold text-right truncate"
                    style={{ color: lvl > 0 ? info.color : '#a1a1aa' }}
                  >
                    {info.formatEffect(lvl)}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Respec / Refund Section */}
          {totalInvested > 0 && (
            <div className="rounded-xl bg-[#12151d] border border-[#262b38] p-3.5 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-zinc-200 uppercase">
                  Ricalibrazione Matrice (Respec)
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Azzerando i moduli recuperi il 100% delle Schegge investite (◆ {totalInvested}).
                </p>
              </div>
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="min-h-[38px] px-3 rounded-lg bg-[#181c26] border border-[#2e3444] text-zinc-300 font-mono font-bold text-[11px] uppercase shrink-0 cursor-pointer active:scale-95"
                >
                  RIMBORSA ◆ {totalInvested}
                </button>
              ) : (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleRefundAll}
                    className="min-h-[38px] px-3 rounded-lg bg-[#c46d75] text-zinc-950 font-mono font-bold text-[11px] uppercase cursor-pointer active:scale-95"
                  >
                    CONFERMA
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="min-h-[38px] px-2.5 rounded-lg bg-[#181c26] border border-[#2e3444] text-zinc-400 font-mono font-bold text-[11px] uppercase cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Career Stats Summary */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-[#13161e] border border-[#222630]">
              <div className="text-zinc-100 font-bold tabular-nums">{data.runsPlayed}</div>
              <div className="text-[10px] text-zinc-500">SPEDIZIONI</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#13161e] border border-[#222630]">
              <div className="text-[#7fa68e] font-bold tabular-nums">{data.victories}</div>
              <div className="text-[10px] text-zinc-500">VITTORIE</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#13161e] border border-[#222630]">
              <div className="text-[#d4b483] font-bold tabular-nums">
                {data.totalCubesDestroyed}
              </div>
              <div className="text-[10px] text-zinc-500">CUBI</div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="shrink-0 bg-[#0c0e13] border-t border-[#222630] p-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[46px] rounded-xl bg-zinc-200 text-zinc-950 font-bold text-sm uppercase tracking-wider cursor-pointer active:scale-[0.99]"
          >
            TORNA ALLA SPEDIZIONE
          </button>
        </div>
      </div>
    </div>
  );
};
