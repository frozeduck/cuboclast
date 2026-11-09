import React, { useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { soundEngine } from '../audio/soundEngine';

interface PauseMenuModalProps {
  engine: GameEngine;
  onClose: () => void;
  onOpenCodex: () => void;
  onOpenInfo: () => void;
  onOpenInstall: () => void;
}

export const PauseMenuModal: React.FC<PauseMenuModalProps> = ({
  engine,
  onClose,
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
      className="fixed inset-0 z-50 bg-[#080b12]/96 flex items-center justify-center sm:p-4"
    >
      <div className="w-full h-full sm:h-auto sm:max-h-[90dvh] max-w-sm bg-[#090d16] sm:border-2 border-[#00e5ff] sm:rounded-2xl flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="shrink-0 bg-[#090d16] border-b border-[#1e2e48] px-4 py-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#00e5ff] uppercase tracking-wider leading-none">
              PAUSA
            </h3>
            <p className="text-xs font-mono text-slate-400 mt-1 tabular-nums">
              {engine.gameMode === 'STORY' ? 'Storia' : 'Arcade'} · Settore {engine.currentLevel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[38px] px-3 rounded-lg bg-[#141d2d] border border-[#1e2e48] text-white font-bold text-xs uppercase cursor-pointer active:scale-95"
          >
            ✕
          </button>
        </div>

        {/* Single Scrollable Body */}
        <div className="flex-1 min-h-0 modal-scroll p-4 space-y-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[48px] rounded-xl bg-[#00e5ff] text-[#080b12] font-bold text-sm uppercase tracking-wider cursor-pointer active:scale-[0.99]"
          >
            RIPRENDI PARTITA
          </button>

          <button
            type="button"
            onClick={toggleSound}
            className="w-full min-h-[46px] px-4 rounded-xl bg-[#141d2d] border-2 border-[#1e2e48] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-between cursor-pointer active:scale-[0.99]"
          >
            <span>AUDIO & SUONI</span>
            <span
              className={`font-mono font-bold ${
                soundActive ? 'text-[#00ff88]' : 'text-[#ff007f]'
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
            className="w-full min-h-[46px] px-4 rounded-xl bg-[#141d2d] border-2 border-[#a855f7] text-[#a855f7] font-bold text-xs uppercase tracking-wider flex items-center justify-between cursor-pointer active:scale-[0.99]"
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
            className="w-full min-h-[46px] px-4 rounded-xl bg-[#141d2d] border-2 border-[#1e2e48] text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-between cursor-pointer active:scale-[0.99]"
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
            className="w-full min-h-[46px] px-4 rounded-xl bg-[#141d2d] border-2 border-[#00ff88] text-[#00ff88] font-bold text-xs uppercase tracking-wider flex items-center justify-between cursor-pointer active:scale-[0.99]"
          >
            <span>SCARICA APK ANDROID</span>
            <span>→</span>
          </button>

          {/* Abandon Run */}
          <div className="pt-2 border-t border-[#1e2e48]">
            {!showConfirmQuit ? (
              <button
                type="button"
                onClick={() => setShowConfirmQuit(true)}
                className="w-full min-h-[44px] rounded-xl bg-[#141d2d] border-2 border-[#ff007f] text-[#ff007f] font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-[0.99]"
              >
                ABBANDONA PARTITA (MENU)
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-[#141d2d] border-2 border-[#ff007f] space-y-2">
                <p className="text-xs text-slate-200">
                  Terminare la run corrente e tornare alla selezione del nucleo?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleAbandon}
                    className="min-h-[40px] rounded-lg bg-[#ff007f] text-white font-bold text-xs uppercase cursor-pointer active:scale-95"
                  >
                    CONFERMA
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmQuit(false)}
                    className="min-h-[40px] rounded-lg bg-[#090d16] border border-[#1e2e48] text-slate-300 font-bold text-xs uppercase cursor-pointer active:scale-95"
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
