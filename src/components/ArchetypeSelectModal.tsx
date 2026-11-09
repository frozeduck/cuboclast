import React, { useState, useEffect } from 'react';
import { GameEngine } from '../game/GameEngine';
import {
  ARCHETYPES_DATA,
  ArchetypeId,
  RELIC_FAMILIES,
  RELICS_DATA,
  GameMode,
} from '../types/game';

interface ArchetypeSelectModalProps {
  engine: GameEngine;
  onOpenShop: () => void;
  onOpenCodex: () => void;
  onOpenInstall: () => void;
}

export const ArchetypeSelectModal: React.FC<ArchetypeSelectModalProps> = ({
  engine,
  onOpenShop,
  onOpenCodex,
  onOpenInstall,
}) => {
  const progData = engine.progression.getData();
  const archetypes = Object.values(ARCHETYPES_DATA);
  const [selectedId, setSelectedId] = useState<ArchetypeId>('VOLT_OVERCHARGE');
  const [selectedMode, setSelectedMode] = useState<GameMode>(engine.gameMode || 'STORY');
  const [, setTick] = useState(0);

  const selectedArch = ARCHETYPES_DATA[selectedId];
  const isSelectedUnlocked = engine.progression.isArchetypeUnlocked(selectedId);

  const storyProgress = progData.storyProgress || {
    highestChapterUnlocked: 1,
    storyCompleted: false,
    highestStorySector: 1,
  };

  const handleStartWithArchetype = (id: ArchetypeId) => {
    if (!engine.progression.isArchetypeUnlocked(id)) return;
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    engine.initGame(selectedMode);
    engine.selectArchetype(id, selectedMode);
  };

  const handleUnlockWithShards = (id: ArchetypeId, e: React.MouseEvent) => {
    e.stopPropagation();
    if (engine.progression.unlockArchetypeWithShards(id)) {
      setSelectedId(id);
      setTick((t) => t + 1);
    }
  };

  const handleAbandonSavedRun = () => {
    engine.abandonRun();
    setTick((t) => t + 1);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'A') return;
        e.preventDefault();
        if (engine.progression.isArchetypeUnlocked(selectedId)) {
          handleStartWithArchetype(selectedId);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return (
    <div
      role="dialog"
      aria-label="Selezione Nucleo CuboClast"
      className="fixed inset-0 z-50 bg-[#080b12]/96 flex items-center justify-center sm:p-4"
    >
      <div className="w-full h-full sm:h-auto sm:max-h-[92dvh] max-w-lg bg-[#090d16] sm:border-2 border-[#00e5ff] sm:rounded-2xl flex flex-col overflow-hidden">
        {/* Top Minimalist Header (shrink-0) */}
        <div className="shrink-0 bg-[#090d16] border-b border-[#1e2e48] px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <svg
              viewBox="0 0 32 32"
              className="w-7 h-7 shrink-0"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="3"
                width="26"
                height="26"
                rx="5"
                fill="#082635"
                stroke="#00e5ff"
                strokeWidth="2.5"
              />
              <circle cx="16" cy="16" r="5" fill="#ffe600" />
            </svg>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-wider text-[#00e5ff] uppercase leading-none">
                CUBOCLAST
              </h1>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Scegli il tuo nucleo di potere
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenInstall}
              className="min-h-[38px] px-2.5 rounded-lg bg-[#141d2d] border border-[#00ff88] text-[#00ff88] font-bold text-xs uppercase tracking-wide cursor-pointer active:scale-95"
            >
              APK
            </button>
            <button
              type="button"
              onClick={onOpenCodex}
              className="min-h-[38px] px-2.5 rounded-lg bg-[#141d2d] border border-[#a855f7] text-[#a855f7] font-bold text-xs uppercase tracking-wide cursor-pointer active:scale-95"
            >
              CODEX
            </button>
            <button
              type="button"
              onClick={onOpenShop}
              className="min-h-[38px] px-2.5 rounded-lg bg-[#141d2d] border border-[#38bdf8] text-[#38bdf8] font-bold text-xs uppercase tracking-wide cursor-pointer active:scale-95 tabular-nums"
            >
              ◆ {progData.quantumShards}
            </button>
          </div>
        </div>

        {/* Single Scrollable Body (flex-1 min-h-0 modal-scroll) */}
        <div
          data-testid="archetype-scroll-body"
          className="flex-1 min-h-0 modal-scroll px-4 py-3 space-y-3"
        >
          {/* Resume Active Run Card (v0.4.0 Minimalist Style) */}
          {progData.savedRun.hasActiveRun && (
            <div className="rounded-xl bg-[#063528] border-2 border-[#00ff88] p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#00ff88] uppercase tracking-wider">
                  RIPRENDI PARTITA ATTIVA
                </div>
                <div className="text-xs text-white font-mono mt-0.5 tabular-nums truncate">
                  Settore {progData.savedRun.savedLevel} ·{' '}
                  {progData.savedRun.savedScore.toLocaleString()} Punti ·{' '}
                  {progData.savedRun.savedBalls} Sfere
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => engine.resumeSavedRun()}
                  className="min-h-[42px] px-4 rounded-lg bg-[#00ff88] text-[#080b12] font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-95"
                >
                  RIPRENDI
                </button>
                <button
                  type="button"
                  onClick={handleAbandonSavedRun}
                  title="Abbandona partita salvata"
                  className="min-h-[42px] px-2.5 rounded-lg bg-[#141d2d] border border-rose-500/60 text-rose-400 font-bold text-xs uppercase cursor-pointer active:scale-95"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Minimalist Segmented Mode Switch */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedMode('STORY')}
              className={`min-h-[48px] px-3 py-2 rounded-xl border-2 text-left transition cursor-pointer ${
                selectedMode === 'STORY'
                  ? 'bg-[#141d2d] border-[#00e5ff] text-white'
                  : 'bg-[#0c121e] border-[#1e2e48] text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#00e5ff]">
                  CAMPAGNA STORIA
                </span>
                <span className="text-[11px] font-mono text-slate-300 tabular-nums">
                  25 SETT.
                </span>
              </div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">
                {storyProgress.storyCompleted
                  ? 'Completata · 5 Boss'
                  : `Cap. ${storyProgress.highestChapterUnlocked}/5 · 5 Boss`}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMode('ARCADE')}
              className={`min-h-[48px] px-3 py-2 rounded-xl border-2 text-left transition cursor-pointer ${
                selectedMode === 'ARCADE'
                  ? 'bg-[#141d2d] border-[#ff007f] text-white'
                  : 'bg-[#0c121e] border-[#1e2e48] text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#ff007f]">
                  ARCADE CLASSICA
                </span>
                <span className="text-[11px] font-mono text-slate-300 tabular-nums">
                  10 SETT.
                </span>
              </div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">
                Run rapida · Boss Sett. 5 e 10
              </div>
            </button>
          </div>

          {/* Vertical List of Archetype Cards (v0.4.0 Minimalist Style — Scrollable & Selectable) */}
          <div className="space-y-2.5 pt-1">
            {archetypes.map((arch) => {
              const unlocked = engine.progression.isArchetypeUnlocked(arch.id);
              const isSelected = arch.id === selectedId;
              const fam = RELIC_FAMILIES[arch.family];
              const initialRelic = RELICS_DATA[arch.initialRelic];
              const canAfford =
                !unlocked &&
                arch.unlockCost !== undefined &&
                progData.quantumShards >= arch.unlockCost;

              return (
                <div
                  key={arch.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedId(arch.id);
                    if (unlocked && isSelected) {
                      handleStartWithArchetype(arch.id);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedId(arch.id);
                      if (unlocked) handleStartWithArchetype(arch.id);
                    }
                  }}
                  className={`w-full rounded-xl p-3.5 text-left transition cursor-pointer border-2 ${
                    isSelected ? 'bg-[#141d2d]' : 'bg-[#0e1524] hover:bg-[#141d2d]'
                  }`}
                  style={{
                    borderColor: isSelected
                      ? arch.color
                      : unlocked
                      ? `${arch.color}66`
                      : '#1e2e48',
                  }}
                >
                  {/* Top Row: Circle Dot + Title + [FAMIGLIA] Tag */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-4 h-4 rounded-full shrink-0"
                        style={{ backgroundColor: arch.color }}
                      />
                      <span className="text-sm sm:text-base font-bold text-white truncate">
                        {arch.title}
                      </span>
                    </div>

                    <span
                      className="text-xs font-bold font-mono tracking-wide shrink-0"
                      style={{ color: unlocked ? arch.color : '#94a3b8' }}
                    >
                      [{fam.label.toUpperCase()}]
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-200 leading-relaxed mt-1.5">
                    {arch.description}
                  </p>

                  {/* Bottom Row: Initial Relic + Direct Action Button */}
                  <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-[#1e2e48]">
                    <span className="text-[11px] font-mono text-slate-400 truncate">
                      {unlocked
                        ? `Reliquia: ${initialRelic?.title}`
                        : `Sblocco: ${arch.unlockCondition}`}
                    </span>

                    {unlocked ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(arch.id);
                          handleStartWithArchetype(arch.id);
                        }}
                        className="min-h-[36px] px-3.5 rounded-lg font-bold text-xs uppercase tracking-wider text-[#080b12] shrink-0 cursor-pointer active:scale-95"
                        style={{ backgroundColor: arch.color }}
                      >
                        GIOCA →
                      </button>
                    ) : (
                      arch.unlockCost !== undefined && (
                        <button
                          type="button"
                          disabled={!canAfford}
                          onClick={(e) => handleUnlockWithShards(arch.id, e)}
                          className={`min-h-[36px] px-3 rounded-lg font-bold text-xs uppercase tracking-wider shrink-0 ${
                            canAfford
                              ? 'bg-[#ffe600] text-[#080b12] cursor-pointer active:scale-95'
                              : 'bg-[#1e2e48] text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          SBLOCCA ◆ {arch.unlockCost}
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats Summary Line */}
          <div className="pt-2 pb-1 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-[#1e2e48] tabular-nums">
            <span>
              Run: <strong className="text-white">{progData.runsPlayed}</strong> · Record:{' '}
              <strong className="text-[#00e5ff]">{progData.highestScore.toLocaleString()}</strong>
            </span>
            <span>
              Settore Max: <strong className="text-[#00ff88]">{progData.bestSector}</strong>
            </span>
          </div>
        </div>

        {/* Sticky Bottom Primary Action Bar (shrink-0) */}
        <div className="shrink-0 bg-[#090d16] border-t border-[#1e2e48] p-3">
          {isSelectedUnlocked ? (
            <button
              type="button"
              data-start="true"
              onClick={() => handleStartWithArchetype(selectedId)}
              className="w-full min-h-[48px] rounded-xl bg-[#00e5ff] hover:bg-[#38bdf8] text-[#080b12] font-bold text-sm sm:text-base uppercase tracking-wider transition cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span>
                AVVIA {selectedMode === 'STORY' ? 'STORIA' : 'ARCADE'} · {selectedArch.title.toUpperCase()}
              </span>
            </button>
          ) : (
            <button
              type="button"
              disabled={
                !selectedArch.unlockCost || progData.quantumShards < selectedArch.unlockCost
              }
              onClick={(e) => handleUnlockWithShards(selectedId, e)}
              className={`w-full min-h-[48px] rounded-xl font-bold text-sm uppercase tracking-wider transition flex items-center justify-center ${
                selectedArch.unlockCost && progData.quantumShards >= selectedArch.unlockCost
                  ? 'bg-[#ffe600] text-[#080b12] cursor-pointer active:scale-[0.99]'
                  : 'bg-[#141d2d] border border-[#1e2e48] text-slate-400 cursor-not-allowed'
              }`}
            >
              SBLOCCA {selectedArch.title.toUpperCase()} (◆ {selectedArch.unlockCost || 0})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
