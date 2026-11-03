import React, { useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import {
  ARCHETYPES_DATA,
  RELICS_DATA,
  FUSION_COMBOS,
  RELIC_FAMILIES,
  ArchetypeId,
  FusionComboId,
  RelicId,
} from '../types/game';
import {
  BookOpen,
  X,
  Sparkles,
  Zap,
  Lock,
  CheckCircle2,
  Trophy,
  Layers,
  Flame,
  Shield,
  Activity,
  Award,
} from 'lucide-react';

interface CodexModalProps {
  engine: GameEngine;
  onClose: () => void;
}

type TabType = 'ARCHETYPES' | 'FUSIONS' | 'RELICS' | 'BOSSES';

export const CodexModal: React.FC<CodexModalProps> = ({ engine, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('FUSIONS');
  const progData = engine.progression.getData();

  const archetypes = Object.values(ARCHETYPES_DATA);
  const fusions = Object.values(FUSION_COMBOS);
  const secretRelics = (Object.values(RELICS_DATA) as (typeof RELICS_DATA[RelicId])[]).filter(
    (r) => r.isSecret
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#04060a]/95 backdrop-blur-lg overflow-hidden">
      <div className="w-full max-w-2xl bg-[#090d16] border-2 border-purple-500 rounded-3xl p-4 sm:p-6 shadow-[0_0_60px_rgba(168,85,247,0.25)] text-left relative flex flex-col gap-3 sm:gap-4 max-h-[92dvh] overflow-y-auto touch-scroll overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1e2e48] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
                Codex <span className="text-purple-400">Poteri & Combo</span>
              </h2>
              <p className="text-xs text-slate-400">
                Progressione Roguelike · Poteri e sinergie sbloccabili
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#141d2d] hover:bg-[#1e2e48] text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#0f172a] p-1.5 rounded-2xl border border-[#1e2e48]">
          <button
            onClick={() => setActiveTab('FUSIONS')}
            className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'FUSIONS'
                ? 'bg-purple-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Combo Fusione</span>
          </button>

          <button
            onClick={() => setActiveTab('ARCHETYPES')}
            className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'ARCHETYPES'
                ? 'bg-cyan-400 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>7 Archetipi</span>
          </button>

          <button
            onClick={() => setActiveTab('RELICS')}
            className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'RELICS'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Reliquie Segrete</span>
          </button>

          <button
            onClick={() => setActiveTab('BOSSES')}
            className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'BOSSES'
                ? 'bg-pink-500 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Boss & Trofei</span>
          </button>
        </div>

        {/* Tab 1: Dual-Element Fusion Combos */}
        {activeTab === 'FUSIONS' && (
          <div className="flex flex-col gap-3">
            <div className="p-3 bg-[#141d2d]/60 rounded-xl border border-purple-500/30 text-xs text-slate-300">
              <strong className="text-purple-300">Come attivare le Combo Fusione:</strong> Raccogli 2+
              reliquie di una famiglia e 2+ reliquie di una seconda famiglia durante la run per
              scatenare una risonanza ibrida devastante!
            </div>

            <div className="flex flex-col gap-2.5 max-h-[460px] overflow-y-auto pr-1">
              {fusions.map((fusion) => {
                const unlocked = progData.unlockedFusionCombos.includes(fusion.id);
                const famA = RELIC_FAMILIES[fusion.familyA];
                const famB = RELIC_FAMILIES[fusion.familyB];

                return (
                  <div
                    key={fusion.id}
                    className={`p-4 rounded-2xl border-2 flex flex-col gap-2 transition ${
                      unlocked ? 'bg-[#0c1322]' : 'bg-[#0a0e17]/80 opacity-80'
                    }`}
                    style={{ borderColor: unlocked ? fusion.color : '#1e2e48' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: fusion.color }}
                        />
                        <h4 className="text-sm font-bold text-white">{fusion.title}</h4>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase"
                          style={{
                            backgroundColor: `${famA.color}15`,
                            borderColor: famA.color,
                            color: famA.color,
                          }}
                        >
                          {famA.label} 2x
                        </span>
                        <span className="text-slate-500 text-xs">+</span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase"
                          style={{
                            backgroundColor: `${famB.color}15`,
                            borderColor: famB.color,
                            color: famB.color,
                          }}
                        >
                          {famB.label} 2x
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      {fusion.description}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-[#1e2e48] text-[11px] font-mono">
                      <span className="text-slate-400">
                        Condizione:{' '}
                        <strong className={unlocked ? 'text-emerald-400' : 'text-amber-400'}>
                          {fusion.unlockCondition}
                        </strong>
                      </span>
                      {unlocked ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Sbloccata
                        </span>
                      ) : (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" /> Da Sbloccare
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: All 7 Archetypes */}
        {activeTab === 'ARCHETYPES' && (
          <div className="flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-1">
            {archetypes.map((arch) => {
              const unlocked = progData.unlockedArchetypes.includes(arch.id);
              const fam = RELIC_FAMILIES[arch.family];
              const rel = RELICS_DATA[arch.initialRelic];

              return (
                <div
                  key={arch.id}
                  className={`p-4 rounded-2xl border-2 flex flex-col gap-2.5 transition ${
                    unlocked ? 'bg-[#0c1322]' : 'bg-[#0a0e17]/80'
                  }`}
                  style={{ borderColor: unlocked ? arch.color : '#1e2e48' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: arch.color }}
                      />
                      <h4 className="text-sm font-bold text-white">{arch.title}</h4>
                      <span className="text-[11px] font-mono text-cyan-400">
                        ({arch.passiveName})
                      </span>
                    </div>
                    {unlocked ? (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        SBLOCCATO
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> BLOCCATO
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed">{arch.description}</p>

                  <div className="bg-[#141d2d] rounded-xl p-2.5 text-xs text-slate-300 flex items-center justify-between">
                    <span>
                      Reliquia Iniziale: <strong className="text-white">{rel?.title}</strong>
                    </span>
                    <span className="text-[10px] font-mono text-purple-300">{rel?.family}</span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-[#1e2e48]">
                    Sblocco: <strong className="text-amber-300">{arch.unlockCondition}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Secret Relics */}
        {activeTab === 'RELICS' && (
          <div className="flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-1">
            <div className="p-3 bg-[#141d2d]/60 rounded-xl border border-amber-500/30 text-xs text-slate-300">
              <strong className="text-amber-300">Reliquie Rare & Segrete:</strong> Si aggiungono
              permanentemente al pool di draft di tutte le future run una volta sbloccate!
            </div>

            {secretRelics.map((relic) => {
              const unlocked = progData.unlockedRelics.includes(relic.id);
              const fam = RELIC_FAMILIES[relic.family];

              return (
                <div
                  key={relic.id}
                  className={`p-3.5 rounded-2xl border flex flex-col gap-1.5 ${
                    unlocked ? 'bg-[#0f172a] border-[#1e2e48]' : 'bg-[#0a0e17]/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: fam.color }}
                      />
                      {relic.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase"
                        style={{
                          backgroundColor: `${fam.color}15`,
                          borderColor: fam.color,
                          color: fam.color,
                        }}
                      >
                        {fam.label}
                      </span>
                      {unlocked ? (
                        <span className="text-[10px] font-bold text-emerald-400">Nel Pool</span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400">Bloccata</span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{relic.description}</p>

                  <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                    Sblocco: <strong className="text-amber-300">{relic.unlockCondition}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 4: Boss Trophies */}
        {activeTab === 'BOSSES' && (
          <div className="flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-1">
            {/* Sector 5 Boss */}
            <div className="p-4 rounded-2xl bg-[#0f172a] border-2 border-pink-500/40 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-pink-500/20 text-pink-400 border border-pink-500/30">
                    Settore 5 Boss
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">The Monolith Core</h4>
                </div>
                {progData.bossesDefeated.monolithSector5 ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Sconfitto
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold flex items-center gap-1">
                    <Lock className="w-4 h-4" /> Non ancora battuto
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                6 satelliti rotanti ad alta velocità, impulsi repulsivi e discesa enrage sul fondo.
              </p>
              <div className="text-xs font-mono text-cyan-300 pt-1 border-t border-slate-800">
                Ricompensa Sblocco: <strong>Archetipo Crystal Singularity</strong>, <strong>Vortice Polare</strong> & <strong>Combo Sovraccarico Plasma</strong>!
              </div>
            </div>

            {/* Sector 10 Boss */}
            <div className="p-4 rounded-2xl bg-[#0f172a] border-2 border-pink-500/40 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-pink-500/20 text-pink-400 border border-pink-500/30">
                    Settore 10 Boss Finale
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">The Omega Tesseract</h4>
                </div>
                {progData.bossesDefeated.tesseractSector10 ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Sconfitto
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold flex items-center gap-1">
                    <Lock className="w-4 h-4" /> Non ancora battuto
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                8 satelliti orbitanti a deflessione rapida, onde EMP repulsione ogni 4s e discesa enrage rapida.
              </p>
              <div className="text-xs font-mono text-cyan-300 pt-1 border-t border-slate-800">
                Ricompensa Sblocco: <strong>Archetipo Quantum Singularity</strong>, <strong>Distorsione Crono</strong> & <strong>Superconduzione Criogenica</strong>!
              </div>
            </div>

            {/* Sector 15 Boss */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0f172a] border-2 border-amber-500/40 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Capitolo III · Settore 15 Boss
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">Void Leviathan</h4>
                </div>
                {progData.bossesDefeated.leviathanSector15 ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Sconfitto
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold flex items-center gap-1">
                    <Lock className="w-4 h-4" /> Non ancora battuto
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                260 HP, 10 satelliti a rotazione cinetica rapida, onde d'urto doppie e griglie corazzate.
              </p>
              <div className="text-xs font-mono text-cyan-300 pt-1 border-t border-slate-800">
                Sblocca l'accesso al <strong>Capitolo IV: Singolarità Oscura</strong>!
              </div>
            </div>

            {/* Sector 20 Boss */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0f172a] border-2 border-emerald-500/40 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Capitolo IV · Settore 20 Boss
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">Chrono Weaver</h4>
                </div>
                {progData.bossesDefeated.chronoWeaverSector20 ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Sconfitto
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold flex items-center gap-1">
                    <Lock className="w-4 h-4" /> Non ancora battuto
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                380 HP, 10 satelliti multistrato, distorsione temporale criogenica e barriere repulse.
              </p>
              <div className="text-xs font-mono text-cyan-300 pt-1 border-t border-slate-800">
                Sblocca l'accesso al <strong>Capitolo Finale V: Orizzonte Primordiale</strong>!
              </div>
            </div>

            {/* Sector 25 Final Boss */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0f172a] border-2 border-rose-500/40 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                    Capitolo V · Settore 25 Boss Finale
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">Primordial Architect</h4>
                </div>
                {progData.bossesDefeated.primordialArchitectSector25 ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Campione Galattico
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold flex items-center gap-1">
                    <Lock className="w-4 h-4" /> Trono Inviolato
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                520 HP, 12 satelliti orbitanti in doppio anello concavo, 4 fasi cataclismatiche con discesa enrage sul cannone.
              </p>
              <div className="text-xs font-mono text-amber-300 pt-1 border-t border-slate-800">
                Ricompensa: <strong>+500 Schegge Quantiche</strong> & <strong>Accesso all'Abisso Infinito Endless</strong>!
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-[#1e2e48] flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Progresso Sblocchi: {progData.unlockedArchetypes.length}/7 Archetipi ·{' '}
            {progData.unlockedFusionCombos.length}/5 Combo Fusione
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
