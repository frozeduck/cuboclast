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

  const accentColor = unlock.color || '#d4b483';

  return (
    <div
      role="dialog"
      aria-label="Nuovo Sblocco"
      className="fixed inset-0 z-50 bg-[#07080b]/96 flex items-center justify-center p-4"
    >
      <div
        className="w-full max-w-md bg-[#0c0e13] border rounded-2xl p-5 text-center space-y-4"
        style={{ borderColor: `${accentColor}66` }}
      >
        <div>
          <div
            className="text-xs font-mono font-bold uppercase tracking-wider"
            style={{ color: accentColor }}
          >
            [{unlock.title}]
          </div>
          <h3 className="text-xl font-bold text-zinc-100 uppercase tracking-wide mt-1">
            {unlock.name}
          </h3>
        </div>

        <div className="bg-[#13161e] rounded-xl p-3.5 border border-[#242834] text-xs text-zinc-300 leading-relaxed">
          {unlock.description}
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="w-full min-h-[46px] rounded-xl font-bold text-xs uppercase tracking-wider bg-zinc-200 text-zinc-950 cursor-pointer active:scale-95"
        >
          CONTINUA
        </button>
      </div>
    </div>
  );
};
