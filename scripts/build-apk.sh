#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "=== 1. Compilazione Web App & Asset PWA (Vite + TypeScript) ==="
npm run build

echo "=== 2. Sincronizzazione Asset Web in Android APK ==="
mkdir -p android/app/src/main/assets/www
rm -rf android/app/src/main/assets/www/*
cp -r dist/* android/app/src/main/assets/www/

echo "=== 3. Verifica Keystore di Debug ==="
if [ ! -f android/app/debug.keystore ]; then
    keytool -genkeypair -keystore android/app/debug.keystore \
        -storepass android -keypass android -alias androiddebugkey \
        -keyalg RSA -keysize 2048 -validity 10000 \
        -dname "CN=CuboClast Debug,O=Sabotino,C=IT"
fi

echo "=== 4. Compilazione APK Nativo Android con Gradle ==="
mkdir -p /tmp/.android
export ANDROID_USER_HOME=/tmp/.android
android/gradlew -p android --no-daemon assembleDebug

version="$(grep "versionName" android/app/build.gradle | head -n1 | sed -E "s/.*['\"]([^'\"]+)['\"].*/\1/")"
if [ -z "$version" ]; then
    version="0.5.0"
fi

echo "Versione target: $version"
mkdir -p downloads
apk_target="downloads/cuboclast-${version}-debug.apk"
cp android/app/build/outputs/apk/debug/app-debug.apk "$apk_target"
ln -sf "cuboclast-${version}-debug.apk" downloads/cuboclast-latest-debug.apk

echo "=== 5. Verifica Integrità APK ==="
python3 scripts/check-apk.py

echo "=== 6. Generazione Checksum SHA256 ==="
sha256sum "$apk_target" > "${apk_target}.sha256"
cat "${apk_target}.sha256"

echo "=== Build APK completata con successo! ==="
