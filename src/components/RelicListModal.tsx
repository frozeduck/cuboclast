import React from 'react';
import { GameEngine } from '../game/GameEngine';
import { RELIC_FAMILIES, RELICS_DATA, RelicFamilyId } from '../types/game';
import { X, Layers, Sparkles, CheckCircle } from 'lucide-react';

interface RelicListModalProps {
  engine: GameEngine;
  onClose: () => void;
}

export const RelicListModal: React.FC<RelicListModalProps> = ({ engine, onClose }) => {
  const activeRelics = engine.activeRelics;
  const resonances = engine.getActiveResonances();

  return (
    <div className="absolute inset-0 bg-[#04060a]/92 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="w-full max-w-lg my-auto bg-[#090d16] border-2 border-purple-500 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(168,85,247,0.25)] text-left relative flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1e2e48] pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <h3 className="text-xl font-black text-white uppercase tracking-wider">
              Reliquie Attive ({activeRelics.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#141d2d] hover:bg-[#1e2e48] text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resonance Status Summary */}
        <div className="bg-[#0f172a] border border-[#1e2e48] rounded-2xl p-3.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Risonanze Elementali (Combo di Famiglia)
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(resonances) as RelicFamilyId[]).map((fam) => {
              const count = resonances[fam];
              const tier = engine.getResonanceTier(fam);
              const info = RELIC_FAMILIES[fam];
              return (
                <div
                  key={fam}
                  className="p-2.5 rounded-xl border flex flex-col justify-between"
                  style={{
                    backgroundColor: `${info.color}10`,
                    borderColor: tier > 0 ? info.color : `${info.color}30`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase" style={{ color: info.color }}>
                      {info.label}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-white">
                      {count} possedute
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">
                    {tier === 2
                      ? '★ Tier 2: Maestria Attiva'
                      : tier === 1
                      ? '★ Tier 1: Sinergia Attiva'
                      : 'Serve 2x per Sinergia'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Owned Relics List */}
        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
          {activeRelics.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              Nessuna reliquia ancora equipaggiata.
            </p>
          ) : (
            activeRelics.map((rId, idx) => {
              const r = RELICS_DATA[rId];
              if (!r) return null;
              const fam = RELIC_FAMILIES[r.family];
              return (
                <div
                  key={`${rId}-${idx}`}
                  className="p-3 rounded-2xl bg-[#0f172a] border border-[#1e2e48] flex flex-col gap-1 text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: fam.color }}
                      />
                      {r.title}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase"
                      style={{
                        backgroundColor: `${fam.color}15`,
                        borderColor: `${fam.color}40`,
                        color: fam.color,
                      }}
                    >
                      {fam.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{r.description}</p>
                </div>
              );
            })
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#141d2d] hover:bg-[#1e2e48] border border-slate-700 text-white font-bold text-xs uppercase tracking-wider transition"
        >
          Chiudi
        </button>
      </div>
    </div>
  );
};
