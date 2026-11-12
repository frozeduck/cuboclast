import React, { useState } from 'react';
import { GameEngine } from '../game/GameEngine';

interface SectorEventModalProps {
  engine: GameEngine;
}

export const SectorEventModal: React.FC<SectorEventModalProps> = ({ engine }) => {
  const [outcomeText, setOutcomeText] = useState<string | null>(engine.lastAnomalyOutcomeText);
  const event = engine.currentAnomalyEvent;

  if (!event) return null;

  const handlePickChoice = (choiceId: string) => {
    if (outcomeText) return;
    const res = engine.resolveAnomalyChoice(choiceId);
    setOutcomeText(res);
  };

  return (
    <div
      role="dialog"
      aria-label="Evento Anomalia Settoriale"
      className="fixed inset-0 z-50 bg-[#07080b]/96 flex items-center justify-center sm:p-4"
    >
      <div
        className="w-full h-full sm:h-auto sm:max-h-[90dvh] max-w-md bg-[#0c0e13] sm:border sm:rounded-2xl flex flex-col overflow-hidden"
        style={{ borderColor: `${event.color}66` }}
      >
        {/* Fixed Header */}
        <div className="shrink-0 bg-[#0c0e13] border-b border-[#222630] px-4 py-3.5">
          <div
            className="text-[11px] font-mono font-bold uppercase tracking-wider"
            style={{ color: event.color }}
          >
            {event.subtitle}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-100 uppercase tracking-wider mt-0.5">
            {event.title}
          </h2>
        </div>

        {/* Single Scrollable Body */}
        <div
          data-testid="sector-event-scroll-body"
          className="flex-1 min-h-0 modal-scroll p-4 space-y-3"
        >
          <div className="rounded-xl bg-[#13161e] border border-[#242834] p-3.5">
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {event.description}
            </p>
          </div>

          {!outcomeText ? (
            <div className="space-y-2.5">
              <div className="text-xs font-mono text-zinc-400 uppercase">
                Scegli un protocollo d&apos;intervento:
              </div>
              {event.choices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => handlePickChoice(choice.id)}
                  className="w-full text-left rounded-xl bg-[#13161e] border p-3.5 transition cursor-pointer active:scale-[0.99] space-y-1 hover:bg-[#191d27]"
                  style={{ borderColor: `${choice.color}66` }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-zinc-100">{choice.label}</span>
                    <span
                      className="text-xs font-mono font-bold"
                      style={{ color: choice.color }}
                    >
                      ATTIVA →
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 font-mono">{choice.effectText}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-[#13161e] border border-[#7fa68e]/60 p-4 space-y-2">
              <div className="text-xs font-mono font-bold text-[#7fa68e] uppercase">
                ★ Esito Anomalia Registrato
              </div>
              <p className="text-sm font-bold text-zinc-100 leading-relaxed">{outcomeText}</p>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        {outcomeText && (
          <div className="shrink-0 bg-[#0c0e13] border-t border-[#222630] p-3.5">
            <button
              type="button"
              data-testid="continue-from-event-btn"
              onClick={() => engine.continueFromSectorEvent()}
              className="w-full min-h-[48px] rounded-xl bg-zinc-200 text-zinc-950 font-bold text-sm uppercase tracking-wider active:scale-[0.99] cursor-pointer"
            >
              ENTRA NEL SETTORE {engine.pendingNextSector} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
