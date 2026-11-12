import React, { useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { RELIC_FAMILIES, RelicFamilyId } from '../types/game';

interface HUDProps {
  engine: GameEngine;
  onOpenRelicList?: () => void;
  onOpenPause?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  engine,
  onOpenRelicList,
  onOpenPause,
}) => {
  const [speedActive, setSpeedActive] = useState(engine.speedBoost);

  const toggleSpeed = () => {
    engine.speedBoost = !engine.speedBoost;
    setSpeedActive(engine.speedBoost);
  };

  const remainingCores = engine.getRemainingCoreCubes();
  const totalCores = engine.getTotalCoreCubes();
  const maxSectors = engine.gameMode === 'STORY' ? 25 : 10;

  const resonances = engine.getActiveResonances();
  const activeSynergiesCount = (Object.keys(resonances) as RelicFamilyId[]).filter(
    (fam) => resonances[fam] >= 2
  ).length;

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-2 sm:p-2.5 select-none">
      {/* Top Bar — Minimalist Matte Corner Groups (leaves center turret 100% clear) */}
      <div className="w-full flex items-start justify-between gap-2 pointer-events-auto">
        {/* Left Corner Group */}
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-1">
            {/* Sector Box */}
            <div className="h-7 sm:h-8 px-2.5 rounded-md bg-[#12141a]/95 border border-[#2d323e] flex items-center">
              <span className="text-[11px] sm:text-xs font-bold text-zinc-200 tracking-wide whitespace-nowrap tabular-nums">
                {engine.isEndless
                  ? `LOOP ${engine.currentLevel}`
                  : `SETT. ${engine.currentLevel}/${maxSectors}`}
              </span>
            </div>

            {/* Quantum Shards Box */}
            <div className="h-7 sm:h-8 px-2.5 rounded-md bg-[#12141a]/95 border border-[#2d323e] flex items-center">
              <span className="text-[11px] sm:text-xs font-bold text-[#94a3b8] whitespace-nowrap tabular-nums">
                ◆ {engine.quantumShardsRun + engine.progression.getData().quantumShards}
              </span>
            </div>
          </div>

          {/* Core Target Box */}
          <div className="h-7 sm:h-8 px-2.5 rounded-md bg-[#171512]/95 border border-[#d4b483]/50 flex items-center">
            <span className="text-[11px] sm:text-xs font-bold text-[#d4b483] tracking-wide whitespace-nowrap tabular-nums">
              ★ CORE: {remainingCores}/{totalCores}
            </span>
          </div>
        </div>

        {/* Right Corner Controls: Speed + Menu on row 1, Relics/Masteries + Score on row 2 */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleSpeed}
              aria-label="Velocità 2X"
              className={`h-7 sm:h-8 px-2.5 rounded-md border font-bold text-[11px] sm:text-xs tracking-wide flex items-center justify-center active:scale-95 cursor-pointer whitespace-nowrap ${
                speedActive
                  ? 'bg-zinc-200 border-zinc-200 text-zinc-950'
                  : 'bg-[#12141a]/95 border-[#2d323e] text-zinc-300'
              }`}
            >
              {speedActive ? '2X >>' : '1X >'}
            </button>

            <button
              type="button"
              onClick={onOpenPause}
              aria-label="Menu Pausa"
              className="h-7 sm:h-8 px-2.5 rounded-md bg-[#12141a]/95 border border-[#2d323e] text-zinc-200 font-bold text-[11px] sm:text-xs tracking-wide flex items-center justify-center active:scale-95 cursor-pointer whitespace-nowrap"
            >
              MENU
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] sm:text-xs font-bold font-mono text-zinc-400 tabular-nums">
              {engine.score.toLocaleString()} PT
            </span>

            <button
              type="button"
              onClick={onOpenRelicList}
              aria-label="Reliquie e Maestrie Attive"
              className="h-7 sm:h-8 px-2.5 rounded-md bg-[#12141a]/95 border border-[#2d323e] text-zinc-300 font-bold text-[11px] sm:text-xs tracking-wide flex items-center justify-center gap-1 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <span>REL: {engine.activeRelics.length}</span>
              {activeSynergiesCount > 0 && (
                <span className="text-[#d4b483]">★{activeSynergiesCount}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar — Minimalist Ball Counter, Overcharge Carry-Over & Shot Combo */}
      <div className="w-full flex items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <div className="h-8 sm:h-9 px-3 rounded-lg bg-[#12141a]/95 border border-[#2d323e] flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-zinc-200 tabular-nums whitespace-nowrap">
              SFERE: {engine.ballsRemaining}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(engine.ballsRemaining, 8) }).map((_, i) => (
                <span
                  key={i}
                  className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-zinc-300 block"
                />
              ))}
            </div>
          </div>

          {engine.nextSectorOverchargeStacks > 0 && engine.state === 'AIMING' && (
            <div className="h-8 sm:h-9 px-2.5 rounded-lg bg-[#171512]/95 border border-[#d4b483]/70 flex items-center gap-1">
              <span className="text-[11px] sm:text-xs font-bold text-[#d4b483] whitespace-nowrap tabular-nums">
                ⚡ OVERCHARGE +{engine.nextSectorOverchargeStacks * 25}% DMG
              </span>
            </div>
          )}
        </div>

        {engine.currentCombo > 0 && (
          <div className="h-8 sm:h-9 px-2.5 rounded-lg bg-[#12141a]/95 border border-[#d4b483]/50 flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#d4b483] tabular-nums">
              x{engine.currentCombo}
            </span>
            <span className="text-xs text-zinc-200 tabular-nums">
              +{engine.currentShotScore.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
