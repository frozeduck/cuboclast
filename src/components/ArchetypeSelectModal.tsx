import React from 'react';
import { GameEngine } from '../game/GameEngine';
import { ARCHETYPES_DATA, ArchetypeId, RELIC_FAMILIES } from '../types/game';
import { Play, RotateCcw, ShoppingBag, Trophy, Zap, Shield, Sparkles } from 'lucide-react';

interface ArchetypeSelectModalProps {
  engine: GameEngine;
  onOpenShop: () => void;
}

export const ArchetypeSelectModal: React.FC<ArchetypeSelectModalProps> = ({
  engine,
  onOpenShop,
}) => {
  const progData = engine.progression.getData();
  const archetypes = Object.values(ARCHETYPES_DATA);

  return (
    <div className="absolute inset-0 bg-[#04060a]/92 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="w-full max-w-lg my-auto bg-[#090d16] border-2 border-[#00e5ff] rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(0,229,255,0.2)] text-center relative flex flex-col gap-4">
        {/* Header Branding */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Roguelike Peggle & Cube Breaker
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-white uppercase font-sans">
            Cubo<span className="text-cyan-400">Clast</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Seleziona l'Archetipo Core per iniziare la run galattica
          </p>
        </div>

        {/* Resume Saved Run Banner (if active run exists) */}
        {progData.savedRun.hasActiveRun && (
          <div className="bg-gradient-to-r from-emerald-950/80 via-[#141d2d] to-cyan-950/80 border-2 border-emerald-400 rounded-2xl p-4 text-left shadow-lg shadow-emerald-500/20">
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-1">
                  Partita Salvata in Corso
                </span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Settore {progData.savedRun.savedLevel} · {progData.savedRun.savedScore.toLocaleString()} Punti
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 font-mono">
                  Sfere: {progData.savedRun.savedBalls} | Archetipo:{' '}
                  {progData.savedRun.savedArchetype ? ARCHETYPES_DATA[progData.savedRun.savedArchetype as ArchetypeId]?.title : 'Volt'}
                </p>
              </div>
              <button
                onClick={() => engine.resumeSavedRun()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs tracking-wider uppercase transition shadow-md shadow-emerald-500/30 flex items-center gap-1.5 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                Riprendi
              </button>
            </div>
          </div>
        )}

        {/* Archetype Cards List */}
        <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
          {archetypes.map((arch) => {
            const fam = RELIC_FAMILIES[arch.family];
            return (
              <button
                key={arch.id}
                onClick={() => engine.selectArchetype(arch.id)}
                className="group w-full text-left p-3.5 rounded-2xl bg-[#0f172a] hover:bg-[#141d2d] border border-[#1e2e48] hover:border-cyan-400/80 transition-all duration-200 relative overflow-hidden active:scale-[0.99] flex flex-col gap-1.5 shadow-md"
              >
                {/* Top row: Title and Family badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: arch.color }}
                    />
                    <span className="font-bold text-sm text-white group-hover:text-cyan-300 transition">
                      {arch.title}
                    </span>
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: `${fam.color}15`,
                      borderColor: `${fam.color}40`,
                      color: fam.color,
                    }}
                  >
                    {fam.label}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed text-left">
                  {arch.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Footer Actions: Shop & Stats */}
        <div className="pt-2 border-t border-[#1e2e48] flex items-center justify-between gap-3">
          <div className="text-left text-xs font-mono text-slate-400">
            <div>
              Record: <span className="text-white font-bold">{progData.highestScore.toLocaleString()}</span>
            </div>
            <div>
              Miglior Settore: <span className="text-cyan-400 font-bold">{progData.bestSector}</span>
            </div>
          </div>

          <button
            onClick={onOpenShop}
            className="px-4 py-2.5 rounded-xl bg-[#141d2d] hover:bg-[#1e2e48] border border-cyan-500/50 text-cyan-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition active:scale-95 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4 text-cyan-400" />
            <span>Archivio ◆ {progData.quantumShards}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
