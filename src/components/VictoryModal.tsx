import React from 'react';
import { GameEngine } from '../game/GameEngine';

interface VictoryModalProps {
  engine: GameEngine;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ engine }) => {
  const isStory = engine.gameMode === 'STORY';

  return (
    <div
      role="dialog"
      aria-label="Vittoria"
      className="fixed inset-0 z-50 bg-[#080b12]/96 flex items-center justify-center sm:p-4"
    >
      <div className="w-full h-full sm:h-auto sm:max-h-[90dvh] max-w-md bg-[#090d16] sm:border-2 border-[#00ff88] sm:rounded-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 bg-[#090d16] border-b border-[#1e2e48] px-4 py-4 text-center">
          <div className="text-xs font-mono text-[#00ff88] uppercase tracking-wider">
            {isStory ? 'SETTORE 25 PURIFICATO' : 'SETTORE 10 PURIFICATO'}
          </div>
          <h2 className="text-2xl font-bold text-[#00ff88] uppercase tracking-wider mt-0.5">
            {isStory ? 'ARCHITETTO SCONFITTO!' : 'TESSERACT SCONFITTO!'}
          </h2>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 modal-scroll p-4 space-y-3">
          <div className="rounded-xl bg-[#141d2d] border-2 border-[#1e2e48] p-4 space-y-2.5 text-xs font-mono tabular-nums">
            <div className="flex items-center justify-between text-slate-300">
              <span>MODALITÀ:</span>
              <span className="font-bold text-white">
                {isStory ? 'STORIA (25 SETTORI)' : 'ARCADE (10 SETTORI)'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>PUNTEGGIO FINALE:</span>
              <span className="font-bold text-[#00ff88] text-sm">
                {engine.score.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>SCHEGGE GUADAGNATE:</span>
              <span className="font-bold text-[#38bdf8]">◆ +{engine.quantumShardsRun}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>BONUS SFERE SALVE:</span>
              <span className="font-bold text-[#ffe600]">
                +{(engine.ballsRemaining * 2000).toLocaleString()}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => engine.startEndlessLoop()}
            className="w-full min-h-[48px] rounded-xl bg-[#ffe600] text-[#080b12] font-bold text-sm uppercase tracking-wider cursor-pointer active:scale-[0.99]"
          >
            ∞ ENTRA NEL LOOP ENDLESS
          </button>

          <button
            type="button"
            data-start="true"
            onClick={() => engine.initGame()}
            className="w-full min-h-[46px] rounded-xl bg-[#00e5ff] text-[#080b12] font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-[0.99]"
          >
            MENU PRINCIPALE
          </button>
        </div>
      </div>
    </div>
  );
};
