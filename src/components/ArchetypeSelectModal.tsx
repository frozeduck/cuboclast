import React, { useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import {
  ARCHETYPES_DATA,
  ArchetypeId,
  RELIC_FAMILIES,
  RELICS_DATA,
  GameMode,
} from '../types/game';
import {
  Play,
  ShoppingBag,
  Sparkles,
  Lock,
  CheckCircle2,
  Zap,
  Flame,
  Activity,
  Shield,
  Snowflake,
  Compass,
  Clock,
  BookOpen,
  Sword,
  Target,
  Smartphone,
  Trash2,
} from 'lucide-react';

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
  const isUnlocked = engine.progression.isArchetypeUnlocked(selectedId);
  const fam = RELIC_FAMILIES[selectedArch.family];
  const initialRelic = RELICS_DATA[selectedArch.initialRelic];

  const storyProgress = progData.storyProgress || {
    highestChapterUnlocked: 1,
    storyCompleted: false,
    highestStorySector: 1,
  };

  const handleUnlockWithShards = (id: ArchetypeId) => {
    if (engine.progression.unlockArchetypeWithShards(id)) {
      setTick((t) => t + 1);
    }
  };

  const handleStartGame = () => {
    engine.initGame(selectedMode);
    engine.selectArchetype(selectedArch.id, selectedMode);
  };

  const handleAbandonSavedRun = () => {
    engine.abandonRun();
    setTick((t) => t + 1);
  };

  const getArchetypeIcon = (id: ArchetypeId) => {
    switch (id) {
      case 'VOLT_OVERCHARGE':
        return <Zap className="w-5 h-5 text-cyan-400" />;
      case 'PYRO_DETONATOR':
        return <Flame className="w-5 h-5 text-orange-400" />;
      case 'SWARM_MATRIX':
        return <Activity className="w-5 h-5 text-purple-400" />;
      case 'KINETIC_TITAN':
        return <Shield className="w-5 h-5 text-yellow-400" />;
      case 'CRYSTAL_SINGULARITY':
        return <Snowflake className="w-5 h-5 text-sky-400" />;
      case 'QUANTUM_SINGULARITY':
        return <Compass className="w-5 h-5 text-rose-400" />;
      case 'CHRONO_PULSE':
        return <Clock className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#04060a]/95 backdrop-blur-lg overflow-hidden">
      <div className="w-full max-w-2xl bg-[#090d16] border-2 border-[#00e5ff] rounded-3xl shadow-[0_0_60px_rgba(0,229,255,0.25)] text-left relative flex flex-col max-h-[94dvh] overflow-hidden">
        {/* Fixed Header Bar */}
        <div className="flex-shrink-0 bg-[#090d16] border-b border-[#1e2e48] p-3 sm:p-4 flex items-center justify-between gap-2 z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase">
              <Sparkles className="w-3 h-3" /> Roguelike Cube Breaker
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wider text-white uppercase font-sans leading-tight mt-0.5">
              Cubo<span className="text-cyan-400">Clast</span>
            </h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={onOpenInstall}
              title="Scarica APK Android"
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 border border-emerald-400 text-emerald-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition active:scale-95 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">APK</span>
            </button>
            <button
              onClick={onOpenCodex}
              title="Codex Poteri"
              className="px-2.5 py-1.5 rounded-xl bg-[#141d2d] hover:bg-[#1e2e48] border border-purple-500/50 text-purple-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition active:scale-95 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Codex</span>
            </button>
            <button
              onClick={onOpenShop}
              title="Archivio Upgrade"
              className="px-2.5 py-1.5 rounded-xl bg-[#141d2d] hover:bg-[#1e2e48] border border-cyan-500/50 text-cyan-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
              <span>◆ {progData.quantumShards}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto touch-scroll overscroll-contain p-3.5 sm:p-5 flex flex-col gap-3.5">
          {/* Active Run Banner (If exists) */}
          {progData.savedRun.hasActiveRun && (
            <div className="bg-gradient-to-r from-emerald-950/80 via-[#141d2d] to-cyan-950/80 border-2 border-emerald-400 rounded-2xl p-3 sm:p-4 shadow-lg shadow-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-1">
                  Partita Salvata in Corso
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  {progData.savedRun.gameMode === 'STORY' ? 'Campagna Storia' : 'Modalità Arcade'} · Settore {progData.savedRun.savedLevel}
                </h3>
                <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                  Punti: {progData.savedRun.savedScore.toLocaleString()} | Sfere: {progData.savedRun.savedBalls} | Archetipo:{' '}
                  {progData.savedRun.savedArchetype
                    ? ARCHETYPES_DATA[progData.savedRun.savedArchetype as ArchetypeId]?.title
                    : 'Volt'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => engine.resumeSavedRun()}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs tracking-wider uppercase transition shadow-md shadow-emerald-500/30 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Riprendi
                </button>
                <button
                  onClick={handleAbandonSavedRun}
                  title="Elimina partita salvata e inizia nuova"
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 text-xs font-bold transition flex items-center gap-1 active:scale-95 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Nuova</span>
                </button>
              </div>
            </div>
          )}

          {/* Game Mode Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sword className="w-3.5 h-3.5 text-cyan-400" /> Scegli Modalità:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {/* Story Mode */}
              <button
                onClick={() => setSelectedMode('STORY')}
                className={`p-3 rounded-2xl border-2 text-left flex flex-col gap-1 transition cursor-pointer active:scale-98 ${
                  selectedMode === 'STORY'
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-[#0f172a] border-[#1e2e48] opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black text-white uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" /> Storia
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    25 Settori
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  5 Capitoli, 5 Boss tematici e boss finale cosmico.
                </p>
                <div className="text-[10px] font-mono text-cyan-400 mt-0.5">
                  {storyProgress.storyCompleted
                    ? '★ Completata!'
                    : `Capitolo ${storyProgress.highestChapterUnlocked}/5`}
                </div>
              </button>

              {/* Arcade Mode */}
              <button
                onClick={() => setSelectedMode('ARCADE')}
                className={`p-3 rounded-2xl border-2 text-left flex flex-col gap-1 transition cursor-pointer active:scale-98 ${
                  selectedMode === 'ARCADE'
                    ? 'bg-pink-950/40 border-pink-500 shadow-md shadow-pink-500/20'
                    : 'bg-[#0f172a] border-[#1e2e48] opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black text-white uppercase flex items-center gap-1">
                    <Target className="w-3 h-3 text-pink-400" /> Arcade
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 border border-pink-500/40">
                    10 Settori
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  10 Settori rapidi con boss finale Omega Tesseract.
                </p>
                <div className="text-[10px] font-mono text-pink-400 mt-0.5">
                  Sessione Rapida · Endless post-vittoria
                </div>
              </button>
            </div>
          </div>

          {/* Archetypes Selector Grid */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
              Scegli il Nucleo di Potere (7 Archetipi Roguelike):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {archetypes.map((arch) => {
                const unlocked = engine.progression.isArchetypeUnlocked(arch.id);
                const isSelected = arch.id === selectedId;
                return (
                  <button
                    key={arch.id}
                    onClick={() => setSelectedId(arch.id)}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-150 cursor-pointer active:scale-98 ${
                      isSelected
                        ? 'bg-[#141d2d] border-2 shadow-md'
                        : 'bg-[#0f172a] hover:bg-[#141d2d]/80 border-[#1e2e48]'
                    }`}
                    style={{
                      borderColor: isSelected ? arch.color : undefined,
                      boxShadow: isSelected ? `0 0 15px ${arch.color}35` : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      {getArchetypeIcon(arch.id)}
                      {unlocked ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-white truncate">{arch.title}</span>
                    <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                      {unlocked ? 'Sbloccato' : 'Bloccato'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Selected Archetype Card */}
          <div
            className="rounded-2xl p-3.5 sm:p-4 border-2 bg-[#0c1322] flex flex-col gap-3 shadow-lg relative overflow-hidden"
            style={{ borderColor: selectedArch.color }}
          >
            {/* Title & Element Badge */}
            <div className="flex items-center justify-between gap-2 border-b border-[#1e2e48] pb-2">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-md flex-shrink-0"
                  style={{
                    backgroundColor: `${selectedArch.color}20`,
                    borderColor: selectedArch.color,
                  }}
                >
                  {getArchetypeIcon(selectedArch.id)}
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white">{selectedArch.title}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="text-[9px] font-black uppercase tracking-wider px-2 py-0.2 rounded-full border"
                      style={{
                        backgroundColor: `${fam.color}15`,
                        borderColor: `${fam.color}50`,
                        color: fam.color,
                      }}
                    >
                      {fam.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Passiva: <strong className="text-white">{selectedArch.passiveName}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div>
                {isUnlocked ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3" /> Sbloccato
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider">
                    <Lock className="w-3 h-3" /> Da Sbloccare
                  </span>
                )}
              </div>
            </div>

            {/* Core Passive Ability */}
            <div className="bg-[#141d2d]/90 rounded-xl p-2.5 sm:p-3 border border-[#1e2e48]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-0.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Abilità Passiva Permanente:
              </span>
              <p className="text-xs text-slate-100 font-sans leading-relaxed mt-0.5 font-medium">
                {selectedArch.description}
              </p>
            </div>

            {/* Equipped Starting Relic */}
            <div className="bg-[#141d2d]/90 rounded-xl p-2.5 sm:p-3 border border-[#1e2e48] flex flex-col gap-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Reliquia Iniziale Equipaggiata:
              </span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-xs font-bold text-white">{initialRelic?.title}</span>
                <span className="text-[9px] font-mono px-2 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30 uppercase">
                  {initialRelic?.family}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-tight">
                {initialRelic?.description}
              </p>
            </div>

            {/* Unlock Condition text */}
            {!isUnlocked && (
              <div className="text-[11px] text-slate-400 border-t border-[#1e2e48] pt-1.5 flex items-center justify-between">
                <span>Condizione di sblocco:</span>
                <strong className="text-amber-300">{selectedArch.unlockCondition}</strong>
              </div>
            )}
          </div>

          {/* Global Stats Footer */}
          <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800">
            <div>
              Run: <strong className="text-white">{progData.runsPlayed}</strong> | Record:{' '}
              <strong className="text-cyan-400">{progData.highestScore.toLocaleString()}</strong>
            </div>
            <div>
              Miglior Settore: <strong className="text-emerald-400">{progData.bestSector}</strong>
            </div>
          </div>
        </div>

        {/* PINNED STICKY BOTTOM ACTION BAR (Always visible above the user's thumb!) */}
        <div className="flex-shrink-0 bg-[#090d16]/98 backdrop-blur-md border-t border-cyan-500/40 p-3 sm:p-4 shadow-[0_-12px_30px_rgba(0,0,0,0.8)] flex items-center justify-between gap-3 z-30">
          <div className="hidden sm:flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: selectedArch.color }}
            />
            <span className="text-xs text-slate-300 font-mono">
              {selectedMode === 'STORY' ? 'Campagna Storia' : 'Modalità Arcade'} con{' '}
              <strong className="text-white">{selectedArch.title}</strong>
            </span>
          </div>

          <div className="w-full sm:w-auto flex-1 sm:flex-none">
            {isUnlocked ? (
              <button
                onClick={handleStartGame}
                className="w-full sm:w-auto px-7 py-3.5 sm:py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-300 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider transition shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer ring-2 ring-cyan-400/50"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>INIZIA {selectedMode === 'STORY' ? 'CAMPAGNA' : 'ARCADE'}</span>
              </button>
            ) : (
              selectedArch.unlockCost && (
                <button
                  onClick={() => handleUnlockWithShards(selectedArch.id)}
                  disabled={progData.quantumShards < selectedArch.unlockCost}
                  className={`w-full sm:w-auto px-6 py-3.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition flex items-center justify-center gap-2 ${
                    progData.quantumShards >= selectedArch.unlockCost
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/30 cursor-pointer active:scale-95 ring-2 ring-amber-400/50'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>Sblocca con ◆ {selectedArch.unlockCost} Schegge</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
