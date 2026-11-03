import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Download,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  X,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface InstallModalProps {
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);

  const sharedUrl = window.location.origin;
  const pwaBuilderUrl = `https://www.pwabuilder.com?url=${encodeURIComponent(sharedUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sharedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeInstall = async () => {
    await install();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#04060a]/95 backdrop-blur-lg overflow-hidden">
      <div className="w-full max-w-xl bg-[#090d16] border-2 border-[#00e5ff] rounded-3xl p-4 sm:p-6 shadow-[0_0_60px_rgba(0,229,255,0.25)] text-left relative flex flex-col gap-3 sm:gap-4 max-h-[92dvh] overflow-y-auto touch-scroll overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1e2e48] pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
                Pubblicazione & APK <span className="text-cyan-400">Android</span>
              </h2>
              <p className="text-xs text-slate-400">
                Installa CuboClast direttamente su smartphone come App nativa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#141d2d] hover:bg-[#1e2e48] text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert */}
        {isInstalled ? (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center gap-2.5 text-xs text-emerald-300 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>L'applicazione è già installata e funzionante a schermo intero sul tuo dispositivo!</span>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-2.5 text-xs text-cyan-300 leading-relaxed">
            <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>
              L'app è pubblicata online e configurata come <strong>PWA / WebAPK Nativa</strong> con
              icona, modalità a schermo intero (senza barra browser) e funzionamento 100% offline.
            </span>
          </div>
        )}

        {/* Option 1: One-Click WebAPK Install on Android */}
        <div className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e2e48] flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Opzione 1: Installazione Diretta (WebAPK Android)
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
              Consigliato
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Android scarica e crea automaticamente il pacchetto APK nativo (WebAPK) sulla schermata home:
            si avvia come vera app standalone senza bordi, con feedback aptico e audio a 60/120 FPS.
          </p>

          {isInstallable ? (
            <button
              onClick={handleNativeInstall}
              className="mt-1 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Download className="w-4 h-4 stroke-[3]" />
              Installa Ora su questo Dispositivo
            </button>
          ) : (
            <div className="bg-[#141d2d] rounded-xl p-3 text-xs text-slate-300 leading-relaxed font-mono">
              <p className="text-cyan-400 font-bold mb-1">Per installare dal browser del tuo telefono:</p>
              <p>• Su <strong>Google Chrome / Edge (Android)</strong>: tocca il menu con i 3 puntini in alto a destra <strong>(⋮)</strong> e seleziona <strong>"Installa app"</strong> o <strong>"Aggiungi a schermata Home"</strong>.</p>
              <p className="mt-1">• Su <strong>Safari (iPhone/iPad)</strong>: tocca il pulsante Condividi <strong>(⎋)</strong> e seleziona <strong>"Aggiungi alla schermata Home"</strong>.</p>
            </div>
          )}
        </div>

        {/* Option 2: PWABuilder / Standalone APK Package Generation */}
        <div className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e2e48] flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Opzione 2: Generatore File APK Standalone (PWABuilder / Google Play)
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
              File .APK
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Se ti serve il file binario <strong>.apk</strong> o <strong>.aab</strong> firmato (per il sideloading offline manuale o per pubblicare su Google Play Store), puoi generarlo gratis in 1 clic con lo strumento open-source <strong>PWABuilder</strong> di Microsoft:
          </p>

          <a
            href={pwaBuilderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-xl bg-[#141d2d] hover:bg-[#1e2e48] border border-purple-500/50 text-purple-300 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>Genera Pacchetto APK su PWABuilder</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Option 3: Direct Download Release APK & ZIP from GitHub */}
        <div className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e2e48] flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Opzione 3: Scarica APK v0.5.1 da GitHub Releases
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
              Release v0.5.1
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Scarica direttamente il pacchetto nativo <strong>cuboclast-0.5.1-debug.apk</strong> dalla pagina ufficiale <strong>GitHub Releases</strong>.
          </p>

          <a
            href="https://github.com/frozeduck/cuboclast/releases/download/v0.5.1/cuboclast-0.5.1-debug.apk"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/50 text-amber-300 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>Scarica cuboclast-0.5.1-debug.apk (GitHub Release)</span>
          </a>
        </div>

        {/* Shareable Link Box */}
        <div className="p-3.5 rounded-2xl bg-[#0c1322] border border-[#1e2e48] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="overflow-hidden">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
              Link Pubblico dell'Applicazione:
            </span>
            <span className="text-xs font-mono text-cyan-300 truncate block mt-0.5">
              {sharedUrl}
            </span>
          </div>

          <button
            onClick={handleCopyLink}
            className="px-4 py-2 rounded-xl bg-[#141d2d] hover:bg-[#1e2e48] border border-cyan-500/40 text-cyan-300 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiato!' : 'Copia Link'}</span>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#1e2e48] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
