import React, { useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { soundEngine } from '../audio/soundEngine';
import { RELIC_FAMILIES, RELICS_DATA, RelicFamilyId } from '../types/game';
import { Volume2, VolumeX, FastForward, Sparkles, ShieldAlert, Info, Layers } from 'lucide-react';

interface HUDProps {
  engine: GameEngine;
  onOpenRelicList?: () => void;
  onOpenInfo?: () => void;
}

export const HUD: React.FC<HUDProps> = ({ engine, onOpenRelicList, onOpenInfo }) => {
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
  const resonances = engine.getActiveResonances();

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 select-none">
      {/* Top Header Bar */}
      <div className="w-full max-w-xl mx-auto flex items-center justify-between gap-2 bg-[#090d16]/85 backdrop-blur-md border border-[#1e2e48] rounded-2xl px-4 py-2.5 shadow-lg shadow-cyan-950/20 pointer-events-auto">
        {/* Left: Sector & Boss tag */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs font-black tracking-wider uppercase px-2 py-0.5 rounded-md ${
                isBossSector
                  ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40 animate-pulse'
                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              }`}
            >
              {isBossSector ? 'BOSS FIGHT' : `SETTORE ${engine.currentLevel}`}
            </span>
            {engine.isEndless && (
              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                ENDLESS
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-300">
            <span className="flex items-center gap-1 text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Core: {remainingCores}/{totalCores}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-sky-300 flex items-center gap-1 font-bold">
              ◆ {engine.quantumShardsRun + engine.progression.getData().quantumShards}
            </span>
          </div>
        </div>

        {/* Center: Score & HighScore */}
        <div className="flex flex-col items-center">
          <span className="text-sm font-black font-mono text-white tracking-wider">
            {engine.score.toLocaleString()}
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            HI: {Math.max(engine.score, engine.highScore).toLocaleString()}
          </span>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Relic count / Synergies */}
          <button
            onClick={onOpenRelicList}
            title="Reliquie Attive e Sinergie"
            className="p-1.5 rounded-lg bg-[#141d2d] border border-[#1e2e48] text-purple-400 hover:text-purple-300 hover:border-purple-500/50 transition flex items-center gap-1 text-xs font-mono font-bold"
          >
            <Layers className="w-4 h-4" />
            <span>{engine.activeRelics.length}</span>
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
            <FastForward className="w-4 h-4" />
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
            {soundActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Guide / Info */}
          <button
            onClick={onOpenInfo}
            title="Info & Archetipi"
            className="p-1.5 rounded-lg bg-[#141d2d] border border-[#1e2e48] text-slate-400 hover:text-white transition"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Resonance Tiers Chips (if any synergy active) */}
      <div className="w-full max-w-xl mx-auto flex flex-wrap items-center justify-center gap-1.5 mt-1 pointer-events-auto">
        {(Object.keys(resonances) as RelicFamilyId[]).map((fam) => {
          const tier = engine.getResonanceTier(fam);
          if (tier === 0) return null;
          const famInfo = RELIC_FAMILIES[fam];
          return (
            <div
              key={fam}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur border shadow-sm"
              style={{
                backgroundColor: `${famInfo.color}15`,
                borderColor: `${famInfo.color}60`,
                color: famInfo.color,
              }}
            >
              <Sparkles className="w-3 h-3" />
              <span>
                {famInfo.label} {tier === 2 ? 'MAESTRIA ★★★' : 'SINERGIA ★★'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom Ball Count & Combo Indicator */}
      <div className="w-full max-w-xl mx-auto flex items-end justify-between gap-3 pointer-events-auto">
        {/* Remaining balls pill */}
        <div className="bg-[#090d16]/85 backdrop-blur-md border border-[#1e2e48] rounded-xl px-3.5 py-2 flex items-center gap-2.5 shadow-lg">
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
            <span className="text-[10px] font-mono text-cyan-400">Pronto al tiro</span>
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
