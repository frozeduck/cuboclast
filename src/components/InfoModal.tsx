import React from 'react';

interface InfoModalProps {
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
  return (
    <div
      role="dialog"
      aria-label="Guida di Gioco"
      className="fixed inset-0 z-50 bg-[#07080b]/96 flex items-center justify-center sm:p-4"
    >
      <div className="w-full h-full sm:h-auto sm:max-h-[90dvh] max-w-lg bg-[#0c0e13] sm:border border-[#262a34] sm:rounded-2xl flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="shrink-0 bg-[#0c0e13] border-b border-[#222630] px-4 py-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-100 uppercase tracking-wider">
            GUIDA DI GIOCO
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[38px] px-3 rounded-lg bg-[#14171f] border border-[#282d3a] text-zinc-200 font-bold text-xs uppercase cursor-pointer active:scale-95"
          >
            ✕ CHIUDI
          </button>
        </div>

        {/* Single Scrollable Body (Zero Nested Scroll Containers!) */}
        <div className="flex-1 min-h-0 modal-scroll p-4 space-y-3 text-xs text-zinc-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-[#13161e] border border-[#2a2f3d] space-y-1">
            <h4 className="font-bold text-zinc-100 uppercase">1. PUNTAMENTO PARABOLICO & FEVER</h4>
            <p>
              Trascina il dito sullo schermo per orientare la traiettoria balistica reale e rilascia
              per lanciare la sfera. Distruggi tutti i <strong>Cubi Core ★</strong> per attivare la{' '}
              <strong>CuboClast Fever</strong> e purificare il settore.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#13161e] border border-[#2a2f3d] space-y-1">
            <h4 className="font-bold text-[#7fa68e] uppercase">2. CESTELLO & RIMBORSO</h4>
            <p>
              Cattura le sfere nel cestello magnetico sul fondo per ricevere subito{' '}
              <strong>+1 Sfera</strong>. Se un tiro colpisce 0 o 1 solo cubo, ricevi un rimborso
              automatico di grazia.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#13161e] border border-[#2a2f3d] space-y-1.5">
            <h4 className="font-bold text-[#d4b483] uppercase">
              3. SISTEMA IBRIDO: BLOCCHETTI DI CLASSE ◇ & BOSS
            </h4>
            <p className="text-zinc-300">
              In ogni settore compaiono <strong>3-5 Blocchetti Abilità di Classe (◇)</strong> del
              colore del tuo Nucleo attivo: colpirli o distruggerli scatena l&apos;abilità esclusiva
              della tua classe (es. Sciame di Mini-Sfere per <em>Swarm Matrix</em>, Tempesta di
              Fulmini per <em>Volt Overcharge</em>, Detonazione Solare per <em>Pyro Detonator</em>).
            </p>
            <ul className="space-y-1 font-mono text-[11px] pt-1">
              <li>
                <span className="text-[#d4b483] font-bold">[SABBIA DORATA ★]</span> Core obiettivo
                del settore o cubo Cinetico.
              </li>
              <li>
                <span className="text-zinc-100 font-bold">[DIAMANTE DI CLASSE ◇]</span> Attiva il
                potere del tuo Nucleo al tocco e alla rottura.
              </li>
              <li>
                <span className="text-[#c87d65] font-bold">[BOSS 1 · MONOLITH]</span> Sblocca Cubi
                Esplosivi nel mondo e i Nuclei Volt &amp; Pyro.
              </li>
              <li>
                <span className="text-[#9b95b8] font-bold">[BOSS 2 · TESSERACT]</span> Sblocca Cubi
                Splitter/Corazzati e i Nuclei Kinetic &amp; Swarm.
              </li>
              <li>
                <span className="text-[#7fa68e] font-bold">[BOSS 3 · LEVIATHAN]</span> Sblocca Cubi
                Scudo e i Nuclei Crystal &amp; Chrono.
              </li>
            </ul>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="shrink-0 bg-[#0c0e13] border-t border-[#222630] p-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[46px] rounded-xl bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-[0.99]"
          >
            HO CAPITO, GIOCA!
          </button>
        </div>
      </div>
    </div>
  );
};
