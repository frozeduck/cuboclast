import React from 'react';
import { GameEngine } from '../game/GameEngine';
import { RELIC_FAMILIES, RELICS_DATA, RELIC_RARITIES, RelicFamilyId, FUSION_COMBOS } from '../types/game';

interface RelicListModalProps {
  engine: GameEngine;
  onClose: () => void;
}

export const RelicListModal: React.FC<RelicListModalProps> = ({ engine, onClose }) => {
  const activeRelics = engine.activeRelics;
  const resonances = engine.getActiveResonances();
  const activeFusions = engine.getActiveFusionCombos();

  return (
    <div
      role="dialog"
      aria-label="Reliquie e Sinergie Attive"
      className="fixed inset-0 z-50 bg-[#08090c]/96 flex items-center justify-center sm:p-4"
    >
      <div className="w-full h-full sm:h-auto sm:max-h-[90dvh] max-w-lg bg-[#0c0e13] sm:border border-[#272b36] sm:rounded-2xl flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="shrink-0 bg-[#0c0e13] border-b border-[#222630] px-4 py-3 flex items-center justify-between gap-2">
          <h3 className="text-base sm:text-lg font-bold text-zinc-100 uppercase tracking-wider">
            RELIQUIE & MAESTRIE ({activeRelics.length})
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[38px] px-3 rounded-lg bg-[#14171f] border border-[#2d323e] text-zinc-200 font-bold text-xs uppercase cursor-pointer active:scale-95"
          >
            ✕ CHIUDI
          </button>
        </div>

        {/* Single Scrollable Body */}
        <div className="flex-1 min-h-0 modal-scroll p-4 space-y-3">
          {/* Active Dual-Element Fusion Combos */}
          {activeFusions.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-[#d4b483] uppercase">
                COMBO FUSIONE ATTIVE
              </div>
              {activeFusions.map((fusionId) => {
                const fInfo = FUSION_COMBOS[fusionId];
                return (
                  <div
                    key={fusionId}
                    className="p-3 rounded-xl bg-[#13161e] border"
                    style={{ borderColor: fInfo.color }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase" style={{ color: fInfo.color }}>
                        {fInfo.title}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400">
                        [{fInfo.familyA} + {fInfo.familyB}]
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-1">{fInfo.description}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Resonance & Mastery Grid */}
          <div>
            <div className="text-xs font-mono font-bold text-zinc-400 uppercase mb-2">
              MAESTRIE & RISONANZE DI SET
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(resonances) as RelicFamilyId[]).map((fam) => {
                const count = resonances[fam];
                const tier = engine.getResonanceTier(fam);
                const info = RELIC_FAMILIES[fam];
                return (
                  <div
                    key={fam}
                    className="p-2.5 rounded-xl bg-[#13161e] border flex flex-col justify-between"
                    style={{
                      borderColor: tier > 0 ? info.color : '#222630',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase" style={{ color: info.color }}>
                        {info.label}
                      </span>
                      <span className="text-xs font-mono font-bold text-zinc-200 tabular-nums">
                        {count}x
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono mt-1 ${
                        tier === 2
                          ? 'text-[#d4b483] font-bold'
                          : tier === 1
                          ? 'text-zinc-200'
                          : 'text-zinc-500'
                      }`}
                    >
                      {tier === 2
                        ? '★ Tier 2 Maestria (3x Attiva)'
                        : tier === 1
                        ? '★ Tier 1 Sinergia (2x Attiva)'
                        : 'Serve 2x (Sinergia) / 3x (Maestria)'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Equipped Relics List */}
          <div className="space-y-2">
            <div className="text-xs font-mono font-bold text-zinc-400 uppercase">
              RELIQUIE EQUIPAGGIATE
            </div>
            {activeRelics.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">
                Nessuna reliquia equipaggiata.
              </p>
            ) : (
              activeRelics.map((rId, idx) => {
                const r = RELICS_DATA[rId];
                if (!r) return null;
                const fam = RELIC_FAMILIES[r.family];
                const rar = RELIC_RARITIES[r.rarity];
                return (
                  <div
                    key={`${rId}-${idx}`}
                    className="p-3 rounded-xl bg-[#13161e] border flex flex-col gap-1"
                    style={{ borderColor: rar.color }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-zinc-100">{r.title}</span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase"
                          style={{ color: rar.color, borderColor: rar.color }}
                        >
                          {rar.label}
                        </span>
                        <span className="text-xs font-mono font-bold" style={{ color: fam.color }}>
                          [{fam.label.toUpperCase()}]
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">{r.description}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="shrink-0 bg-[#0c0e13] border-t border-[#222630] p-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[46px] rounded-xl bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-[0.99]"
          >
            TORNA ALLA PARTITA
          </button>
        </div>
      </div>
    </div>
  );
};
