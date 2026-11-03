#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

version="$(grep "versionName" android/app/build.gradle | head -n1 | sed -E "s/.*['\"]([^'\"]+)['\"].*/\1/")"
tag="v${version}"
title="CuboClast v${version} — Google AI Studio Update & Standalone Android APK"
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
    git commit -m "feat: release ${tag} - Android APK & Google AI Studio Sync"
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
# CuboClast ${tag} — Roguelike Peggle & Cube Breaker Android APK

Aggiornamento sincronizzato con **Google AI Studio**: nuova espansione dei contenuti di gioco, 7 Archetipi Core, 5 Fusioni di Set Doppie, Codex Enciclopedico, audio procedurale avanzato e pacchetto APK nativo per **Android**.

### 🌟 Novità & Caratteristiche (${tag})
- **7 Archetipi Core**: Volt Overcharge, Pyro Detonator, Swarm Matrix, Kinetic Titan, Crystal Singularity, Quantum Singularity e Chrono Pulse.
- **5 Nuove Fusioni Doppie di Set**: Sovraccarico Plasma (Elettrico + Esplosivo), Scarica Magnetica (Elettrico + Cinetico), Sciame Detonante (Esplosivo + Multiball), Iper-Sciame Perforante (Multiball + Cinetico) e Superconduzione Criogenica (Elettrico + Cryo).
- **Codex & Compendio Enciclopedico**: Schermata dedicata per consultare tutti i cubi, reliquie, archetipi e fusioni sbloccate durante le spedizioni.
- **HUD & Modalità Ridisegnate**: Interfaccia ad alta leggibilità, animazioni fluida a 60/120 FPS, badge elementali fluorescenti e layout portrait per una sola mano.
- **Salvataggio Continuo v2**: Ripresa istantanea della sessione attiva (Settore, Score, Sfere, Reliquie serializzate).
- **100% Android Nativo & Offline**: Nessun tracciamento, zero permessi invasivi, esecuzione istantanea locale.

### 📲 Installazione
1. Scarica l'APK allegato \`cuboclast-${version}-debug.apk\` (o \`cuboclast-latest-debug.apk\`).
2. Conferma l'installazione su Android.
3. Gioca in orientamento verticale con una mano!
EOF
fi

echo "=== Release GitHub ${tag} creata con successo! ==="
