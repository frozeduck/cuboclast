import React from 'react';
import { GameEngine } from '../game/GameEngine';
import { getChapterForSector, SectorNodeType } from '../types/game';

interface SectorMapModalProps {
  engine: GameEngine;
}

const NODE_TYPE_BADGES: Record<SectorNodeType, string> = {
  NORMAL: '[SETTORE STANDARD]',
  ELITE: '[ROTTA ELITE · 2X PREMIO]',
  EVENT: '[ANOMALIA MISTERIOSA]',
  MERCHANT: '[MERCANTE ORBITALE]',
  BOSS: '[GUARDIANO CAPITOLO]',
};

export const SectorMapModal: React.FC<SectorMapModalProps> = ({ engine }) => {
  const targetSector = engine.pendingNextSector;
  const chapter = getChapterForSector(targetSector);
  const totalShards = engine.progression.getData().quantumShards;

  return (
    <div
      role="dialog"
      aria-label="Mappa Bivio Settoriale"
      className="fixed inset-0 z-50 bg-[#080b12]/96 flex items-center justify-center sm:p-4"
    >
      <div className="w-full h-full sm:h-auto sm:max-h-[92dvh] max-w-lg bg-[#090d16] sm:border-2 border-[#00e5ff] sm:rounded-2xl flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="shrink-0 bg-[#090d16] border-b border-[#1e2e48] px-4 py-3 flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-mono font-bold text-[#00e5ff] uppercase tracking-wider">
              {chapter.subtitle} · {chapter.title}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white uppercase tracking-wider mt-0.5">
              BIVIO TATTICO · SETTORE {targetSector}
            </h2>
          </div>

          <div className="h-9 px-2.5 rounded-lg bg-[#141d2d] border border-[#38bdf8] flex items-center">
            <span className="text-xs font-bold text-[#38bdf8] tabular-nums">
              ◆ {totalShards}
            </span>
          </div>
        </div>

        {/* Run Status Bar */}
        <div className="shrink-0 bg-[#0c121e] border-b border-[#1e2e48] px-4 py-2 flex items-center justify-between text-xs font-mono text-slate-300">
          <span>
            Sfere: <strong className="text-[#00e5ff]">{engine.ballsRemaining}</strong>
          </span>
          <span>
            Danno Base: <strong className="text-[#ffe600]">{1 + engine.runBonusDamage}</strong>
          </span>
          <span>
            Reliquie: <strong className="text-[#a855f7]">{engine.activeRelics.length}</strong>
          </span>
        </div>

        {/* Single Scrollable Route List */}
        <div
          data-testid="sector-map-scroll-body"
          className="flex-1 min-h-0 modal-scroll p-4 space-y-3"
        >
          <p className="text-xs text-slate-400">
            Scegli la rotta per il prossimo settore. Le rotte Elite offrono il doppio delle Schegge Quantiche e una sfera bonus, mentre Mercante e Anomalia permettono di potenziare la nave prima dello scontro.
          </p>

          {engine.nextMapNodes.map((node) => (
            <div
              key={node.id}
              onClick={() => engine.selectSectorMapNode(node.id)}
              className="w-full text-left rounded-xl bg-[#141d2d] border-2 p-3.5 transition cursor-pointer hover:brightness-110 space-y-2"
              style={{ borderColor: node.color }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm sm:text-base font-bold text-white">
                  {node.title}
                </span>
                <span
                  className="text-[11px] font-mono font-bold whitespace-nowrap"
                  style={{ color: node.color }}
                >
                  {NODE_TYPE_BADGES[node.type]}
                </span>
              </div>

              <div className="text-xs font-mono text-slate-400">{node.subtitle}</div>

              <p className="text-xs text-slate-200 leading-relaxed">{node.description}</p>

              <div className="pt-2 border-t border-[#1e2e48] flex items-center justify-between gap-2">
                <div className="space-y-0.5 text-[11px] font-mono">
                  <div className="text-[#00ff88]">★ {node.rewardText}</div>
                  <div className="text-slate-400">▲ {node.riskText}</div>
                </div>

                <button
                  type="button"
                  data-testid={`select-node-${node.type.toLowerCase()}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    engine.selectSectorMapNode(node.id);
                  }}
                  className="min-h-[38px] px-3.5 rounded-lg font-bold text-xs uppercase tracking-wider text-[#080b12] shrink-0 active:scale-95 cursor-pointer"
                  style={{ backgroundColor: node.color }}
                >
                  SCEGLI →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
