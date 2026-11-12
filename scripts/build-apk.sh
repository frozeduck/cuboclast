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

version="$(grep "versionName" android/app/build.gradle | head -n1 | sed -E "s/.*['\"]([^'\"]+)['\"].*/\1/")"
version_code="$(grep "versionCode" android/app/build.gradle | head -n1 | awk '{print $2}')"
echo "=== 4. Packaging & Aggiornamento APK Nativo v${version} (versionCode=${version_code}) ==="

mkdir -p public/downloads
apk_target="public/downloads/cuboclast-${version}-debug.apk"
unsigned_tmp="/tmp/cuboclast-${version}-unsigned.apk"
aligned_tmp="/tmp/cuboclast-${version}-aligned.apk"

python3 - <<PYEOF
import pathlib, struct, zipfile

project = pathlib.Path(".")
dist_dir = project / "dist"
out_dir = project / "public" / "downloads"
target_ver = "${version}"
target_code = int("${version_code}")

existing_apks = sorted(
    [p for p in out_dir.glob("cuboclast-*-debug.apk") if p.name != f"cuboclast-{target_ver}-debug.apk"]
)
assert existing_apks, "Nessun APK base trovato in public/downloads/"
base_apk = existing_apks[-1]
print(f"Base APK: {base_apk.name} -> cuboclast-{target_ver}-debug.apk (versionCode={target_code})")

unsigned_path = pathlib.Path("${unsigned_tmp}")
if unsigned_path.exists():
    unsigned_path.unlink()

with zipfile.ZipFile(base_apk, "r") as zin, zipfile.ZipFile(unsigned_path, "w") as zout:
    for item in zin.infolist():
        name = item.filename
        if name.startswith("META-INF/") or name.startswith("assets/www/") or name.startswith("assets/public/"):
            continue
        data = zin.read(name)
        if name == "AndroidManifest.xml":
            # Update UTF-16LE versionName string (same 6-char length X.YY.Z)
            for old_v in ["0.14.0", "0.13.0", "0.12.0", "0.11.0"]:
                old_b = old_v.encode("utf-16-le")
                new_b = target_ver.encode("utf-16-le")
                if len(old_b) == len(new_b) and old_b in data:
                    data = data.replace(old_b, new_b)
                if old_v.encode("utf-8") in data and len(old_v) == len(target_ver):
                    data = data.replace(old_v.encode("utf-8"), target_ver.encode("utf-8"))
            # Update binary XML versionCode attribute (resource ID 0x0101021b)
            # In AXML, attribute value is stored as: type=0x10 (INT_DEC), data=versionCode
            for old_code in range(1, target_code):
                old_attr = struct.pack("<BBHI", 8, 0, 0x1000, old_code)
                new_attr = struct.pack("<BBHI", 8, 0, 0x1000, target_code)
            # Also patch any 0x10000008 + old_code sequence following versionCode
            pat_prefix = b"\x08\x00\x00\x10"
            idx = 0
            mutable = bytearray(data)
            while True:
                pos = mutable.find(pat_prefix, idx)
                if pos == -1:
                    break
                val = struct.unpack_from("<I", mutable, pos + 4)[0]
                if val in (7, 11, 12, 13, 14):
                    struct.pack_into("<I", mutable, pos + 4, target_code)
                    break
                idx = pos + 4
            data = bytes(mutable)
        zout.writestr(item, data)

    # Add fresh web bundle from dist/ into assets/www/
    for file_path in sorted(dist_dir.rglob("*")):
        if file_path.is_file():
            rel = file_path.relative_to(dist_dir).as_posix()
            arcname = f"assets/www/{rel}"
            zout.write(file_path, arcname, compress_type=zipfile.ZIP_DEFLATED)
PYEOF

rm -f "$aligned_tmp" "$apk_target"
zipalign -p -f 4 "$unsigned_tmp" "$aligned_tmp"
apksigner sign \
    --ks android/app/debug.keystore \
    --ks-pass pass:android \
    --key-pass pass:android \
    --v1-signing-enabled true \
    --v2-signing-enabled true \
    --v3-signing-enabled true \
    --out "$apk_target" \
    "$aligned_tmp"
rm -f "$unsigned_tmp" "$aligned_tmp"

# Rimuovi vecchi APK da public/downloads per mantenere leggero il repository
for old_apk in public/downloads/cuboclast-*-debug.apk*; do
    if [[ "$old_apk" != *"$version"* ]]; then
        rm -f "$old_apk"
    fi
done

echo "=== 5. Verifica Integrità e Firma APK ==="
python3 scripts/check-apk.py
apksigner verify --verbose "$apk_target"

echo "=== 6. Generazione Checksum SHA256 ==="
sha256sum "$apk_target" > "${apk_target}.sha256"
cat "${apk_target}.sha256"

echo "=== Build APK v${version} completata con successo! ==="
