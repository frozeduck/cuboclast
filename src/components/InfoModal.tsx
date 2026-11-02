import React from 'react';
import { X, Target, Award, Shield, Zap, Sparkles, HelpCircle } from 'lucide-react';

interface InfoModalProps {
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 bg-[#04060a]/92 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="w-full max-w-lg my-auto bg-[#090d16] border-2 border-cyan-400 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(0,229,255,0.25)] text-left relative flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1e2e48] pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h3 className="text-xl font-black text-white uppercase tracking-wider">
              Guida di Gioco
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#141d2d] hover:bg-[#1e2e48] text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1 text-xs text-slate-300 leading-relaxed">
          {/* Rules */}
          <div className="p-3.5 rounded-2xl bg-[#0f172a] border border-[#1e2e48] flex flex-col gap-1.5">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" /> Come si Gioca
            </h4>
            <p>
              Tieni premuto e trascina con il cursore o con il tocco per calibrare l'angolo del cannone
              lungo la linea di traiettoria laser. Rilascia per scagliare la sfera quantica!
            </p>
            <p>
              L'obiettivo principale in ogni settore è distruggere tutti i <strong>Cubi Core Dorati ★</strong>.
              Una volta eliminati, si scatena l'irresistibile <strong>CuboClast FEVER</strong> che
              polverizza tutti i restanti cubi moltiplicando i punti e le Schegge Quantiche!
            </p>
          </div>

          {/* Basket & Refunds */}
          <div className="p-3.5 rounded-2xl bg-[#0f172a] border border-[#1e2e48] flex flex-col gap-1.5">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" /> Cestello & Rimborso di Grazia
            </h4>
            <p>
              <strong>Cestello Mobile:</strong> Cattura le sfere in caduta nel cestello magnetico sul
              fondo per recuperarle istantaneamente (+1 Sfera) e guadagnare ricchi punti bonus.
            </p>
            <p>
              <strong>Mercy Refund:</strong> Se un tiro è sfortunato e colpisce 1 o 0 cubi senza
              cattura, ti viene rimborsata 1 sfera per non penalizzare i tiri mancati!
            </p>
          </div>

          {/* Cube Types */}
          <div className="p-3.5 rounded-2xl bg-[#0f172a] border border-[#1e2e48] flex flex-col gap-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Tipi di Cubi
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-xl bg-[#141d2d] border border-cyan-500/30">
                <span className="font-bold text-cyan-300">Normale & Core ★</span>
                <p className="text-slate-400 mt-0.5">I Core dorati devono essere distrutti per superare il settore.</p>
              </div>
              <div className="p-2 rounded-xl bg-[#141d2d] border border-blue-500/30">
                <span className="font-bold text-blue-300">Armor (Corazzato)</span>
                <p className="text-slate-400 mt-0.5">HP elevati, richiede impatti ripetuti o danni inerziali.</p>
              </div>
              <div className="p-2 rounded-xl bg-[#141d2d] border border-orange-500/30">
                <span className="font-bold text-orange-300">Explosive (Bomba)</span>
                <p className="text-slate-400 mt-0.5">Detona distruggendo tutti i cubi nel raggio d'azione.</p>
              </div>
              <div className="p-2 rounded-xl bg-[#141d2d] border border-purple-500/30">
                <span className="font-bold text-purple-300">Splitter (Scissione)</span>
                <p className="text-slate-400 mt-0.5">All'impatto libera 2 o 3 mini-sfere autonome in gioco!</p>
              </div>
              <div className="p-2 rounded-xl bg-[#141d2d] border border-yellow-500/30">
                <span className="font-bold text-yellow-300">Kinetic (Cinetico)</span>
                <p className="text-slate-400 mt-0.5">Fornisce una poderosa spinta cinetica e bonus al danno.</p>
              </div>
              <div className="p-2 rounded-xl bg-[#141d2d] border border-emerald-500/30">
                <span className="font-bold text-emerald-300">Shield (Scudo Aura)</span>
                <p className="text-slate-400 mt-0.5">Genera un campo protettivo che dimezza i danni ai cubi vicini.</p>
              </div>
            </div>
          </div>

          {/* Bosses & Meta-Progression */}
          <div className="p-3.5 rounded-2xl bg-[#0f172a] border border-[#1e2e48] flex flex-col gap-1.5">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-pink-400" /> Boss Fight a 3 Fasi & Archivio Upgrade
            </h4>
            <p>
              Ogni 5 settori affronterai il <strong>Tesseract Boss</strong>: possiede satelliti orbitanti
              difensivi, rilascia onde repulsive EMP e scende in discesa frenetica nella fase enrage!
            </p>
            <p>
              Accumula le <strong>Schegge Quantiche ◆</strong> frantumando cubi e settori per sbloccare
              miglioramenti permanenti nell'Archivio Upgrade.
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-md shadow-cyan-500/20"
        >
          Ho Capito, Gioca!
        </button>
      </div>
    </div>
  );
};
