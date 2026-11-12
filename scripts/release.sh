#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

version="$(grep "versionName" android/app/build.gradle | head -n1 | sed -E "s/.*['\"]([^'\"]+)['\"].*/\1/")"
tag="v${version}"
title="CuboClast v${version} — Campagna Storia 25 Settori, 5 Boss, Fix Mobile Responsive & APK Android"
apk="downloads/cuboclast-${version}-debug.apk"
sha="${apk}.sha256"

echo "=== Esecuzione build e verifica APK ==="
./scripts/build-apk.sh

if [ ! -f "$apk" ]; then
    echo "Errore: APK non trovato in $apk"
    exit 1
fi

# Aggiorna il checksum in downloads/index.html
sha_val="$(awk '{print $1}' "$sha")"
sed -i -E "s/SHA256: .*/SHA256: ${sha_val}/" downloads/index.html

echo "=== Commit e push su GitHub ==="
git add -A
if ! git diff --cached --quiet; then
    git commit -m "feat: release ${tag} - Campagna Storia 25 Settori, 5 Boss, Fix Mobile Responsive & APK Android"
fi
git push -u origin main

echo "=== Creazione Release GitHub ${tag} ==="
if gh release view "$tag" >/dev/null 2>&1; then
    echo "La release $tag esiste già. Aggiornamento asset..."
    gh release upload "$tag" "$apk" "$sha" --clobber
else
    gh release create "$tag" "$apk" "$sha" \
        --title "$title" \
        --notes-file - <<EOF
# CuboClast ${tag} — Campagna Storia 25 Settori & Mobile Responsive Android APK

Questa release introduce la **Campagna Storia Estesa (25 Settori con 5 Boss unici)**, l'ottimizzazione completa del layout per smartphone senza schermate che escono fuori dal display e la pulizia del campo visivo centrale rimuovendo i chip delle sinergie in favore di una barra vita Boss elegante.

### 🌟 Novità Principali (${tag})
- 🗺️ **Nuova Modalità Storia Estesa**:
  - **5 Capitoli tematici per un totale di 25 Settori**.
  - **5 Boss Unici** con scudi balistici, sciami di satelliti orbitanti e fasi enrage dinamiche:
    - *Settore 5*: **The Monolith** (Cap. 1 - Periferia Cyber-Neon)
    - *Settore 10*: **Omega Tesseract** (Cap. 2 - Cintura al Plasma)
    - *Settore 15*: **Void Leviathan** (Cap. 3 - Forgia del Vuoto Cinetico)
    - *Settore 20*: **Chrono Weaver** (Cap. 4 - Singolarità Oscura)
    - *Settore 25*: **Primordial Architect** (Cap. 5 - Orizzonte Primordiale, Boss Finale)
  - Ricompensa di **+500 Frammenti Quantici** e sblocco dell'Abisso Infinito Endless (Settore 26+).
- 🎮 **Selettore Modalità di Gioco**:
  - **Campagna Storia** (25 Settori completi) o **Modalità Arcade** (10 Settori rapidi).
- 📱 **Adattamento Mobile Responsive al 100%**:
  - Correzione dei problemi di layout dove le schermate uscivano dallo schermo.
  - Viewport bloccato con \`100dvh\` e classe touch dedicata (\`.touch-scroll\`) con \`overscroll-behavior: contain\`.
  - Tutte le modali (Selezione Archetipo, Draft, Archivio Shop, Codex, Game Over, Vittoria, Guida) sono perfettamente centrate e scrollabili su qualsiasi schermo.
- 🎯 **HUD Pulito al Centro**:
  - Rimossa la visibilità delle sinergie dal centro dello schermo per non ostruire la mira e i rimbalzi delle sfere.
  - Indicatore sinergie compatto con badge energetico (\`⚡\`) sul pulsante delle Reliquie.
  - Nuova **Barra Salute Boss dinamica** con nome, fase e percentuale di vita.
- ⚡ **100% Android Nativo & Offline**:
  - Pacchetto APK Standalone ultra-leggero (~880 KB), caricamento locale istantaneo via WebViewAssetLoader, zero permessi invasivi.

### 📲 Download Diretto APK Android
- [cuboclast-${version}-debug.apk](https://github.com/sabotino/cuboclast/releases/download/${tag}/cuboclast-${version}-debug.apk)
EOF
fi

echo "=== Release GitHub ${tag} creata con successo! ==="
