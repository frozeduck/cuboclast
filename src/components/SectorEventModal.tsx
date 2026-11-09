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
      className="fixed inset-0 z-50 bg-[#080b12]/96 flex items-center justify-center sm:p-4"
    >
      <div
        className="w-full h-full sm:h-auto sm:max-h-[90dvh] max-w-md bg-[#090d16] sm:border-2 sm:rounded-2xl flex flex-col overflow-hidden"
        style={{ borderColor: event.color }}
      >
        {/* Fixed Header */}
        <div className="shrink-0 bg-[#090d16] border-b border-[#1e2e48] px-4 py-3.5">
          <div
            className="text-xs font-mono font-bold uppercase tracking-wider"
            style={{ color: event.color }}
          >
            {event.subtitle}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white uppercase tracking-wider mt-0.5">
            {event.title}
          </h2>
        </div>

        {/* Single Scrollable Body */}
        <div
          data-testid="sector-event-scroll-body"
          className="flex-1 min-h-0 modal-scroll p-4 space-y-3"
        >
          <div className="rounded-xl bg-[#141d2d] border border-[#1e2e48] p-3.5">
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {event.description}
            </p>
          </div>

          {!outcomeText ? (
            <div className="space-y-2.5">
              <div className="text-xs font-mono text-slate-400 uppercase">
                Scegli un protocollo d&apos;intervento:
              </div>
              {event.choices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => handlePickChoice(choice.id)}
                  className="w-full text-left rounded-xl bg-[#141d2d] border-2 p-3.5 transition cursor-pointer active:scale-[0.99] space-y-1"
                  style={{ borderColor: choice.color }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-white">{choice.label}</span>
                    <span
                      className="text-xs font-mono font-bold"
                      style={{ color: choice.color }}
                    >
                      ATTIVA →
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-mono">{choice.effectText}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-[#141d2d] border-2 border-[#00ff88] p-4 space-y-2">
              <div className="text-xs font-mono font-bold text-[#00ff88] uppercase">
                ★ Esito Anomalia Registrato
              </div>
              <p className="text-sm font-bold text-white leading-relaxed">{outcomeText}</p>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        {outcomeText && (
          <div className="shrink-0 bg-[#090d16] border-t border-[#1e2e48] p-3.5">
            <button
              type="button"
              data-testid="continue-from-event-btn"
              onClick={() => engine.continueFromSectorEvent()}
              className="w-full min-h-[48px] rounded-xl bg-[#00ff88] text-[#080b12] font-bold text-sm uppercase tracking-wider active:scale-[0.99] cursor-pointer"
            >
              ENTRA NEL SETTORE {engine.pendingNextSector} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
