import React, { useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { soundEngine } from '../audio/soundEngine';

interface PauseMenuModalProps {
  engine: GameEngine;
  onClose: () => void;
  onOpenRelicList: () => void;
  onOpenCodex: () => void;
  onOpenInfo: () => void;
  onOpenInstall: () => void;
}

export const PauseMenuModal: React.FC<PauseMenuModalProps> = ({
  engine,
  onClose,
  onOpenRelicList,
  onOpenCodex,
  onOpenInfo,
  onOpenInstall,
}) => {
  const [soundActive, setSoundActive] = useState(soundEngine.isEnabled());
  const [showConfirmQuit, setShowConfirmQuit] = useState(false);

  const toggleSound = () => {
    const newState = soundEngine.toggleSound();
    setSoundActive(newState);
  };

  const handleAbandon = () => {
    engine.abandonRun();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-label="Partita in Pausa"
      className="fixed inset-0 z-50 bg-[#08090c]/96 flex items-center justify-center sm:p-4"
    >
      <div className="w-full h-full sm:h-auto sm:max-h-[90dvh] max-w-sm bg-[#0c0e13] sm:border border-[#272b36] sm:rounded-2xl flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="shrink-0 bg-[#0c0e13] border-b border-[#222630] px-4 py-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-100 uppercase tracking-wider leading-none">
              PAUSA
            </h3>
            <p className="text-xs font-mono text-zinc-400 mt-1 tabular-nums">
              {engine.gameMode === 'STORY' ? 'Storia' : 'Arcade'} · Settore {engine.currentLevel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[38px] px-3 rounded-lg bg-[#14171f] border border-[#2d323e] text-zinc-200 font-bold text-xs uppercase cursor-pointer active:scale-95"
          >
            ✕
          </button>
        </div>

        {/* Single Scrollable Body */}
        <div className="flex-1 min-h-0 modal-scroll p-4 space-y-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[48px] rounded-xl bg-zinc-200 text-zinc-950 font-bold text-sm uppercase tracking-wider cursor-pointer active:scale-[0.99]"
          >
            RIPRENDI PARTITA
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenRelicList();
            }}
            className="w-full min-h-[46px] px-4 rounded-xl bg-[#13161e] border border-[#2d323e] text-zinc-200 font-bold text-xs uppercase tracking-wider flex items-center justify-between cursor-pointer active:scale-[0.99]"
          >
            <span>RELIQUIE & MAESTRIE ATTIVE ({engine.activeRelics.length})</span>
            <span>→</span>
          </button>

          <button
            type="button"
            onClick={toggleSound}
            className="w-full min-h-[46px] px-4 rounded-xl bg-[#13161e] border border-[#222630] text-zinc-200 font-bold text-xs uppercase tracking-wider flex items-center justify-between cursor-pointer active:scale-[0.99]"
          >
            <span>AUDIO & SUONI</span>
            <span
              className={`font-mono font-bold ${
                soundActive ? 'text-[#7fa68e]' : 'text-zinc-500'
              }`}
            >
              {soundActive ? '[♪ ON]' : '[♪ OFF]'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCodex();
            }}
            className="w-full min-h-[46px] px-4 rounded-xl bg-[#13161e] border border-[#222630] text-zinc-200 font-bold text-xs uppercase tracking-wider flex items-center justify-between cursor-pointer active:scale-[0.99]"
          >
            <span>CODEX POTERI & COMBO</span>
            <span>→</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenInfo();
            }}
            className="w-full min-h-[46px] px-4 rounded-xl bg-[#13161e] border border-[#222630] text-zinc-300 font-bold text-xs uppercase tracking-wider flex items-center justify-between cursor-pointer active:scale-[0.99]"
          >
            <span>GUIDA DI GIOCO</span>
            <span>→</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenInstall();
            }}
            className="w-full min-h-[46px] px-4 rounded-xl bg-[#13161e] border border-[#222630] text-zinc-300 font-bold text-xs uppercase tracking-wider flex items-center justify-between cursor-pointer active:scale-[0.99]"
          >
            <span>SCARICA APK ANDROID</span>
            <span>→</span>
          </button>

          {/* Abandon Run */}
          <div className="pt-2 border-t border-[#222630]">
            {!showConfirmQuit ? (
              <button
                type="button"
                onClick={() => setShowConfirmQuit(true)}
                className="w-full min-h-[44px] rounded-xl bg-[#13161e] border border-[#c46d75]/60 text-[#c46d75] font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-[0.99]"
              >
                ABBANDONA PARTITA (MENU)
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-[#13161e] border border-[#c46d75] space-y-2">
                <p className="text-xs text-zinc-200">
                  Terminare la run corrente e tornare alla selezione del nucleo?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleAbandon}
                    className="min-h-[40px] rounded-lg bg-[#c46d75] text-zinc-950 font-bold text-xs uppercase cursor-pointer active:scale-95"
                  >
                    CONFERMA
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmQuit(false)}
                    className="min-h-[40px] rounded-lg bg-[#0c0e13] border border-[#222630] text-zinc-300 font-bold text-xs uppercase cursor-pointer active:scale-95"
                  >
                    ANNULLA
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
