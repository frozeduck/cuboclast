import React, { useEffect } from 'react';
import { UnlockEventNotification } from '../types/game';
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
  }, []);

  const accentColor = unlock.color || '#ffe600';

  return (
    <div
      role="dialog"
      aria-label="Nuovo Sblocco"
      className="fixed inset-0 z-50 bg-[#080b12]/96 flex items-center justify-center p-4"
    >
      <div
        className="w-full max-w-md bg-[#090d16] border-2 rounded-2xl p-5 text-center space-y-4"
        style={{ borderColor: accentColor }}
      >
        <div>
          <div
            className="text-xs font-mono font-bold uppercase tracking-wider"
            style={{ color: accentColor }}
          >
            [{unlock.title}]
          </div>
          <h3 className="text-xl font-bold text-white uppercase tracking-wide mt-1">
            {unlock.name}
          </h3>
        </div>

        <div className="bg-[#141d2d] rounded-xl p-3.5 border border-[#1e2e48] text-xs text-slate-200 leading-relaxed">
          {unlock.description}
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="w-full min-h-[46px] rounded-xl font-bold text-xs uppercase tracking-wider text-[#080b12] cursor-pointer active:scale-95"
          style={{ backgroundColor: accentColor }}
        >
          CONTINUA
        </button>
      </div>
    </div>
  );
};
