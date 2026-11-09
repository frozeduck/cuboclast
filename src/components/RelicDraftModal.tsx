import React from 'react';
import { GameEngine } from '../game/GameEngine';
import { RELICS_DATA, RELIC_FAMILIES } from '../types/game';

interface RelicDraftModalProps {
  engine: GameEngine;
}

export const RelicDraftModal: React.FC<RelicDraftModalProps> = ({ engine }) => {
  const choices = engine.draftChoices;
  const resonances = engine.getActiveResonances();

  return (
    <div
      role="dialog"
      aria-label="Draft Reliquia Roguelike"
      className="fixed inset-0 z-50 bg-[#080b12]/96 flex items-center justify-center sm:p-4"
    >
      <div className="w-full h-full sm:h-auto sm:max-h-[92dvh] max-w-lg bg-[#090d16] sm:border-2 border-[#00e5ff] sm:rounded-2xl flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="shrink-0 bg-[#090d16] border-b border-[#1e2e48] px-4 py-3 text-center">
          <div className="text-xs font-mono text-[#00ff88] uppercase tracking-wider">
            SETTORE {engine.currentLevel} PURIFICATO
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#00e5ff] uppercase tracking-wider mt-0.5">
            SCEGLI UNA RELIQUIA ROGUELIKE
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Dopo la scelta si aprirà il Bivio Tattico per il prossimo settore
          </p>
        </div>

        {/* Single Scrollable Body (v0.4.0 Minimalist Relic Cards) */}
        <div className="flex-1 min-h-0 modal-scroll p-4 space-y-3">
          {choices.map((relicId) => {
            const relic = RELICS_DATA[relicId];
            if (!relic) return null;
            const fam = RELIC_FAMILIES[relic.family];
            const currentFamCount = resonances[relic.family] || 0;
            const willTriggerSynergy = currentFamCount === 1;
            const willTriggerMastery = currentFamCount >= 2;

            return (
              <button
                type="button"
                key={relic.id}
                onClick={() => engine.selectRelic(relic.id)}
                className="w-full text-left p-4 rounded-xl bg-[#141d2d] hover:bg-[#1a263b] border-2 transition cursor-pointer active:scale-[0.99] flex flex-col gap-1.5"
                style={{ borderColor: fam.color }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: fam.color }}
                    />
                    <span className="font-bold text-sm sm:text-base text-white truncate">
                      {relic.title}
                    </span>
                  </div>

                  <span
                    className="text-xs font-mono font-bold shrink-0"
                    style={{ color: fam.color }}
                  >
                    [{fam.label.toUpperCase()} · T{relic.tier}]
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  {relic.description}
                </p>

                <div className="pt-1.5 border-t border-[#1e2e48] flex items-center justify-between text-[11px] font-mono">
                  <span style={{ color: fam.color }}>
                    Set {fam.label}: {currentFamCount} → {currentFamCount + 1}
                    {willTriggerMastery
                      ? ' (★ MAESTRIA 3x!)'
                      : willTriggerSynergy
                      ? ' (★ SINERGIA 2x!)'
                      : ''}
                  </span>
                  <span className="text-[#00e5ff] font-bold">SELEZIONA →</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Fixed Footer: Reroll + Skip for Shards */}
        <div className="shrink-0 bg-[#090d16] border-t border-[#1e2e48] p-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => engine.rerollDraft()}
            disabled={engine.rerollsAvailable <= 0}
            className={`min-h-[46px] rounded-xl font-bold text-xs uppercase tracking-wider transition ${
              engine.rerollsAvailable > 0
                ? 'bg-[#141d2d] border-2 border-[#ffe600] text-[#ffe600] cursor-pointer active:scale-[0.99]'
                : 'bg-[#0e1524] border border-[#1e2e48] text-slate-600 cursor-not-allowed'
            }`}
          >
            REROLL ({engine.rerollsAvailable})
          </button>

          <button
            type="button"
            onClick={() => engine.skipRelicDraft()}
            className="min-h-[46px] rounded-xl bg-[#141d2d] border-2 border-[#38bdf8] text-[#38bdf8] font-bold text-xs uppercase tracking-wider transition cursor-pointer active:scale-[0.99]"
          >
            SALTA (+15 ◆)
          </button>
        </div>
      </div>
    </div>
  );
};
