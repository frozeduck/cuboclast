import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallModalProps {
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);

  const sharedUrl = window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sharedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-label="Scarica APK Android"
      className="fixed inset-0 z-50 bg-[#07080b]/96 flex items-center justify-center sm:p-4"
    >
      <div className="w-full h-full sm:h-auto sm:max-h-[90dvh] max-w-lg bg-[#0c0e13] sm:border border-[#262a34] sm:rounded-2xl flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="shrink-0 bg-[#0c0e13] border-b border-[#222630] px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-100 uppercase tracking-wider leading-none">
              APK ANDROID & INSTALLAZIONE
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Gioca a schermo intero offline su smartphone
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[38px] px-3 rounded-lg bg-[#14171f] border border-[#282d3a] text-zinc-200 font-bold text-xs uppercase cursor-pointer active:scale-95"
          >
            ✕ CHIUDI
          </button>
        </div>

        {/* Single Scrollable Body */}
        <div className="flex-1 min-h-0 modal-scroll p-4 space-y-3 text-xs text-zinc-300">
          {/* Direct GitHub Release APK v0.15.0 */}
          <div className="p-4 rounded-xl bg-[#13161e] border border-[#2d323e] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-zinc-100 uppercase">
                1. SCARICA FILE APK NATIVO
              </span>
              <span className="font-mono text-[#7fa68e] font-bold">[RELEASE v0.15.0]</span>
            </div>
            <p className="leading-relaxed text-zinc-400">
              Scarica direttamente il file <strong>cuboclast-0.15.0-debug.apk</strong> con bundle{' '}
              <code>assets/www/</code> aggiornato, firma <strong>APK Signature Scheme v2/v3</strong>{' '}
              e supporto per l&apos;aggiornamento diretto sopra la versione precedente:
            </p>
            <div className="space-y-2">
              <a
                href="https://github.com/frozeduck/cuboclast/releases/download/v0.15.0/cuboclast-0.15.0-debug.apk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[46px] rounded-xl bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center cursor-pointer active:scale-[0.99]"
              >
                SCARICA APK v0.15.0 DIRETTO (GITHUB) →
              </a>
              <a
                href="https://github.com/frozeduck/cuboclast/releases/tag/v0.15.0"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[40px] rounded-xl bg-[#0c0e13] border border-[#2d323e] text-zinc-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center cursor-pointer active:scale-[0.99]"
              >
                PAGINA RELEASE v0.15.0 SU GITHUB →
              </a>
            </div>
          </div>

          {/* Direct WebAPK / PWA Install */}
          <div className="p-4 rounded-xl bg-[#13161e] border border-[#282d3a] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-zinc-100 uppercase">
                2. INSTALLA COME WEB-APP
              </span>
              <span className="font-mono text-zinc-400 font-bold">[OFFLINE 60FPS]</span>
            </div>
            {isInstalled ? (
              <p className="text-[#7fa68e] font-bold">
                Applicazione già installata sul tuo dispositivo.
              </p>
            ) : isInstallable ? (
              <button
                type="button"
                onClick={() => install()}
                className="w-full min-h-[44px] rounded-xl bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-[0.99]"
              >
                INSTALLA ORA SU QUESTO TELEFONO
              </button>
            ) : (
              <p className="text-zinc-400 leading-relaxed">
                Dal browser Chrome/Safari del telefono: apri il menu <strong>(⋮)</strong> e tocca{' '}
                <strong>&quot;Installa app&quot;</strong> o{' '}
                <strong>&quot;Aggiungi a schermata Home&quot;</strong>.
              </p>
            )}
          </div>

          {/* Link Copy */}
          <div className="p-3.5 rounded-xl bg-[#13161e] border border-[#242834] flex items-center justify-between gap-2">
            <span className="font-mono text-zinc-400 truncate">{sharedUrl}</span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="min-h-[38px] px-3 rounded-lg bg-[#0c0e13] border border-[#2d323e] text-zinc-200 font-bold text-xs uppercase shrink-0 cursor-pointer"
            >
              {copied ? 'COPIATO!' : 'COPIA'}
            </button>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="shrink-0 bg-[#0c0e13] border-t border-[#222630] p-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[46px] rounded-xl bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-[0.99]"
          >
            CHIUDI
          </button>
        </div>
      </div>
    </div>
  );
};
