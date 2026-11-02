# CuboClast (Android APK · Verticale · Minimalist Roguelike Peggle)

**CuboClast** è un videogioco arcade d'azione e strategia con fisica pinball nativo per **Android**, progettato da zero per essere giocato in **orientamento verticale (portrait)** con una sola mano. Combina la fisica cinetica e la soddisfazione dei rimbalzi stile *Peggle* con la distruzione progressiva di **cubetti geometrici** e una profonda stratificazione di **build roguelike** basate su reliquie sinergiche ed effetti a catena.

L'estetica è rigorosamente **minimalista e geometrica**: tonalità scure deep-space, linee vettoriali al neon ad alto contrasto (Ciano, Magenta, Ambra, Smeraldo, Zaffiro), particelle geometriche affilate e un sistema di **sintesi audio procedurale pentatonica** che suona note crescenti all'accumularsi dei rimbalzi, offrendo un game feel inebriante senza appesantire il dispositivo.

---

## ⚡ Download e Release

* **[Scarica l'APK v0.2.0 su GitHub Release](https://github.com/frozeduck/cuboclast/releases/tag/v0.2.0)** · [Repository GitHub](https://github.com/frozeduck/cuboclast)
* **Server locale di download**: [http://192.168.1.200:8144](http://192.168.1.200:8144) (file: `cuboclast-latest-debug.apk`)

---

## 🌟 Novità v0.2.0: Ribilanciamento & Game Feel Peggle

1. **Obiettivi "Cubi Core" & CuboClast FEVER!**:
   * Non è più necessario distruggere il 100% di tutti i cubetti del settore: il livello richiede di abbattere i **Cubi Core** (contrassegnati da bordo dorato e aura radiosa pulsante).
   * Distrutti tutti i Core si attiva il **CuboClast FEVER**: tutti i cubetti residui vengono polverizzati in una spettacolare reazione a catena con fuochi d'artificio, fanfara audio e bonus punti per le sfere rimaste!
2. **Economia Munizioni Più Generosa (8 Sfere Iniziali)**:
   * Si inizia con **8 sfere** (invece di 5) e a ogni settore superato la riserva viene ricaricata ad almeno 8 sfere (+2 bonus).
3. **Sfera Extra per Punteggio del Tiro (Fever Ball)**:
   * Raggiungendo 6.000, 18.000 e 36.000 punti in un singolo colpo si guadagna automaticamente **+1 Sfera Extra** con chime trionfale.
4. **Soccorso "Mercy Refund"**:
   * Se un tiro sfortunato o accidentale cade senza colpire almeno 2 cubetti, la sfera viene automaticamente **rimborsata** ("MERCY REFUND! +1 Sfera"), eliminando le morti premature.
5. **Traiettoria di Mira Predittiva a 2 Segmenti con Rimbalzo**:
   * Il mirino traccia con precisione chirurgica non solo il raggio iniziale verso il primo cubetto o parete, ma calcola anche la normale di impatto e il **vettore di riflessione**, mostrando esattamente dove rimbalzerà la sfera con reticolo d'impatto e pallini al neon.
6. **Cestello Allargato & Attrazione Magnetica Naturale**:
   * Cestello allargato a 220px (290px con reliquia magnetica) con imbuto gravitazionale che risucchia dolcemente le sfere che cadono in prossimità.
7. **Draft Reliquia Iniziale al Lancio**:
   * La partita inizia offrendo subito 3 reliquie di partenza per impostare immediatamente l'archetipo della build roguelike (es. Kinetic Surge, Multiball Reactor, Fulmine a Catena).
8. **Scalabilità HP Ricalibrata**:
   * Settore 1: cubi a 1 HP (one-shot istantaneo con schegge ovunque).
   * Danno cumulativo naturale (+1 danno ogni 3 rimbalzi nello stesso colpo).

---

## 🎮 Il Gameplay: Peggle × Cube Breaker × Roguelike

```
             ┌─────────────────────────────┐
             │       [ CANNONE NEON ]      │  <- Trascina per mirare la traiettoria
             │             ●               │
             │           .   .             │  <- Raggio 1 (mira) + Raggio 2 (riflesso)
             │         .       .           │
             │      ★[CORE]   [ 1 ]        │  <- Cubi Core dorati (Obiettivi primari)
             │        \         /          │
             │     [BOMBA]   [SPLIT]       │  <- Cubetti speciali (Esplosioni, Multiball)
             │        \         /          │
             │          \     /            │
             │         [===BOSS===]        │  <- Settori Boss con barre a fasi
             │                             │
             │        [ CESTELLO ]         │  <- Attrazione magnetica e recupero sfere!
             └─────────────────────────────┘
```

### 1. Tipologie di Cubetti & Formazioni
* ★ **Cubo Core (Radiant Amber Gold)**: l'obiettivo fondamentale per superare il settore e scatenare il Fever.
* 🟦 **Cubo Standard (Neon Cyan)**: blocco geometrico base con HP calibrati.
* 🟧 **Cubo Esplosivo (Neon Orange)**: all'esaurimento degli HP detona un'onda d'urto ad area (`250px`).
* 🟪 **Cubo Splitter (Neon Purple)**: quando viene colpito genera **2 mini-sfere extra**.
* 🟨 **Cubo Cinetico (Electric Yellow)**: spinge la sfera al +35% di velocità e conferisce bonus danno.
* 🟩 **Cubo Schermo / Prisma (Emerald Green)**: emette una barriera che dimezza i danni subiti dai cubi alleati.
* 🔷 **Cubo Corazzato (Deep Cobalt)**: dotato di corazza balistica rinforzata.
* 👑 **Boss Gigante (The Monolith & The Omega Tesseract)**: colossi a blocchi multipli con oltre 60-130 HP e satelliti rotanti.

### 2. Sinergie Roguelike (Relic Deckbuilding)
1. **Kinetic Surge**: Ogni rimbalzo consecutivo prima di toccare il fondo aumenta il danno della sfera di **+1**.
2. **Fulmine a Catena**: Ogni 2 rimbalzi scarica saette elettriche su 2 cubi distanti per 3 danni.
3. **Reattore Multiball**: Distruggere qualsiasi cubo ha il 30% di probabilità di generare una mini-sfera supplementare.
4. **Schegge Taglienti**: I cubi frantumati scagliano 4 schegge a croce che perforano e danneggiano le linee adiacenti.
5. **Sfera Perforante**: La sfera disintegra e attraversa direttamente tutti i cubi con 2 o meno HP senza rimbalzare.
6. **Sovraccarico Critico**: 30% di probabilità di infliggere danno triplo (x3) con lampo bianco e scuotimento dello schermo.
7. **Supernova**: Quando una sfera cade sul fondo o entra nel cestello, proietta un pilastro energetico verso l'alto.
8. **Cestello Magnetico**: Il cestello di cattura è largo 290px ed esercita forte attrazione gravitazionale.
9. **Iper-Velocità**: Aumenta del 25% la velocità delle sfere e aggiunge +1 danno base permanente a ogni impatto.
10. **Sfera Bomba**: All'8° rimbalzo consecutivo innesca un'esplosione nucleare ad area da 10 danni.
11. **Eco Prismatico**: Ogni 4 colpi messi a segno libera una pulsazione circolare.
12. **Massa Inerziale**: Infligge +4 danni extra contro cubi Corazzati e Boss.
13. **Rete di Sicurezza**: Un campo di forza sul fondo respinge verso l'alto la prima sfera caduta in ogni settore.

---

## 🎵 Audio Procedurale Pentatonico (Game Feel)

Tutte le frequenze sonore sono sintetizzate in tempo reale a latenza zero tramite **`AudioTrack` PCM a 16-bit**:
* **Scala Pentatonica Crescente**: ogni rimbalzo suona una nota che sale (C4, D4, E4, G4, A4, C5, D5, E5, G5, A5, C6...).
* **CuboClast Fever Fanfare**: fanfara festosa al completamento degli obiettivi Core.
* **Chime Sfera Extra**: accordo brillante quando si raggiunge la soglia punteggio del tiro.
* **Basso Dinamico di Frantumazione & Decadimento Haptic**: feedback tattile sincronizzato sul dispositivo.

---

## 🛠️ Architettura Tecnica

* **100% Nativo Android (Java 17 / SDK 36)**: Zero motori pesanti o WebView.
* **SurfaceView a 60/120 FPS**: Game loop dedicato con sincronizzazione temporale e scaling virtuale a 1080×1920.
* **Display Cutout Safe Area**: Finestra estesa a tutto schermo sotto al punch-hole della fotocamera frontale.
* **100% Offline & Privacy**: Nessun permesso di rete, nessun tracciamento.

---

## 🚀 Compilazione ed Esecuzione Locale

```bash
# Esecuzione test nativi e compilazione APK debug
./scripts/build-apk.sh

# Verifica formale e integrità dell'APK
python3 scripts/check-apk.py

# Nuova release su GitHub automatica (commit, tag, push e upload APK)
./scripts/release.sh
```

---

## 📦 Container Docker per Download Locale

```bash
docker compose up -d
# L'interfaccia di download è disponibile su:
# http://192.168.1.200:8144
```

---

**Licenza**: MIT · Sviluppato per la comunità open-source da **Frozeduck**.
