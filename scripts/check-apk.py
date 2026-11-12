import json
import pathlib
import zipfile

project = pathlib.Path(__file__).resolve().parent.parent
pkg_version = json.loads((project / "package.json").read_text())["version"]

latest = project / "public" / "downloads" / f"cuboclast-{pkg_version}-debug.apk"
if latest.exists():
    apk = latest
else:
    apks = sorted(project.glob("public/downloads/cuboclast-*-debug.apk"))
    assert apks, "Nessun APK trovato nella cartella public/downloads/"
    apk = apks[-1]

print(f"Verifica APK in corso: {apk.name} ({apk.stat().st_size / 1024 / 1024:.2f} MB) per versione {pkg_version}")

with zipfile.ZipFile(apk) as archive:
    assert archive.testzip() is None, "Archivio APK danneggiato o corrotto"
    names = archive.namelist()
    assert "classes.dex" in names, "Codice nativo Android (classes.dex) mancante"
    assert "assets/www/index.html" in names, "Bundle dell'applicazione web (assets/www/index.html) mancante"
    assert not any(n.startswith("assets/public/") for n in names), "Cartella errata assets/public/ trovata nell'APK!"

    index_html = archive.read("assets/www/index.html").decode("utf-8")
    assert f"CURRENT_VER = '{pkg_version}'" in index_html, (
        f"ERRORE CRITICO: assets/www/index.html non contiene CURRENT_VER = '{pkg_version}'!"
    )

    js_files = [n for n in names if n.startswith("assets/www/assets/index-") and n.endswith(".js")]
    assert js_files, "Nessun bundle JS trovato in assets/www/assets/"
    js_content = archive.read(js_files[0]).decode("utf-8")
    assert f"v{pkg_version}" in js_content, (
        f"ERRORE CRITICO: Il bundle JS {js_files[0]} non contiene 'v{pkg_version}'!"
    )

    manifest = archive.read("AndroidManifest.xml")
    permission = "android.permission.INTERNET"
    assert (
        permission.encode() not in manifest
        and permission.encode("utf-16-le") not in manifest
    ), "Permesso Internet inatteso: il gioco deve essere 100% offline"

print(f"✓ APK OK: assets/www/ aggiornato a v{pkg_version}, classes.dex presente, 100% offline.")
