import React, { useState, useEffect } from 'react';
import { GameEngine } from '../game/GameEngine';
import {
  ARCHETYPES_DATA,
  ArchetypeId,
  RELIC_FAMILIES,
  RELICS_DATA,
  GameMode,
  STORY_CHAPTERS,
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
  const preferredOrder: ArchetypeId[] = [
    'PYRO_DETONATOR',
    'VOLT_OVERCHARGE',
    'SWARM_MATRIX',
    'KINETIC_TITAN',
    'PROTO_CORE',
    'CRYSTAL_SINGULARITY',
    'CHRONO_PULSE',
    'QUANTUM_SINGULARITY',
  ];
  const archetypes = preferredOrder.map((id) => ARCHETYPES_DATA[id]).filter(Boolean);
  const [selectedId, setSelectedId] = useState<ArchetypeId>('PYRO_DETONATOR');
  const [selectedMode, setSelectedMode] = useState<GameMode>(engine.gameMode || 'STORY');
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [, setTick] = useState(0);

  const selectedArch = ARCHETYPES_DATA[selectedId] || ARCHETYPES_DATA.PROTO_CORE;
  const isSelectedUnlocked = engine.isArchetypeAvailable(selectedArch.id);

  const storyProgress = progData.storyProgress || {
    highestChapterUnlocked: 1,
    storyCompleted: false,
    highestStorySector: 1,
  };

  const handleStartWithArchetype = (id: ArchetypeId, instantArena: boolean = false) => {
    if (!engine.isArchetypeAvailable(id)) return;
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    engine.initGame(instantArena ? 'STORY' : selectedMode);
    engine.selectArchetype(
      id,
      instantArena ? 'STORY' : selectedMode,
      instantArena ? 1 : selectedChapter,
      instantArena
    );
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
        if (engine.isArchetypeAvailable(selectedArch.id)) {
          handleStartWithArchetype(selectedArch.id);
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
      className="fixed inset-0 z-50 bg-[#08090c]/96 flex items-center justify-center sm:p-4"
    >
      <div className="w-full h-full sm:h-auto sm:max-h-[92dvh] max-w-lg bg-[#0c0e13] sm:border border-[#272b36] sm:rounded-2xl flex flex-col overflow-hidden">
        {/* Top Minimalist Header (shrink-0) */}
        <div className="shrink-0 bg-[#0c0e13] border-b border-[#222630] px-3.5 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <svg
              viewBox="0 0 32 32"
              className="w-6 h-6 shrink-0"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="3"
                width="26"
                height="26"
                rx="5"
                fill="#14171f"
                stroke="#a1a1aa"
                strokeWidth="2"
              />
              <circle cx="16" cy="16" r="5" fill="#d4b483" />
            </svg>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg sm:text-xl font-bold tracking-wider text-zinc-100 uppercase leading-none">
                  CUBOCLAST
                </h1>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#161922] border border-[#2d323e] text-zinc-300 leading-none">
                  v0.15.0
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5 truncate">
                Reazioni a Catena &amp; Blocchi di Classe ◇
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onOpenInstall}
              className="min-h-[36px] px-2 rounded-lg bg-[#14171f] border border-[#2d323e] text-zinc-300 font-bold text-[11px] uppercase tracking-wide cursor-pointer active:scale-95"
            >
              APK
            </button>
            <button
              type="button"
              onClick={onOpenCodex}
              className="min-h-[36px] px-2 rounded-lg bg-[#14171f] border border-[#2d323e] text-zinc-300 font-bold text-[11px] uppercase tracking-wide cursor-pointer active:scale-95"
            >
              CODEX
            </button>
            <button
              type="button"
              onClick={onOpenShop}
              className="min-h-[36px] px-2 rounded-lg bg-[#14171f] border border-[#2d323e] text-[#d4b483] font-bold text-[11px] uppercase tracking-wide cursor-pointer active:scale-95 tabular-nums whitespace-nowrap"
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
          {/* 1-Tap Experimental Hand-Crafted Arenas Bar (Pyro, Volt, Swarm) */}
          <div className="rounded-xl bg-[#11141c] border border-[#2d3342] p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#d4b483]">
                ◇ PROVA SUBITO I 3 CAMPI SU MISURA (1-TAP)
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                CAP. 1 · ZERO POPUP
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                data-testid="quick-arena-pyro"
                onClick={() => handleStartWithArchetype('PYRO_DETONATOR', true)}
                className="min-h-[54px] px-2 py-2 rounded-lg bg-[#1c1412] border border-[#c87d65] text-left cursor-pointer active:scale-95 transition"
              >
                <div className="text-xs font-bold text-[#c87d65] uppercase tracking-wide">
                  ◇ PYRO
                </div>
                <div className="text-[10px] text-zinc-300 leading-tight mt-0.5">
                  Innesco a Grappolo
                </div>
              </button>

              <button
                type="button"
                data-testid="quick-arena-volt"
                onClick={() => handleStartWithArchetype('VOLT_OVERCHARGE', true)}
                className="min-h-[54px] px-2 py-2 rounded-lg bg-[#141922] border border-[#7c9cb4] text-left cursor-pointer active:scale-95 transition"
              >
                <div className="text-xs font-bold text-[#7c9cb4] uppercase tracking-wide">
                  ◇ VOLT
                </div>
                <div className="text-[10px] text-zinc-300 leading-tight mt-0.5">
                  Ponte Fulmini
                </div>
              </button>

              <button
                type="button"
                data-testid="quick-arena-swarm"
                onClick={() => handleStartWithArchetype('SWARM_MATRIX', true)}
                className="min-h-[54px] px-2 py-2 rounded-lg bg-[#171521] border border-[#9b95b8] text-left cursor-pointer active:scale-95 transition"
              >
                <div className="text-xs font-bold text-[#9b95b8] uppercase tracking-wide">
                  ◇ SWARM
                </div>
                <div className="text-[10px] text-zinc-300 leading-tight mt-0.5">
                  Camera Scissione
                </div>
              </button>
            </div>
          </div>

          {/* Resume Active Run Card */}
          {progData.savedRun.hasActiveRun && (
            <div className="rounded-xl bg-[#14181b] border border-[#7fa68e]/60 p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#7fa68e] uppercase tracking-wider">
                  RIPRENDI PARTITA ATTIVA
                </div>
                <div className="text-xs text-zinc-200 font-mono mt-0.5 tabular-nums truncate">
                  Settore {progData.savedRun.savedLevel} ·{' '}
                  {progData.savedRun.savedScore.toLocaleString()} Punti ·{' '}
                  {progData.savedRun.savedBalls} Sfere
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => engine.resumeSavedRun()}
                  className="min-h-[42px] px-4 rounded-lg bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-95"
                >
                  RIPRENDI
                </button>
                <button
                  type="button"
                  onClick={handleAbandonSavedRun}
                  title="Abbandona partita salvata"
                  className="min-h-[42px] px-2.5 rounded-lg bg-[#14171f] border border-[#2d323e] text-zinc-400 font-bold text-xs uppercase cursor-pointer active:scale-95"
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
              className={`min-h-[48px] px-3 py-2 rounded-xl border text-left transition cursor-pointer ${
                selectedMode === 'STORY'
                  ? 'bg-[#161922] border-zinc-400 text-zinc-100'
                  : 'bg-[#101218] border-[#222630] text-zinc-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  CAMPAGNA STORIA
                </span>
                <span className="text-[11px] font-mono text-zinc-400 tabular-nums">
                  25 SETT.
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                {storyProgress.storyCompleted
                  ? 'Completata · 5 Boss'
                  : `Cap. ${storyProgress.highestChapterUnlocked}/5 · Bivi & Boss`}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMode('ARCADE')}
              className={`min-h-[48px] px-3 py-2 rounded-xl border text-left transition cursor-pointer ${
                selectedMode === 'ARCADE'
                  ? 'bg-[#161922] border-zinc-400 text-zinc-100'
                  : 'bg-[#101218] border-[#222630] text-zinc-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  ARCADE CLASSICA
                </span>
                <span className="text-[11px] font-mono text-zinc-400 tabular-nums">
                  10 SETT.
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                Run rapida · Boss Sett. 5 e 10
              </div>
            </button>
          </div>

          {/* Chapter Selector for Story Mode */}
          {selectedMode === 'STORY' && (
            <div className="rounded-xl bg-[#101218] border border-[#222630] p-2.5 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
                <span>CAPITOLO DI PARTENZA:</span>
                <span className="text-zinc-200">
                  {STORY_CHAPTERS[selectedChapter].title}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((chapId) => {
                  const chapUnlocked = chapId <= storyProgress.highestChapterUnlocked;
                  const active = selectedChapter === chapId;
                  return (
                    <button
                      key={chapId}
                      type="button"
                      disabled={!chapUnlocked}
                      onClick={() => setSelectedChapter(chapId)}
                      className={`min-h-[34px] rounded-lg text-xs font-mono font-bold transition ${
                        active
                          ? 'bg-zinc-200 text-zinc-950 cursor-pointer'
                          : chapUnlocked
                          ? 'bg-[#161922] text-zinc-300 border border-[#2d323e] cursor-pointer'
                          : 'bg-[#0c0e13] text-zinc-600 border border-[#1c1f28] cursor-not-allowed'
                      }`}
                    >
                      {chapUnlocked ? `CAP.${chapId}` : `🔒${chapId}`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Vertical List of Archetype Cards */}
          <div className="space-y-2.5 pt-1">
            {archetypes.map((arch) => {
              const unlocked = engine.isArchetypeAvailable(arch.id);
              const isSelected = arch.id === selectedArch.id;
              const fam = RELIC_FAMILIES[arch.family];
              const initialRelic = arch.initialRelic ? RELICS_DATA[arch.initialRelic] : null;
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
                  className={`w-full rounded-xl p-3.5 text-left transition cursor-pointer border ${
                    isSelected ? 'bg-[#161922]' : 'bg-[#11131a] hover:bg-[#161922]'
                  }`}
                  style={{
                    borderColor: isSelected
                      ? arch.color
                      : unlocked
                      ? '#2d323e'
                      : '#1c1f28',
                  }}
                >
                  {/* Top Row: Circle Dot + Title + [FAMIGLIA] Tag */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: unlocked ? arch.color : '#3f3f46' }}
                      />
                      <span className="text-sm sm:text-base font-bold text-zinc-100 truncate">
                        {arch.title}
                      </span>
                    </div>

                    <span
                      className="text-xs font-bold font-mono tracking-wide shrink-0"
                      style={{ color: unlocked ? arch.color : '#52525b' }}
                    >
                      {arch.id === 'PROTO_CORE'
                        ? '[NEUTRO · BASE]'
                        : `[${fam.label.toUpperCase()}]`}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-zinc-300 leading-relaxed mt-1.5">
                    {arch.description}
                  </p>

                  {/* Signature Class Block (Hybrid B v0.11.0) */}
                  <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-[#0c0e13] border border-[#222630] flex items-start gap-2">
                    <span
                      className="text-xs font-mono font-bold shrink-0 mt-0.5"
                      style={{ color: unlocked ? arch.color : '#71717a' }}
                    >
                      ◇ {arch.classBlockName}:
                    </span>
                    <span className="text-[11px] text-zinc-300 leading-snug">
                      {arch.classBlockEffect}
                    </span>
                  </div>

                  {/* Bottom Row: Initial Relic / Unlock Condition + Direct Action Button */}
                  <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-[#222630]">
                    <span className="text-[11px] font-mono text-zinc-400 truncate">
                      {unlocked
                        ? initialRelic
                          ? `Reliquia: ${initialRelic.title}`
                          : '0 Reliquie Iniziali · Fisica Pura'
                        : `🔒 ${arch.unlockCondition}`}
                    </span>

                    {unlocked ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(arch.id);
                          handleStartWithArchetype(arch.id);
                        }}
                        className="min-h-[36px] px-3.5 rounded-lg font-bold text-xs uppercase tracking-wider bg-zinc-200 text-zinc-950 shrink-0 cursor-pointer active:scale-95"
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
                              ? 'bg-[#d4b483] text-zinc-950 cursor-pointer active:scale-95'
                              : 'bg-[#1c1f28] text-zinc-500 cursor-not-allowed'
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
          <div className="pt-2 pb-1 flex items-center justify-between text-xs font-mono text-zinc-400 border-t border-[#222630] tabular-nums">
            <span>
              Run: <strong className="text-zinc-200">{progData.runsPlayed}</strong> · Record:{' '}
              <strong className="text-zinc-200">{progData.highestScore.toLocaleString()}</strong>
            </span>
            <span>
              Settore Max: <strong className="text-[#d4b483]">{progData.bestSector}</strong>
            </span>
          </div>
        </div>

        {/* Sticky Bottom Primary Action Bar (shrink-0) */}
        <div className="shrink-0 bg-[#0c0e13] border-t border-[#222630] p-3">
          {isSelectedUnlocked ? (
            <button
              type="button"
              data-start="true"
              onClick={() => handleStartWithArchetype(selectedArch.id)}
              className="w-full min-h-[48px] rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 font-bold text-sm sm:text-base uppercase tracking-wider transition cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span>
                AVVIA {selectedMode === 'STORY' ? `CAP.${selectedChapter}` : 'ARCADE'} ·{' '}
                {selectedArch.title.toUpperCase()}
              </span>
            </button>
          ) : (
            <button
              type="button"
              disabled={
                !selectedArch.unlockCost || progData.quantumShards < selectedArch.unlockCost
              }
              onClick={(e) => handleUnlockWithShards(selectedArch.id, e)}
              className={`w-full min-h-[48px] rounded-xl font-bold text-sm uppercase tracking-wider transition flex items-center justify-center ${
                selectedArch.unlockCost && progData.quantumShards >= selectedArch.unlockCost
                  ? 'bg-[#d4b483] text-zinc-950 cursor-pointer active:scale-[0.99]'
                  : 'bg-[#14171f] border border-[#222630] text-zinc-500 cursor-not-allowed'
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
