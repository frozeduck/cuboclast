import React, { useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { soundEngine } from '../audio/soundEngine';
import { getChapterForSector, RelicFamilyId } from '../types/game';
import {
  Volume2,
  VolumeX,
  FastForward,
  Info,
  Layers,
  BookOpen,
  Smartphone,
  ShieldAlert,
} from 'lucide-react';

interface HUDProps {
  engine: GameEngine;
  onOpenRelicList?: () => void;
  onOpenInfo?: () => void;
  onOpenCodex?: () => void;
  onOpenInstall?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  engine,
  onOpenRelicList,
  onOpenInfo,
  onOpenCodex,
  onOpenInstall,
}) => {
  const [soundActive, setSoundActive] = useState(soundEngine.isEnabled());
  const [speedActive, setSpeedActive] = useState(engine.speedBoost);

  const toggleSound = () => {
    const newState = soundEngine.toggleSound();
    setSoundActive(newState);
  };

  const toggleSpeed = () => {
    engine.speedBoost = !engine.speedBoost;
    setSpeedActive(engine.speedBoost);
  };

  const remainingCores = engine.getRemainingCoreCubes();
  const totalCores = engine.getTotalCoreCubes();
  const isBossSector = engine.currentLevel % 5 === 0;
  const chapter = getChapterForSector(engine.currentLevel);

  // Count active resonances and fusions for the small badge on Relics button
  const resonances = engine.getActiveResonances();
  const activeFusions = engine.getActiveFusionCombos();
  const activeResonanceTiers = (Object.keys(resonances) as RelicFamilyId[]).reduce(
    (acc, fam) => acc + (engine.getResonanceTier(fam) > 0 ? 1 : 0),
    0
  );
  const totalSynergies = activeResonanceTiers + activeFusions.length;

  const boss = engine.activeBoss;
  const bossHpRatio = boss && boss.maxHp > 0 ? Math.max(0, boss.hp / boss.maxHp) : 0;
  const bossChapter = getChapterForSector(engine.currentLevel);

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-2.5 sm:p-3 select-none">
      {/* Top Section */}
      <div className="w-full max-w-xl mx-auto flex flex-col gap-1.5 pointer-events-auto">
        {/* Main Header Bar */}
        <div className="w-full flex items-center justify-between gap-2 bg-[#090d16]/90 backdrop-blur-md border border-[#1e2e48] rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-lg shadow-cyan-950/20">
          {/* Left: Sector & Campaign tag */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[11px] sm:text-xs font-black tracking-wider uppercase px-2 py-0.5 rounded-md ${
                  isBossSector
                    ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40 animate-pulse'
                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                }`}
              >
                {isBossSector
                  ? `BOSS · ${chapter.bossName}`
                  : engine.isEndless
                  ? `ABISSO · LOOP ${engine.currentLevel}`
                  : engine.gameMode === 'STORY'
                  ? `CAP. ${chapter.id} · ${engine.currentLevel}/25`
                  : `ARCADE · ${engine.currentLevel}/10`}
              </span>
              {engine.isEndless && (
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                  ENDLESS
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-300">
              <span className="flex items-center gap-1 text-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                Core: {remainingCores}/{totalCores}
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-sky-300 flex items-center gap-1 font-bold">
                ◆ {engine.quantumShardsRun + engine.progression.getData().quantumShards}
              </span>
            </div>
          </div>

          {/* Center: Score & HighScore */}
          <div className="flex flex-col items-center">
            <span className="text-sm sm:text-base font-black font-mono text-white tracking-wider">
              {engine.score.toLocaleString()}
            </span>
            <span className="text-[9px] sm:text-[10px] font-mono text-slate-400">
              HI: {Math.max(engine.score, engine.highScore).toLocaleString()}
            </span>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Install / APK button */}
            <button
              onClick={onOpenInstall}
              title="Scarica APK Android"
              className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 hover:text-emerald-300 hover:border-emerald-400 transition"
            >
              <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Codex Button */}
            <button
              onClick={onOpenCodex}
              title="Codex Poteri & Combo"
              className="p-1.5 rounded-lg bg-[#141d2d] border border-purple-500/40 text-purple-400 hover:text-purple-300 hover:border-purple-400 transition"
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Relic count / Synergies Drawer Button */}
            <button
              onClick={onOpenRelicList}
              title="Reliquie Attive e Sinergie"
              className="p-1.5 rounded-lg bg-[#141d2d] border border-[#1e2e48] text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/50 transition flex items-center gap-1 text-xs font-mono font-bold relative"
            >
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{engine.activeRelics.length}</span>
              {totalSynergies > 0 && (
                <span className="absolute -top-1 -right-1 px-1 py-0.2 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-[9px] font-black rounded-full shadow-sm animate-pulse">
                  ⚡{totalSynergies}
                </span>
              )}
            </button>

            {/* Speed Boost */}
            <button
              onClick={toggleSpeed}
              title="Velocità 2x"
              className={`p-1.5 rounded-lg border transition ${
                speedActive
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-sm shadow-amber-500/30'
                  : 'bg-[#141d2d] border-[#1e2e48] text-slate-400 hover:text-white'
              }`}
            >
              <FastForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              title="Audio ON/OFF"
              className={`p-1.5 rounded-lg border transition ${
                soundActive
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                  : 'bg-[#141d2d] border-[#1e2e48] text-slate-500'
              }`}
            >
              {soundActive ? (
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>

            {/* Guide / Info */}
            <button
              onClick={onOpenInfo}
              title="Guida di Gioco"
              className="p-1.5 rounded-lg bg-[#141d2d] border border-[#1e2e48] text-slate-400 hover:text-white transition"
            >
              <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Boss HP Bar (Visible only during Boss Fights when Boss is Alive) */}
        {isBossSector && boss && boss.isAlive && (
          <div className="w-full bg-[#090d16]/90 backdrop-blur-md border border-pink-500/40 rounded-xl px-3 py-1.5 flex flex-col gap-1 shadow-md shadow-pink-950/30">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                <span className="font-black text-white uppercase tracking-wider">
                  {bossChapter.bossName}
                </span>
                <span className="text-[10px] text-pink-400 font-bold px-1.5 py-0.2 rounded bg-pink-500/20 border border-pink-500/30">
                  FASE {engine.bossPhase}/3
                </span>
              </div>
              <span className="text-pink-300 font-bold">
                {boss.hp} / {boss.maxHp} HP
              </span>
            </div>

            {/* HP Bar */}
            <div className="w-full h-2 rounded-full bg-slate-900 border border-pink-500/30 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-pink-500 via-rose-400 to-amber-300 transition-all duration-150"
                style={{ width: `${bossHpRatio * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Ball Count & Combo Indicator */}
      <div className="w-full max-w-xl mx-auto flex items-end justify-between gap-3 pointer-events-auto">
        {/* Remaining balls pill */}
        <div className="bg-[#090d16]/90 backdrop-blur-md border border-[#1e2e48] rounded-xl px-3.5 py-2 flex items-center gap-2.5 shadow-lg">
          <div className="flex -space-x-1.5 overflow-hidden">
            {Array.from({ length: Math.min(engine.ballsRemaining, 8) }).map((_, i) => (
              <span
                key={i}
                className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-cyan-400 to-white border border-cyan-300 shadow-sm shadow-cyan-400/50 block"
              />
            ))}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-white tracking-wide">
              {engine.ballsRemaining} {engine.ballsRemaining === 1 ? 'SFERA' : 'SFERE'}
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              {engine.isNextBallElectrified ? '⚡ Sfera Sovraccarica!' : 'Pronto al tiro'}
            </span>
          </div>
        </div>

        {/* Combo Multiplier (visible when combo > 0) */}
        {engine.currentCombo > 0 && (
          <div className="bg-[#090d16]/90 backdrop-blur-md border border-amber-500/50 rounded-xl px-3.5 py-2 flex items-center gap-2 shadow-lg shadow-amber-500/10 animate-bounce">
            <span className="text-xs font-black text-amber-400 font-mono tracking-wider">
              COMBO x{engine.currentCombo}
            </span>
            <span className="text-[10px] font-mono text-slate-300">
              +{engine.currentShotScore.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
