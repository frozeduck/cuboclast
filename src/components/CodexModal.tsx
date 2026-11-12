import React, { useState, useRef } from 'react';
import { GameEngine } from '../game/GameEngine';
import {
  ARCHETYPES_DATA,
  RELICS_DATA,
  RELIC_RARITIES,
  FUSION_COMBOS,
  RELIC_FAMILIES,
  RelicId,
} from '../types/game';

interface CodexModalProps {
  engine: GameEngine;
  onClose: () => void;
}

type TabType = 'ARCHETYPES' | 'FUSIONS' | 'RELICS' | 'BOSSES';

export const CodexModal: React.FC<CodexModalProps> = ({ engine, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('FUSIONS');
  const scrollRef = useRef<HTMLDivElement>(null);
  const progData = engine.progression.getData();

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };

  const archetypes = Object.values(ARCHETYPES_DATA);
  const fusions = Object.values(FUSION_COMBOS);
  const allRelics = Object.values(RELICS_DATA) as (typeof RELICS_DATA)[RelicId][];

  return (
    <div
      role="dialog"
      aria-label="Codex Poteri e Combo"
      className="fixed inset-0 z-50 bg-[#08090c]/96 flex items-center justify-center sm:p-4"
    >
      <div className="w-full h-full sm:h-auto sm:max-h-[92dvh] max-w-lg bg-[#0c0e13] sm:border border-[#272b36] sm:rounded-2xl flex flex-col overflow-hidden">
        {/* Fixed Header (shrink-0) */}
        <div className="shrink-0 bg-[#0c0e13] border-b border-[#222630] px-4 py-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100 uppercase tracking-wider leading-none">
              CODEX ENCICLOPEDICO
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Archetipi · Combo Fusione · Reliquie · Boss
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi Codex"
            className="min-h-[40px] min-w-[40px] px-3 rounded-lg bg-[#14171f] border border-[#2d323e] text-zinc-200 font-bold text-xs uppercase cursor-pointer active:scale-95"
          >
            ✕ CHIUDI
          </button>
        </div>

        {/* Fixed Tab Selector (shrink-0) */}
        <div className="shrink-0 bg-[#101218] border-b border-[#222630] px-3 py-2 grid grid-cols-4 gap-1.5">
          <button
            type="button"
            onClick={() => handleTabChange('FUSIONS')}
            className={`min-h-[38px] px-2 rounded-lg text-xs font-bold uppercase tracking-wide transition cursor-pointer ${
              activeTab === 'FUSIONS'
                ? 'bg-zinc-200 text-zinc-950'
                : 'bg-[#14171f] text-zinc-400 border border-[#222630]'
            }`}
          >
            COMBO
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('ARCHETYPES')}
            className={`min-h-[38px] px-2 rounded-lg text-xs font-bold uppercase tracking-wide transition cursor-pointer ${
              activeTab === 'ARCHETYPES'
                ? 'bg-zinc-200 text-zinc-950'
                : 'bg-[#14171f] text-zinc-400 border border-[#222630]'
            }`}
          >
            NUCLEI
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('RELICS')}
            className={`min-h-[38px] px-2 rounded-lg text-xs font-bold uppercase tracking-wide transition cursor-pointer ${
              activeTab === 'RELICS'
                ? 'bg-zinc-200 text-zinc-950'
                : 'bg-[#14171f] text-zinc-400 border border-[#222630]'
            }`}
          >
            RELIQUIE
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('BOSSES')}
            className={`min-h-[38px] px-2 rounded-lg text-xs font-bold uppercase tracking-wide transition cursor-pointer ${
              activeTab === 'BOSSES'
                ? 'bg-zinc-200 text-zinc-950'
                : 'bg-[#14171f] text-zinc-400 border border-[#222630]'
            }`}
          >
            BOSS
          </button>
        </div>

        {/* Single Scrollable Content Body */}
        <div
          ref={scrollRef}
          data-testid="codex-scroll-body"
          className="flex-1 min-h-0 modal-scroll p-4 space-y-2.5"
        >
          {activeTab === 'FUSIONS' &&
            fusions.map((fusion) => {
              const unlocked = progData.unlockedFusionCombos.includes(fusion.id);
              const famA = RELIC_FAMILIES[fusion.familyA];
              const famB = RELIC_FAMILIES[fusion.familyB];

              return (
                <div
                  key={fusion.id}
                  className="rounded-xl bg-[#13161e] border p-3.5 space-y-1.5"
                  style={{ borderColor: unlocked ? fusion.color : '#222630' }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-zinc-100">{fusion.title}</span>
                    <span
                      className="text-xs font-mono font-bold"
                      style={{ color: fusion.color }}
                    >
                      [{famA.label.toUpperCase()} 2x + {famB.label.toUpperCase()} 2x]
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {fusion.description}
                  </p>
                  <div className="pt-1 border-t border-[#222630] flex items-center justify-between text-[11px] font-mono">
                    <span className="text-zinc-400">{fusion.unlockCondition}</span>
                    <span className={unlocked ? 'text-[#7fa68e] font-bold' : 'text-[#d4b483]'}>
                      {unlocked ? 'SBLOCCATA' : 'BLOCCATA'}
                    </span>
                  </div>
                </div>
              );
            })}

          {activeTab === 'ARCHETYPES' &&
            archetypes.map((arch) => {
              const unlocked = progData.unlockedArchetypes.includes(arch.id);
              const fam = RELIC_FAMILIES[arch.family];
              const rel = arch.initialRelic ? RELICS_DATA[arch.initialRelic] : null;

              return (
                <div
                  key={arch.id}
                  className="rounded-xl bg-[#13161e] border p-3.5 space-y-1.5"
                  style={{ borderColor: unlocked ? arch.color : '#222630' }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: arch.color }}
                      />
                      <span className="text-sm font-bold text-zinc-100">{arch.title}</span>
                    </div>
                    <span className="text-xs font-mono font-bold" style={{ color: fam.color }}>
                      {arch.id === 'PROTO_CORE' ? '[NEUTRO · BASE]' : `[${fam.label.toUpperCase()}]`}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{arch.description}</p>
                  <div className="pt-1 border-t border-[#222630] flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>{rel ? `Reliquia: ${rel.title}` : '0 Reliquie Iniziali'}</span>
                    <span className={unlocked ? 'text-[#7fa68e] font-bold' : 'text-[#d4b483]'}>
                      {unlocked ? 'SBLOCCATO' : arch.unlockCondition}
                    </span>
                  </div>
                </div>
              );
            })}

          {activeTab === 'RELICS' &&
            allRelics.map((relic) => {
              const unlocked = progData.unlockedRelics.includes(relic.id);
              const fam = RELIC_FAMILIES[relic.family];
              const rar = RELIC_RARITIES[relic.rarity];

              return (
                <div
                  key={relic.id}
                  className="rounded-xl bg-[#13161e] border p-3 space-y-1"
                  style={{ borderColor: unlocked ? rar.color : '#222630' }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-zinc-100">{relic.title}</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase"
                        style={{ color: rar.color, borderColor: rar.color }}
                      >
                        {rar.label}
                      </span>
                      <span className="text-xs font-mono font-bold" style={{ color: fam.color }}>
                        [{fam.label.toUpperCase()}]
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{relic.description}</p>
                  <div className="pt-1 border-t border-[#222630] flex items-center justify-between text-[11px] font-mono">
                    <span className="text-zinc-400">
                      {relic.unlockCondition || 'Rarità Comune (Pool Iniziale)'}
                    </span>
                    <span className={unlocked ? 'text-[#7fa68e] font-bold' : 'text-[#d4b483]'}>
                      {unlocked ? 'NEL POOL' : 'BLOCCATA'}
                    </span>
                  </div>
                </div>
              );
            })}

          {activeTab === 'BOSSES' && (
            <>
              {[
                {
                  sector: 5,
                  name: 'The Monolith Core',
                  defeated: progData.bossesDefeated.monolithSector5,
                  desc: '120 HP, 6 satelliti rotanti, impulsi repulsivi e discesa enrage.',
                  reward: 'Rarità Non Comune + Nuclei Volt & Pyro',
                },
                {
                  sector: 10,
                  name: 'The Omega Tesseract',
                  defeated: progData.bossesDefeated.tesseractSector10,
                  desc: '240 HP, 8 satelliti orbitanti, onde EMP ogni 4s e discesa rapida.',
                  reward: 'Rarità Rara + Nuclei Kinetic & Swarm',
                },
                {
                  sector: 15,
                  name: 'Void Leviathan',
                  defeated: progData.bossesDefeated.leviathanSector15,
                  desc: '380 HP, 10 satelliti a rotazione rapida e griglie corazzate.',
                  reward: 'Rarità Epica + Nuclei Crystal & Chrono',
                },
                {
                  sector: 20,
                  name: 'Chrono Weaver',
                  defeated: progData.bossesDefeated.chronoWeaverSector20,
                  desc: '550 HP, distorsione temporale criogenica e barriere.',
                  reward: 'Rarità Leggendaria + Quantum Singularity',
                },
                {
                  sector: 25,
                  name: 'Primordial Architect',
                  defeated: progData.bossesDefeated.primordialArchitectSector25,
                  desc: '750 HP, 12 satelliti in doppio anello e 4 fasi cataclismatiche.',
                  reward: '+500 Schegge ◆ & Modalità Abisso Endless',
                },
              ].map((b) => (
                <div
                  key={b.sector}
                  className="rounded-xl bg-[#13161e] border border-[#2d323e] p-3.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-zinc-100">
                      SETTORE {b.sector} · {b.name}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        b.defeated ? 'text-[#7fa68e]' : 'text-zinc-500'
                      }`}
                    >
                      {b.defeated ? '[SCONFITTO]' : '[ATTIVO]'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{b.desc}</p>
                  <div className="pt-1 border-t border-[#222630] text-[11px] font-mono text-[#d4b483]">
                    Ricompensa: {b.reward}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Fixed Footer (shrink-0) */}
        <div className="shrink-0 bg-[#0c0e13] border-t border-[#222630] p-3 flex items-center justify-between gap-3">
          <span className="text-xs font-mono text-zinc-400 tabular-nums">
            Nuclei: {progData.unlockedArchetypes.length}/8 · Combo:{' '}
            {progData.unlockedFusionCombos.length}/5
          </span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[42px] px-6 rounded-xl bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-95"
          >
            TORNA AL MENU
          </button>
        </div>
      </div>
    </div>
  );
};
