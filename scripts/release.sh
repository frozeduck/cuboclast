#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

version="$(grep "versionName" android/app/build.gradle | head -n1 | sed -E "s/.*['\"]([^'\"]+)['\"].*/\1/")"
tag="v${version}"
title="CuboClast v${version} — Minimalist Roguelike Peggle & Cube Breaker"
apk="downloads/cuboclast-${version}-debug.apk"
sha="${apk}.sha256"

echo "=== Esecuzione build e verifica APK ==="
./scripts/build-apk.sh

if [ ! -f "$apk" ]; then
    echo "Errore: APK non trovato in $apk"
    exit 1
fi

echo "=== Commit e push su GitHub ==="
git add -A
if ! git diff --cached --quiet; then
    git commit -m "feat: release ${tag} - Minimalist Roguelike Peggle APK"
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
# CuboClast ${tag} — Minimalist Roguelike Peggle & Cube Breaker

Gioco arcade / roguelike nativo per **Android**, progettato per essere giocato in **orientamento verticale (portrait)** su smartphone con una sola mano. Combina la fisica dei rimbalzi alla *Peggle* con la rottura progressiva dei cubetti e la sinergia strategica dei potenziamenti *Roguelike*.

### Caratteristiche Principali (v${version})
- **100% Android Nativo**: Realizzato in Java con Canvas + SurfaceView a 60/120 FPS fluidi, zero framework web (Cordova/Capacitor/Electron), consumi minimi e reattività immediata.
- **Fisica Pinball & Cubetti**: Traiettoria di mira predittiva con rimbalzi elastici su cubetti geometrici a HP crescenti (Standard, Corazzati, Esplosivi, Splitter, Cinetici, Schermati, Boss).
- **Audio Procedurale Pentatonico**: Sintesi audio dinamica su scala pentatonica (C, D, E, G, A, C', D'...) che sale di frequenza al crescere delle combo di rimbalzo per un dopamine hit inebriante.
- **Costruzione Build Roguelike (13+ Reliquie)**:
  - *Kinetic Surge*: +1 danno cumulativo per ogni rimbalzo nel singolo tiro.
  - *Fulmine a Catena*: Scariche elettriche che colpiscono i cubi adiacenti.
  - *Reattore Multiball*: 25% di probabilità di duplicare la sfera all'infrangersi di un cubo.
  - *Schegge Taglienti*: I cubi distrutti proiettano schegge geometriche perforanti.
  - *Sovraccarico Critico*: 25% critico (danno triplo e onda d'urto).
  - *Cestello Magnetico*: Cestello inferiore allargato con attrazione gravitazionale.
  - *Rete di Sicurezza*: Scudo di fondo che respinge le sfere cadute.
- **10 Settori di Gioco + Boss**: Dal settore d'ingresso fino al Tesseract Finale con progressione di difficoltà esponenziale e modalità Loop Infinito.
- **100% Offline & Privacy**: Nessun tracciamento, nessun permesso internet, salvataggio locale istantaneo.

### Installazione
1. Scarica l'APK allegato \`cuboclast-${version}-debug.apk\` sul tuo dispositivo Android.
2. Apri il file e conferma l'installazione da fonti sconosciute.
3. Gioca in orientamento verticale con una mano!
EOF
fi

echo "=== Release GitHub ${tag} creata con successo! ==="
