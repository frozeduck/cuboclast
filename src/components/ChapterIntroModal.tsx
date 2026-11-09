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
      className="fixed inset-0 z-50 bg-[#080b12]/96 flex items-center justify-center sm:p-4"
    >
      <div
        className="w-full h-full sm:h-auto sm:max-h-[90dvh] max-w-md bg-[#090d16] sm:border-2 sm:rounded-2xl flex flex-col overflow-hidden"
        style={{ borderColor: chapter.bossColor }}
      >
        {/* Fixed Header */}
        <div className="shrink-0 bg-[#090d16] border-b border-[#1e2e48] px-4 py-3.5 flex items-center justify-between gap-2">
          <div>
            <div
              className="text-xs font-mono font-bold uppercase tracking-widest"
              style={{ color: chapter.bossColor }}
            >
              TRASMISSIONE · {chapter.subtitle.toUpperCase()}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white uppercase tracking-wider mt-0.5">
              {chapter.title}
            </h2>
          </div>

          <span
            className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#141d2d] border"
            style={{ color: chapter.bossColor, borderColor: chapter.bossColor }}
          >
            CAP. {chapter.id}/5
          </span>
        </div>

        {/* Single Scrollable Body */}
        <div
          data-testid="chapter-intro-scroll-body"
          className="flex-1 min-h-0 modal-scroll p-4 space-y-3"
        >
          {/* Lore Transmission Box */}
          <div className="rounded-xl bg-[#141d2d] border border-[#1e2e48] p-3.5 space-y-1.5">
            <div className="text-[11px] font-mono font-bold text-slate-400 uppercase">
              Rapporto Settoriale
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{chapter.lore}</p>
          </div>

          {/* Unlocked Cubes & Mechanics Box */}
          <div className="rounded-xl bg-[#141d2d] border-2 border-[#00e5ff] p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#00e5ff] uppercase">
                Meccaniche & Cubi Attivi
              </span>
              <span className="text-[11px] font-mono text-white">
                Settori {chapter.sectorsRange[0]}-{chapter.sectorsRange[1]}
              </span>
            </div>
            <div className="text-xs font-bold text-white">{chapter.unlockedCubesLabel}</div>
            <p className="text-xs text-slate-300 leading-relaxed">{chapter.hazardNote}</p>
          </div>

          {/* Chapter Boss Target Box */}
          <div
            className="rounded-xl bg-[#141d2d] border-2 p-3.5 space-y-1.5"
            style={{ borderColor: chapter.bossColor }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-mono font-bold uppercase"
                style={{ color: chapter.bossColor }}
              >
                Guardiano al Settore {chapter.bossSector}
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {chapter.bossHp} HP · {chapter.satelliteCount} Sat.
              </span>
            </div>
            <div className="text-sm font-bold text-white">{chapter.bossName}</div>
            <div className="text-xs text-slate-400">{chapter.bossTitle}</div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="shrink-0 bg-[#090d16] border-t border-[#1e2e48] p-3.5">
          <button
            type="button"
            data-testid="confirm-chapter-btn"
            onClick={() => engine.confirmChapterIntro()}
            className="w-full min-h-[48px] rounded-xl font-bold text-sm uppercase tracking-wider text-[#080b12] active:scale-[0.99] transition cursor-pointer"
            style={{ backgroundColor: chapter.bossColor }}
          >
            INIZIA CAPITOLO {chapter.id} · SETTORE {engine.currentLevel} →
          </button>
        </div>
      </div>
    </div>
  );
};
