import React, { useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { soundEngine } from '../audio/soundEngine';
import {
  Play,
  Volume2,
  VolumeX,
  BookOpen,
  HelpCircle,
  Smartphone,
  LogOut,
  X,
  ShieldAlert,
} from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#04060a]/92 backdrop-blur-md overflow-hidden animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#090d16] border-2 border-cyan-400 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(0,229,255,0.25)] text-center relative flex flex-col gap-3.5 max-h-[90dvh] overflow-y-auto touch-scroll overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1e2e48] pb-3">
          <div className="text-left">
            <h3 className="text-lg font-black text-white uppercase tracking-wider">
              Partita in Pausa
            </h3>
            <p className="text-[11px] font-mono text-cyan-400">
              {engine.gameMode === 'STORY' ? 'Campagna Storia' : 'Arcade'} · Settore {engine.currentLevel}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#141d2d] hover:bg-[#1e2e48] text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="flex flex-col gap-2">
          {/* Resume */}
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-sm uppercase tracking-wider transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            Riprendi Gioco
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="w-full py-3 rounded-2xl bg-[#141d2d] hover:bg-[#1e2e48] border border-[#1e2e48] text-slate-200 font-bold text-xs uppercase tracking-wider transition flex items-center justify-between px-4 active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              {soundActive ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              <span>Effetti Sonori</span>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-black ${soundActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'}`}>
              {soundActive ? 'ATTIVI' : 'MUTI'}
            </span>
          </button>

          {/* Codex */}
          <button
            onClick={() => {
              onClose();
              onOpenCodex();
            }}
            className="w-full py-3 rounded-2xl bg-[#141d2d] hover:bg-[#1e2e48] border border-purple-500/30 text-purple-300 font-bold text-xs uppercase tracking-wider transition flex items-center justify-between px-4 active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Codex Poteri & Combo</span>
            </div>
            <span className="text-slate-500 text-sm">→</span>
          </button>

          {/* Guide / Info */}
          <button
            onClick={() => {
              onClose();
              onOpenInfo();
            }}
            className="w-full py-3 rounded-2xl bg-[#141d2d] hover:bg-[#1e2e48] border border-[#1e2e48] text-slate-300 font-bold text-xs uppercase tracking-wider transition flex items-center justify-between px-4 active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Guida & Meccaniche</span>
            </div>
            <span className="text-slate-500 text-sm">→</span>
          </button>

          {/* Install / APK */}
          <button
            onClick={() => {
              onClose();
              onOpenInstall();
            }}
            className="w-full py-3 rounded-2xl bg-[#141d2d] hover:bg-[#1e2e48] border border-emerald-500/30 text-emerald-300 font-bold text-xs uppercase tracking-wider transition flex items-center justify-between px-4 active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Scarica APK Android</span>
            </div>
            <span className="text-slate-500 text-sm">→</span>
          </button>
        </div>

        {/* Abandon Run Section */}
        <div className="pt-2 border-t border-[#1e2e48]">
          {!showConfirmQuit ? (
            <button
              onClick={() => setShowConfirmQuit(true)}
              className="w-full py-2.5 rounded-xl bg-rose-950/30 hover:bg-rose-950/50 border border-rose-500/40 text-rose-400 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Termina / Abbandona Partita</span>
            </button>
          ) : (
            <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/50 text-left">
              <div className="flex items-center gap-1.5 text-xs text-rose-300 font-bold">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Sei sicuro di voler abbandonare?</span>
              </div>
              <p className="text-[11px] text-slate-300">
                I progressi di questa run andranno persi, ma manterrai le Schegge Quantiche accumulate.
              </p>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={handleAbandon}
                  className="flex-1 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer"
                >
                  Sì, Abbandona
                </button>
                <button
                  onClick={() => setShowConfirmQuit(false)}
                  className="px-3 py-2 rounded-lg bg-[#141d2d] hover:bg-[#1e2e48] text-slate-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  Annulla
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
