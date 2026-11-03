import React, { useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { ARCHETYPES_DATA, ArchetypeId, RELIC_FAMILIES, RELICS_DATA } from '../types/game';
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
  const [, setTick] = useState(0);

  const selectedArch = ARCHETYPES_DATA[selectedId];
  const isUnlocked = engine.progression.isArchetypeUnlocked(selectedId);
  const fam = RELIC_FAMILIES[selectedArch.family];
  const initialRelic = RELICS_DATA[selectedArch.initialRelic];

  const handleUnlockWithShards = (id: ArchetypeId) => {
    if (engine.progression.unlockArchetypeWithShards(id)) {
      setTick((t) => t + 1);
    }
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
    <div className="absolute inset-0 bg-[#04060a]/95 backdrop-blur-lg flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#090d16] border-2 border-[#00e5ff] rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(0,229,255,0.25)] text-left relative flex flex-col gap-4 max-h-[96vh] overflow-y-auto">
        {/* Header Branding */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2e48] pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 text-[11px] font-bold tracking-widest uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Roguelike Peggle & Cube Breaker
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-white uppercase font-sans">
              Cubo<span className="text-cyan-400">Clast</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenInstall}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 border border-emerald-400 text-emerald-300 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm shadow-emerald-500/20"
            >
              <span>📱 Scarica APK / App</span>
            </button>
            <button
              onClick={onOpenCodex}
              className="px-3.5 py-2 rounded-xl bg-[#141d2d] hover:bg-[#1e2e48] border border-purple-500/50 text-purple-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Codex</span>
            </button>
            <button
              onClick={onOpenShop}
              className="px-3.5 py-2 rounded-xl bg-[#141d2d] hover:bg-[#1e2e48] border border-cyan-500/50 text-cyan-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-cyan-400" />
              <span>◆ {progData.quantumShards}</span>
            </button>
          </div>
        </div>

        {/* Resume Saved Run Banner */}
        {progData.savedRun.hasActiveRun && (
          <div className="bg-gradient-to-r from-emerald-950/80 via-[#141d2d] to-cyan-950/80 border-2 border-emerald-400 rounded-2xl p-4 shadow-lg shadow-emerald-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-1">
                  Partita Salvata in Corso
                </span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Settore {progData.savedRun.savedLevel} · {progData.savedRun.savedScore.toLocaleString()} Punti
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 font-mono">
                  Sfere Rimaste: {progData.savedRun.savedBalls} | Archetipo:{' '}
                  {progData.savedRun.savedArchetype
                    ? ARCHETYPES_DATA[progData.savedRun.savedArchetype as ArchetypeId]?.title
                    : 'Volt'}
                </p>
              </div>
              <button
                onClick={() => engine.resumeSavedRun()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs tracking-wider uppercase transition shadow-md shadow-emerald-500/30 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                Riprendi Partita
              </button>
            </div>
          </div>
        )}

        {/* Archetype Selector Tabs / Grid */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
            Scegli il tuo Nucleo di Potere (7 Archetipi Roguelike):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {archetypes.map((arch) => {
              const unlocked = engine.progression.isArchetypeUnlocked(arch.id);
              const isSelected = arch.id === selectedId;
              return (
                <button
                  key={arch.id}
                  onClick={() => setSelectedId(arch.id)}
                  className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-150 cursor-pointer ${
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

        {/* Detailed High-Readability Card for Selected Archetype */}
        <div
          className="rounded-2xl p-4 sm:p-5 border-2 bg-[#0c1322] flex flex-col gap-3.5 shadow-lg relative overflow-hidden"
          style={{ borderColor: selectedArch.color }}
        >
          {/* Top Title & Element Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e2e48] pb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-md"
                style={{
                  backgroundColor: `${selectedArch.color}20`,
                  borderColor: selectedArch.color,
                }}
              >
                {getArchetypeIcon(selectedArch.id)}
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">{selectedArch.title}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: `${fam.color}15`,
                      borderColor: `${fam.color}50`,
                      color: fam.color,
                    }}
                  >
                    Famiglia: {fam.label}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Passiva: <strong className="text-white">{selectedArch.passiveName}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Unlock Status Badge */}
            <div>
              {isUnlocked ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" /> Pronto alla Partenza
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider">
                  <Lock className="w-4 h-4" /> Da Sbloccare
                </span>
              )}
            </div>
          </div>

          {/* Section 1: Core Passive Ability (Leggibilità Massima e Completa) */}
          <div className="bg-[#141d2d]/90 rounded-xl p-3.5 border border-[#1e2e48]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Abilità Passiva Permanente della Run:
            </span>
            <p className="text-sm text-slate-100 font-sans leading-relaxed mt-1 font-medium">
              {selectedArch.description}
            </p>
          </div>

          {/* Section 2: Equipped Starting Relic */}
          <div className="bg-[#141d2d]/90 rounded-xl p-3.5 border border-[#1e2e48] flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> Reliquia Iniziale Equipaggiata:
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-bold text-white">{initialRelic?.title}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30 uppercase">
                {initialRelic?.family}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              {initialRelic?.description}
            </p>
          </div>

          {/* Section 3: Unlock Conditions or Play Action */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#1e2e48]">
            <div className="text-xs text-slate-400">
              <span className="text-slate-500">Condizione di Sblocco Roguelike:</span>
              <div className="font-semibold text-amber-300 mt-0.5">
                {selectedArch.unlockCondition}
              </div>
            </div>

            {isUnlocked ? (
              <button
                onClick={() => engine.selectArchetype(selectedArch.id)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-sm uppercase tracking-wider transition shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                Avvia Run con {selectedArch.title}
              </button>
            ) : (
              selectedArch.unlockCost && (
                <button
                  onClick={() => handleUnlockWithShards(selectedArch.id)}
                  disabled={progData.quantumShards < selectedArch.unlockCost}
                  className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 ${
                    progData.quantumShards >= selectedArch.unlockCost
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/30 cursor-pointer active:scale-95'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  Sblocca con ◆ {selectedArch.unlockCost} Schegge
                </button>
              )
            )}
          </div>
        </div>

        {/* Global Footer Stats */}
        <div className="pt-1 flex items-center justify-between text-xs font-mono text-slate-400">
          <div>
            Run Giocate: <strong className="text-white">{progData.runsPlayed}</strong> | Record:{' '}
            <strong className="text-cyan-400">{progData.highestScore.toLocaleString()}</strong>
          </div>
          <div>
            Miglior Settore: <strong className="text-emerald-400">{progData.bestSector}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
