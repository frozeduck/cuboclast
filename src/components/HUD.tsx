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
  const activeResonanceTags = (Object.keys(resonances) as RelicFamilyId[])
    .filter((fam) => resonances[fam] >= 2)
    .map((fam) => ({
      id: fam,
      label: RELIC_FAMILIES[fam].label.toUpperCase(),
      count: resonances[fam],
      color: RELIC_FAMILIES[fam].color,
    }));

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-2 sm:p-2.5 select-none">
      {/* Top Bar — Minimalist Geometric Corner Groups (leaves center turret 100% clear) */}
      <div className="w-full flex items-start justify-between gap-2 pointer-events-auto">
        {/* Left Corner Group */}
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-1">
            {/* Sector Box */}
            <div className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-md bg-[#141d2d] border-2 border-[#00e5ff] flex items-center">
              <span className="text-[11px] sm:text-xs font-bold text-white tracking-wide whitespace-nowrap tabular-nums">
                {engine.isEndless
                  ? `LOOP ${engine.currentLevel}`
                  : `SETT. ${engine.currentLevel}/${maxSectors}`}
              </span>
            </div>

            {/* Quantum Shards Box */}
            <div className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-md bg-[#082a2e] border-2 border-[#38bdf8] flex items-center">
              <span className="text-[11px] sm:text-xs font-bold text-[#38bdf8] whitespace-nowrap tabular-nums">
                ◆ {engine.quantumShardsRun + engine.progression.getData().quantumShards}
              </span>
            </div>
          </div>

          {/* Core Target Box */}
          <div className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-md bg-[#2a2208] border-2 border-[#ffe600] flex items-center">
            <span className="text-[11px] sm:text-xs font-bold text-[#ffe600] tracking-wide whitespace-nowrap tabular-nums">
              ★ CORE: {remainingCores}/{totalCores}
            </span>
          </div>
        </div>

        {/* Right Corner Controls: Speed + Menu on row 1, Relics + Score on row 2 */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleSpeed}
              aria-label="Velocità 2X"
              className={`h-7 sm:h-8 px-2 sm:px-2.5 rounded-md border-2 font-bold text-[11px] sm:text-xs tracking-wide flex items-center justify-center active:scale-95 cursor-pointer whitespace-nowrap ${
                speedActive
                  ? 'bg-[#ff007f] border-white text-white'
                  : 'bg-[#141d2d] border-[#00e5ff] text-white'
              }`}
            >
              {speedActive ? '2X >>' : '1X >'}
            </button>

            <button
              type="button"
              onClick={onOpenPause}
              aria-label="Menu Pausa"
              className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-md bg-[#141d2d] border-2 border-[#00e5ff] text-white font-bold text-[11px] sm:text-xs tracking-wide flex items-center justify-center active:scale-95 cursor-pointer whitespace-nowrap"
            >
              MENU
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] sm:text-xs font-bold font-mono text-slate-300 tabular-nums">
              {engine.score.toLocaleString()} PT
            </span>

            <button
              type="button"
              onClick={onOpenRelicList}
              aria-label="Reliquie Attive"
              className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-md bg-[#141d2d] border-2 border-[#a855f7] text-[#a855f7] font-bold text-[11px] sm:text-xs tracking-wide flex items-center justify-center active:scale-95 cursor-pointer whitespace-nowrap"
            >
              REL: {engine.activeRelics.length}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar — Minimalist Ball Counter & Active Resonances */}
      <div className="w-full flex items-center justify-between gap-2 pointer-events-none">
        <div className="h-9 px-3 rounded-lg bg-[#141d2d] border border-[#1e2e48] flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-[#00e5ff] tabular-nums whitespace-nowrap">
            SFERE: {engine.ballsRemaining}
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(engine.ballsRemaining, 8) }).map((_, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-[#00e5ff] block"
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {engine.currentCombo > 0 && (
            <div className="h-9 px-2.5 rounded-lg bg-[#141d2d] border border-[#ffe600] flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#ffe600] tabular-nums">
                x{engine.currentCombo}
              </span>
              <span className="text-xs text-white tabular-nums">
                +{engine.currentShotScore.toLocaleString()}
              </span>
            </div>
          )}

          {activeResonanceTags.map((tag) => (
            <span
              key={tag.id}
              className="text-xs font-bold font-mono tracking-wide px-2 py-1 rounded bg-[#141d2d]/90"
              style={{ color: tag.color }}
            >
              [{tag.label} {tag.count}x{tag.count >= 3 ? ' MAESTRIA' : ''}]
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
