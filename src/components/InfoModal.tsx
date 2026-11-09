import React from 'react';

interface InfoModalProps {
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
  return (
    <div
      role="dialog"
      aria-label="Guida di Gioco"
      className="fixed inset-0 z-50 bg-[#080b12]/96 flex items-center justify-center sm:p-4"
    >
      <div className="w-full h-full sm:h-auto sm:max-h-[90dvh] max-w-lg bg-[#090d16] sm:border-2 border-[#00e5ff] sm:rounded-2xl flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="shrink-0 bg-[#090d16] border-b border-[#1e2e48] px-4 py-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#00e5ff] uppercase tracking-wider">
            GUIDA DI GIOCO
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[38px] px-3 rounded-lg bg-[#141d2d] border border-[#1e2e48] text-white font-bold text-xs uppercase cursor-pointer active:scale-95"
          >
            ✕ CHIUDI
          </button>
        </div>

        {/* Single Scrollable Body (Zero Nested Scroll Containers!) */}
        <div className="flex-1 min-h-0 modal-scroll p-4 space-y-3 text-xs text-slate-200 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-[#141d2d] border-2 border-[#00e5ff] space-y-1">
            <h4 className="font-bold text-[#00e5ff] uppercase">1. PUNTAMENTO & FEVER</h4>
            <p>
              Trascina il dito sullo schermo per orientare il raggio laser e rilascia per lanciare
              la sfera. Distruggi tutti i <strong>Cubi Core Dorati ★</strong> per attivare la{' '}
              <strong>CuboClast Fever</strong> e purificare il settore.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141d2d] border-2 border-[#00ff88] space-y-1">
            <h4 className="font-bold text-[#00ff88] uppercase">2. CESTELLO & RIMBORSO</h4>
            <p>
              Cattura le sfere nel cestello magnetico sul fondo per ricevere subito{' '}
              <strong>+1 Sfera</strong>. Se un tiro colpisce 0 o 1 solo cubo, ricevi un rimborso
              automatico di grazia.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141d2d] border-2 border-[#ffe600] space-y-1.5">
            <h4 className="font-bold text-[#ffe600] uppercase">3. CODICE COLORI CUBI</h4>
            <ul className="space-y-1 font-mono text-[11px]">
              <li>
                <span className="text-[#ffe600] font-bold">[GIALLO ★]</span> Core obiettivo del
                settore o cubo Cinetico.
              </li>
              <li>
                <span className="text-[#00e5ff] font-bold">[CIANO]</span> Cubo geometrico standard.
              </li>
              <li>
                <span className="text-[#ff6b00] font-bold">[ARANCIO]</span> Cubo Esplosivo ad area.
              </li>
              <li>
                <span className="text-[#a855f7] font-bold">[VIOLA]</span> Cubo Splitter (genera
                mini-sfere).
              </li>
              <li>
                <span className="text-[#00ff88] font-bold">[VERDE]</span> Cubo Scudo protettivo.
              </li>
              <li>
                <span className="text-[#3b82f6] font-bold">[BLU]</span> Cubo Corazzato ad alti HP.
              </li>
            </ul>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="shrink-0 bg-[#090d16] border-t border-[#1e2e48] p-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[46px] rounded-xl bg-[#00e5ff] text-[#080b12] font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-[0.99]"
          >
            HO CAPITO, GIOCA!
          </button>
        </div>
      </div>
    </div>
  );
};
