import React from 'react';
import { GameEngine } from '../game/GameEngine';
import { RELIC_FAMILIES, RELICS_DATA, RelicFamilyId, FUSION_COMBOS } from '../types/game';

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
      className="fixed inset-0 z-50 bg-[#080b12]/96 flex items-center justify-center sm:p-4"
    >
      <div className="w-full h-full sm:h-auto sm:max-h-[90dvh] max-w-lg bg-[#090d16] sm:border-2 border-[#a855f7] sm:rounded-2xl flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="shrink-0 bg-[#090d16] border-b border-[#1e2e48] px-4 py-3 flex items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-[#a855f7] uppercase tracking-wider">
            RELIQUIE & SINERGIE ({activeRelics.length})
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[38px] px-3 rounded-lg bg-[#141d2d] border border-[#1e2e48] text-white font-bold text-xs uppercase cursor-pointer active:scale-95"
          >
            ✕ CHIUDI
          </button>
        </div>

        {/* Single Scrollable Body (Zero Nested Scroll Containers!) */}
        <div className="flex-1 min-h-0 modal-scroll p-4 space-y-3">
          {/* Active Dual-Element Fusion Combos */}
          {activeFusions.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-[#ffe600] uppercase">
                COMBO FUSIONE ATTIVE
              </div>
              {activeFusions.map((fusionId) => {
                const fInfo = FUSION_COMBOS[fusionId];
                return (
                  <div
                    key={fusionId}
                    className="p-3 rounded-xl bg-[#141d2d] border-2"
                    style={{ borderColor: fInfo.color }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase" style={{ color: fInfo.color }}>
                        {fInfo.title}
                      </span>
                      <span className="text-[11px] font-mono text-slate-300">
                        [{fInfo.familyA} + {fInfo.familyB}]
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 mt-1">{fInfo.description}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Resonance Grid */}
          <div>
            <div className="text-xs font-mono font-bold text-slate-400 uppercase mb-2">
              RISONANZE DI SET
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(resonances) as RelicFamilyId[]).map((fam) => {
                const count = resonances[fam];
                const tier = engine.getResonanceTier(fam);
                const info = RELIC_FAMILIES[fam];
                return (
                  <div
                    key={fam}
                    className="p-2.5 rounded-xl bg-[#141d2d] border-2 flex flex-col justify-between"
                    style={{
                      borderColor: tier > 0 ? info.color : '#1e2e48',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase" style={{ color: info.color }}>
                        {info.label}
                      </span>
                      <span className="text-xs font-mono font-bold text-white tabular-nums">
                        {count}x
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 mt-1">
                      {tier === 2
                        ? '★ Tier 2 Maestria'
                        : tier === 1
                        ? '★ Tier 1 Sinergia'
                        : 'Serve 2x'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Equipped Relics List */}
          <div className="space-y-2">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase">
              RELIQUIE EQUIPAGGIATE
            </div>
            {activeRelics.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Nessuna reliquia equipaggiata.
              </p>
            ) : (
              activeRelics.map((rId, idx) => {
                const r = RELICS_DATA[rId];
                if (!r) return null;
                const fam = RELIC_FAMILIES[r.family];
                return (
                  <div
                    key={`${rId}-${idx}`}
                    className="p-3 rounded-xl bg-[#141d2d] border-2 flex flex-col gap-1"
                    style={{ borderColor: fam.color }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{r.title}</span>
                      <span className="text-xs font-mono font-bold" style={{ color: fam.color }}>
                        [{fam.label.toUpperCase()}]
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">{r.description}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="shrink-0 bg-[#090d16] border-t border-[#1e2e48] p-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[46px] rounded-xl bg-[#a855f7] text-[#080b12] font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-[0.99]"
          >
            TORNA ALLA PARTITA
          </button>
        </div>
      </div>
    </div>
  );
};
