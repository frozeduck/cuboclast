import glob
import pathlib
import zipfile

project = pathlib.Path(__file__).resolve().parent.parent
apks = list(project.glob("downloads/cuboclast-*-debug.apk"))

assert apks, "Nessun APK trovato nella cartella downloads/"
apk = apks[0]

print(f"Verifica APK in corso: {apk.name} ({apk.stat().st_size / 1024 / 1024:.2f} MB)")

with zipfile.ZipFile(apk) as archive:
    assert archive.testzip() is None, "Archivio APK danneggiato o corrotto"
    names = archive.namelist()
    assert "classes.dex" in names, "Codice nativo Android (classes.dex) mancante"

    # Verifica totale assenza di file web
    for n in names:
        assert not n.startswith("assets/web"), f"Trovato asset web non consentito: {n}"
        assert not n.endswith(".html"), f"File HTML non consentito nell'APK: {n}"

    manifest = archive.read("AndroidManifest.xml")
    permission = "android.permission.INTERNET"
    assert (
        permission.encode() not in manifest
        and permission.encode("utf-16-le") not in manifest
    ), "Permesso Internet inatteso: il gioco deve essere 100% offline"

print("✓ APK OK: Integrità verificata, codice nativo classes.dex presente, 100% offline, zero dipendenze web.")
