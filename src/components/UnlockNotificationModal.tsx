import React, { useEffect } from 'react';
import { UnlockEventNotification } from '../types/game';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Zap, Check } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface UnlockNotificationModalProps {
  unlock: UnlockEventNotification;
  onDismiss: () => void;
}

export const UnlockNotificationModal: React.FC<UnlockNotificationModalProps> = ({
  unlock,
  onDismiss,
}) => {
  useEffect(() => {
    soundEngine.playResonanceFanfare();
    soundEngine.triggerHaptic(80);
    try {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#00e5ff', '#00ff88', '#ffe600', '#a855f7'],
      });
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#04060a]/92 backdrop-blur-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <div
        className="w-full max-w-md bg-[#090d16] border-2 rounded-3xl p-5 sm:p-7 text-center relative flex flex-col gap-3 sm:gap-4 shadow-2xl max-h-[90dvh] overflow-y-auto touch-scroll overscroll-contain"
        style={{
          borderColor: unlock.color || '#ffe600',
          boxShadow: `0 0 50px ${unlock.color || '#ffe600'}40`,
        }}
      >
        <div className="flex flex-col items-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg mb-3"
            style={{
              backgroundColor: `${unlock.color || '#ffe600'}20`,
              borderColor: unlock.color || '#ffe600',
            }}
          >
            <Sparkles className="w-7 h-7" style={{ color: unlock.color || '#ffe600' }} />
          </div>

          <span
            className="text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full border mb-1"
            style={{
              backgroundColor: `${unlock.color || '#ffe600'}15`,
              borderColor: `${unlock.color || '#ffe600'}50`,
              color: unlock.color || '#ffe600',
            }}
          >
            {unlock.title}
          </span>

          <h3 className="text-2xl font-black text-white mt-1 uppercase tracking-wide">
            {unlock.name}
          </h3>
        </div>

        <div className="bg-[#141d2d] rounded-2xl p-4 border border-[#1e2e48] text-xs text-slate-200 leading-relaxed font-sans">
          {unlock.description}
        </div>

        <button
          onClick={onDismiss}
          className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider text-slate-950 transition active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
          style={{
            backgroundColor: unlock.color || '#00e5ff',
          }}
        >
          <Check className="w-4 h-4 stroke-[3]" />
          Continua l'Avventura
        </button>
      </div>
    </div>
  );
};
