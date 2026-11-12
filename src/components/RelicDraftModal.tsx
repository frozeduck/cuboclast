import React from 'react';
import { GameEngine } from '../game/GameEngine';
import { RELICS_DATA, RELIC_FAMILIES, RELIC_RARITIES } from '../types/game';

interface RelicDraftModalProps {
  engine: GameEngine;
}

export const RelicDraftModal: React.FC<RelicDraftModalProps> = ({ engine }) => {
  const choices = engine.draftChoices;
  const resonances = engine.getActiveResonances();
  const isStarter = engine.isStarterDraft;

  return (
    <div
      role="dialog"
      aria-label="Draft Reliquia Roguelike"
      className="fixed inset-0 z-50 bg-[#08090c]/96 flex items-center justify-center sm:p-4"
    >
      <div className="w-full h-full sm:h-auto sm:max-h-[92dvh] max-w-lg bg-[#0c0e13] sm:border border-[#272b36] sm:rounded-2xl flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="shrink-0 bg-[#0c0e13] border-b border-[#222630] px-4 py-3 text-center">
          <div className="text-xs font-mono text-[#7fa68e] uppercase tracking-wider">
            {isStarter
              ? `DOTAZIONE TATTICA DI INIZIO RUN · SETTORE ${engine.currentLevel}`
              : `SETTORE ${engine.currentLevel} PURIFICATO · RIFORNIMENTO COMPLETATO`}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-100 uppercase tracking-wider mt-0.5">
            {isStarter ? 'SCEGLI LA TUA RELIQUIA INIZIALE' : 'SCEGLI UN POWER-UP ROGUELIKE'}
          </h2>
          <div className="mt-2 py-1.5 px-3 rounded-lg bg-[#13161e] border border-[#272b36] flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-mono">
            {isStarter ? (
              <>
                <span className="text-zinc-200 font-bold">
                  ● SFERE INIZIALI: {engine.ballsRemaining}
                </span>
                <span className="text-zinc-600">·</span>
                <span className="text-[#d4b483] font-bold">
                  ★ BONUS INIZIO RUN: 1 RELIQUIA GRATUITA + OVERCHARGE 1° TIRO
                </span>
              </>
            ) : (
              <>
                <span className="text-zinc-200 font-bold">
                  ● SFERE PRONTE: {engine.ballsRemaining}
                </span>
                <span className="text-zinc-600">·</span>
                <span className="text-[#d4b483] font-bold">
                  ⚡ OVERCHARGE 1° TIRO: +{engine.nextSectorOverchargeStacks * 25}% DMG & +
                  {Math.min(3, Math.ceil(Math.max(1, engine.nextSectorOverchargeStacks) / 2))}{' '}
                  MINI-SFERE
                </span>
                {engine.lastFeverSummary &&
                  (engine.lastFeverSummary.ballsCaught > 0 ||
                    engine.lastFeverSummary.overchargeCaught > 0 ||
                    engine.lastFeverSummary.shardsCaught > 0) && (
                    <>
                      <span className="text-zinc-600">·</span>
                      <span className="text-[#7fa68e]">
                        CAPSULE FEVER: +{engine.lastFeverSummary.ballsCaught}● / +
                        {engine.lastFeverSummary.overchargeCaught}◇ / +
                        {engine.lastFeverSummary.shardsCaught}◆
                      </span>
                    </>
                  )}
              </>
            )}
          </div>
        </div>

        {/* Single Scrollable Body */}
        <div className="flex-1 min-h-0 modal-scroll p-4 space-y-3">
          {choices.map((relicId) => {
            const relic = RELICS_DATA[relicId];
            if (!relic) return null;
            const fam = RELIC_FAMILIES[relic.family];
            const rar = RELIC_RARITIES[relic.rarity];
            const currentFamCount = resonances[relic.family] || 0;
            const willTriggerSynergy = currentFamCount === 1;
            const willTriggerMastery = currentFamCount >= 2;

            return (
              <button
                type="button"
                key={relic.id}
                onClick={() => engine.selectRelic(relic.id)}
                className="w-full text-left p-4 rounded-xl bg-[#13161e] hover:bg-[#181c26] border transition cursor-pointer active:scale-[0.99] flex flex-col gap-1.5"
                style={{ borderColor: rar.color }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: fam.color }}
                    />
                    <span className="font-bold text-sm sm:text-base text-zinc-100 truncate">
                      {relic.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase"
                      style={{ color: rar.color, borderColor: rar.color }}
                    >
                      {rar.label}
                    </span>
                    <span
                      className="text-xs font-mono font-bold"
                      style={{ color: fam.color }}
                    >
                      [{fam.label.toUpperCase()}]
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {relic.description}
                </p>

                <div className="pt-1.5 border-t border-[#222630] flex items-center justify-between text-[11px] font-mono">
                  <span style={{ color: fam.color }}>
                    Set {fam.label}: {currentFamCount} → {currentFamCount + 1}
                    {willTriggerMastery
                      ? ' (★ MAESTRIA 3x!)'
                      : willTriggerSynergy
                      ? ' (★ SINERGIA 2x!)'
                      : ''}
                  </span>
                  <span className="text-zinc-200 font-bold">
                    {isStarter ? 'EQUIPAGGIA E INIZIA →' : 'SELEZIONA →'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Fixed Footer: Reroll + Skip for Shards */}
        <div className="shrink-0 bg-[#0c0e13] border-t border-[#222630] p-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => engine.rerollDraft()}
            disabled={engine.rerollsAvailable <= 0}
            className={`min-h-[46px] rounded-xl font-bold text-xs uppercase tracking-wider transition ${
              engine.rerollsAvailable > 0
                ? 'bg-[#14171f] border border-[#d4b483] text-[#d4b483] cursor-pointer active:scale-[0.99]'
                : 'bg-[#101218] border border-[#1c1f28] text-zinc-600 cursor-not-allowed'
            }`}
          >
            REROLL ({engine.rerollsAvailable})
          </button>

          <button
            type="button"
            onClick={() => engine.skipRelicDraft()}
            className="min-h-[46px] rounded-xl bg-[#14171f] border border-[#2d323e] text-zinc-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer active:scale-[0.99]"
          >
            {isStarter ? 'SALTA (+1 ● & +15 ◆)' : 'SALTA (+15 ◆)'}
          </button>
        </div>
      </div>
    </div>
  );
};
