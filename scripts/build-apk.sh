#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "=== 1. Esecuzione Test Unitari del Modello di Gioco ==="
mkdir -p /tmp/cuboclast-tests
javac -d /tmp/cuboclast-tests \
    android/app/src/main/java/eu/sabotino/cuboclast/Game.java \
    tests/GameTest.java
java -ea -cp /tmp/cuboclast-tests eu.sabotino.cuboclast.GameTest

echo "=== 2. Verifica Keystore di Debug ==="
if [ ! -f android/app/debug.keystore ]; then
    keytool -genkeypair -keystore android/app/debug.keystore \
        -storepass android -keypass android -alias androiddebugkey \
        -keyalg RSA -keysize 2048 -validity 10000 \
        -dname "CN=CuboClast Debug,O=Sabotino,C=IT"
fi

echo "=== 3. Generazione Icone Neon Minimaliste ==="
python3 scripts/generate_icons.py

echo "=== 4. Compilazione APK Nativo Android con Gradle ==="
mkdir -p /tmp/.android
export ANDROID_USER_HOME=/tmp/.android
android/gradlew -p android --offline --no-daemon assembleDebug

version="$(grep "versionName" android/app/build.gradle | head -n1 | sed -E "s/.*['\"]([^'\"]+)['\"].*/\1/")"
if [ -z "$version" ]; then
    version="0.1.0"
fi

echo "Versione target: $version"
mkdir -p downloads
apk_target="downloads/cuboclast-${version}-debug.apk"
cp android/app/build/outputs/apk/debug/app-debug.apk "$apk_target"
ln -sf "cuboclast-${version}-debug.apk" downloads/cuboclast-latest-debug.apk

echo "=== 5. Verifica Integrita APK ==="
python3 scripts/check-apk.py

echo "=== 6. Generazione Checksum SHA256 ==="
sha256sum "$apk_target" > "${apk_target}.sha256"
cat "${apk_target}.sha256"

echo "=== Build APK completata con successo! ==="
