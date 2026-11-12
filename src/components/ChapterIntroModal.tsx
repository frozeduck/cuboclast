import React from 'react';
import { GameEngine } from '../game/GameEngine';
import { getChapterForSector } from '../types/game';

interface ChapterIntroModalProps {
  engine: GameEngine;
}

export const ChapterIntroModal: React.FC<ChapterIntroModalProps> = ({ engine }) => {
  const chapter = getChapterForSector(engine.currentLevel);

  return (
    <div
      role="dialog"
      aria-label={`Trasmissione Capitolo ${chapter.id}`}
      className="fixed inset-0 z-50 bg-[#08090c]/96 flex items-center justify-center sm:p-4"
    >
      <div className="w-full h-full sm:h-auto sm:max-h-[90dvh] max-w-md bg-[#0c0e13] sm:border border-[#272b36] sm:rounded-2xl flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="shrink-0 bg-[#0c0e13] border-b border-[#222630] px-4 py-3.5 flex items-center justify-between gap-2">
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
              TRASMISSIONE · {chapter.subtitle.toUpperCase()}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100 uppercase tracking-wider mt-0.5">
              {chapter.title}
            </h2>
          </div>

          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#14171f] border border-[#2d323e] text-zinc-300">
            CAP. {chapter.id}/5
          </span>
        </div>

        {/* Single Scrollable Body */}
        <div
          data-testid="chapter-intro-scroll-body"
          className="flex-1 min-h-0 modal-scroll p-4 space-y-3"
        >
          {/* Lore Transmission Box */}
          <div className="rounded-xl bg-[#13161e] border border-[#222630] p-3.5 space-y-1.5">
            <div className="text-[11px] font-mono font-bold text-zinc-400 uppercase">
              Rapporto Settoriale
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{chapter.lore}</p>
          </div>

          {/* Unlocked Cubes & Mechanics Box */}
          <div className="rounded-xl bg-[#13161e] border border-[#2d323e] p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-300 uppercase">
                Meccaniche & Cubi Attivi
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                Settori {chapter.sectorsRange[0]}-{chapter.sectorsRange[1]}
              </span>
            </div>
            <div className="text-xs font-bold text-zinc-100">{chapter.unlockedCubesLabel}</div>
            <p className="text-xs text-zinc-400 leading-relaxed">{chapter.hazardNote}</p>
          </div>

          {/* Chapter Boss Target Box */}
          <div className="rounded-xl bg-[#13161e] border border-[#d4b483]/50 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-[#d4b483]">
                Guardiano al Settore {chapter.bossSector}
              </span>
              <span className="text-xs font-mono font-bold text-zinc-200">
                {chapter.bossHp} HP · {chapter.satelliteCount} Sat.
              </span>
            </div>
            <div className="text-sm font-bold text-zinc-100">{chapter.bossName}</div>
            <div className="text-xs text-zinc-400">{chapter.bossTitle}</div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="shrink-0 bg-[#0c0e13] border-t border-[#222630] p-3.5">
          <button
            type="button"
            data-testid="confirm-chapter-btn"
            onClick={() => engine.confirmChapterIntro()}
            className="w-full min-h-[48px] rounded-xl font-bold text-sm uppercase tracking-wider bg-zinc-200 text-zinc-950 active:scale-[0.99] transition cursor-pointer"
          >
            SCEGLI DOTAZIONE INIZIALE · SETTORE {engine.currentLevel} →
          </button>
        </div>
      </div>
    </div>
  );
};
