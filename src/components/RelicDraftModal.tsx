import React from 'react';
import { GameEngine } from '../game/GameEngine';
import { RELICS_DATA, RELIC_FAMILIES, RelicId } from '../types/game';
import { RefreshCw, Sparkles, Award } from 'lucide-react';

interface RelicDraftModalProps {
  engine: GameEngine;
}

export const RelicDraftModal: React.FC<RelicDraftModalProps> = ({ engine }) => {
  const choices = engine.draftChoices;
  const resonances = engine.getActiveResonances();

  return (
    <div className="absolute inset-0 bg-[#04060a]/92 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="w-full max-w-lg my-auto bg-[#090d16] border-2 border-[#00e5ff] rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(0,229,255,0.2)] text-center relative flex flex-col gap-4">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Settore {engine.currentLevel} Purificato
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-wider text-white uppercase">
            Draft <span className="text-cyan-400">Reliquia</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Scegli una tecnologia o un manufatto quantico per potenziare la tua run
          </p>
        </div>

        {/* Relic Choice Cards */}
        <div className="flex flex-col gap-3">
          {choices.map((relicId) => {
            const relic = RELICS_DATA[relicId];
            if (!relic) return null;
            const fam = RELIC_FAMILIES[relic.family];
            const currentFamCount = resonances[relic.family] || 0;
            const willTriggerSynergy = currentFamCount === 1; // will become 2
            const willTriggerMastery = currentFamCount >= 2; // will become 3+

            return (
              <button
                key={relic.id}
                onClick={() => engine.selectRelic(relic.id)}
                className="group w-full text-left p-4 rounded-2xl bg-[#0f172a] hover:bg-[#141d2d] border-2 transition-all duration-200 relative overflow-hidden active:scale-[0.99] flex flex-col gap-2 shadow-md cursor-pointer"
                style={{
                  borderColor: `${fam.color}50`,
                }}
              >
                {/* Title & Element Badge */}
                <div className="flex items-center justify-between">
                  <span className="font-black text-base text-white group-hover:text-cyan-300 transition">
                    {relic.title}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {(willTriggerSynergy || willTriggerMastery) && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/50 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {willTriggerMastery ? 'MAESTRIA' : 'SINERGIA'}
                      </span>
                    )}
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
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {relic.description}
                </p>

                {/* Synergy counter hint */}
                <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
                  <span>
                    Famiglia {fam.label}:{' '}
                    <strong style={{ color: fam.color }}>
                      {currentFamCount} possedute → {currentFamCount + 1}
                    </strong>
                  </span>
                  <span className="text-cyan-400 group-hover:underline">Seleziona →</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Reroll Button */}
        <div className="pt-2 border-t border-[#1e2e48] flex items-center justify-center">
          <button
            onClick={() => engine.rerollDraft()}
            disabled={engine.rerollsAvailable <= 0}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition active:scale-95 ${
              engine.rerollsAvailable > 0
                ? 'bg-[#141d2d] hover:bg-[#1e2e48] border border-cyan-500 text-cyan-300 shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reroll ({engine.rerollsAvailable} disponibili)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
