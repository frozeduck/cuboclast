# CuboClast (Android APK · Verticale · Minimalist Roguelike Peggle)

**CuboClast** è un videogioco arcade d'azione e strategia con fisica pinball nativo per **Android**, progettato da zero per essere giocato in **orientamento verticale (portrait)** con una sola mano. Combina la fisica cinetica e la soddisfazione dei rimbalzi stile *Peggle* con la distruzione progressiva di **cubetti geometrici** e una profonda stratificazione di **build roguelike** basate su reliquie sinergiche ed effetti a catena.

L'estetica è rigorosamente **minimalista e geometrica**: tonalità scure deep-space, linee vettoriali al neon ad alto contrasto (Ciano, Magenta, Ambra, Smeraldo, Zaffiro), particelle geometriche affilate e un sistema di **sintesi audio procedurale pentatonica** che suona note crescenti all'accumularsi dei rimbalzi, offrendo un game feel inebriante senza appesantire il dispositivo.

---

## ⚡ Download e Release

* **[Scarica l'APK v0.1.0 su GitHub Release](https://github.com/frozeduck/cuboclast/releases/tag/v0.1.0)** · [Repository GitHub](https://github.com/frozeduck/cuboclast)
* **Server locale di download**: [http://192.168.1.200:8144](http://192.168.1.200:8144) (file: `cuboclast-latest-debug.apk`)
* **Integrità SHA256**: `acb22e3f57cd45f5aabeacda3a95a7b274b8e32671938bd7bf393ab3ddfa8eb9`

---

## 🎮 Il Gameplay: Peggle × Cube Breaker × Roguelike

```
             ┌─────────────────────────────┐
             │       [ CANNONE NEON ]      │  <- Trascina per mirare la traiettoria
             │             ●               │
             │           .   .             │  <- Linea di mira predittiva con rimbalzo
             │         .       .           │
             │      [ 3 ]     [ 5 ]        │  <- Cubetti Ciano (HP scalati)
             │        \         /          │
             │     [BOMBA]   [SPLIT]       │  <- Cubetti speciali (Esplosioni, Multiball)
             │        \         /          │
             │          \     /            │
             │         [===BOSS===]        │  <- Settori Boss con barre a fasi
             │                             │
             │         [ CESTELLO ]        │  <- Recupera sfere e ottieni punti combo!
             └─────────────────────────────┘
```

### 1. Il Nucleo di Mira e Lancio (Peggle Feel)
* **Cannone Superiore**: toccando e trascinando in qualsiasi punto dello schermo si orienta il cannone, visualizzando la **traiettoria predittiva** a punti luminosi che calcola il primo rimbalzo contro muri o cubi.
* **Rimbalzo Solido & Normale Elastica**: le sfere rimbalzano con fisica newtoniana contro le facce piane e gli angoli arrotondati dei cubi, accelerando su cubi cinetici e applicando danni continui.
* **Cestello / Portale di Recupero**: una piattaforma energetica oscilla costantemente sul fondo dell'arena. Catturare una sfera cadente ricarica **+1 Sfera Ammo** e conferisce bonus punteggio moltiplicato per la combo!
* **Pulsante Velocità (1X / 2X)**: velocizza la risoluzione del turno quando molteplici mini-sfere rimbalzano contemporaneamente sullo schermo.

### 2. Tipologie di Cubetti & Scalabilità dei Livelli
Ogni settore incrementa gli HP dei cubi e introduce nuove formazioni geometriche e moduli difensivi:
* 🟦 **Cubo Standard (Neon Cyan)**: il blocco base da frantumare. I suoi HP aumentano progressivamente da 1-3 (Settore 1) fino a 20-30+ (Settori avanzati).
* 🟧 **Cubo Esplosivo (Neon Orange)**: all'esaurimento degli HP detona un'onda d'urto ad area (`240px`) che infligge danni devastanti a tutti i cubetti adiacenti.
* 🟪 **Cubo Splitter (Neon Purple)**: quando viene colpito o distrutto scinde la carica energetica generando **2 mini-sfere extra** che rimbalzano in campo.
* 🟨 **Cubo Cinetico (Electric Yellow)**: imprime una violenta accelerazione alla sfera (+35% velocità) e raddoppia il danno del colpo successivo.
* 🟩 **Cubo Schermo / Prisma (Emerald Green)**: emette una barriera di protezione che dimezza i danni subiti dai cubi alleati circostanti finché non viene abbattuto.
* 🔷 **Cubo Corazzato (Deep Cobalt)**: dotato di resistenza raddoppiata e corazza balistica rinforzata.
* 👑 **Boss Gigante (The Monolith & The Omega Tesseract)**: entità colossali a blocchi multipli con oltre 90-220 HP, circondate da satelliti rotanti e barre di salute segmentate.

### 3. Sinergie Roguelike (Relic Deckbuilding)
Al termine di ciascun settore, il giocatore sceglie **1 di 3 reliquie procedurali** che modificano permanentemente la fisica e l'arsenale per il resto della partita:
1. **Kinetic Surge**: Ogni rimbalzo consecutivo prima di toccare il fondo aumenta il danno della sfera di **+1**. (Un tiro con 15 rimbalzi si trasforma in una cometa nucleare da 15+ danni a colpo!).
2. **Fulmine a Catena**: Ogni 2 rimbalzi scarica saette elettriche su 2 cubi casuali nello schermo infliggendo 3 danni immediati.
3. **Reattore Multiball**: Distruggere qualsiasi cubo ha il 25% di probabilità di generare una mini-sfera supplementare.
4. **Schegge Taglienti**: I cubi frantumati scagliano 4 schegge a croce che perforano e danneggiano le linee adiacenti.
5. **Sfera Perforante**: La sfera disintegra e attraversa direttamente tutti i cubi con 2 o meno HP senza rimbalzare.
6. **Sovraccarico Critico**: 25% di probabilità di infliggere danno triplo (x3) con lampo bianco e scuotimento dello schermo.
7. **Supernova**: Quando una sfera cade sul fondo o entra nel cestello, proietta un pilastro energetico verso l'alto che disintegra i cubi inferiori.
8. **Cestello Magnetico**: Il cestello di cattura è più largo del 35% ed esercita una forza gravitazionale verso il centro.
9. **Iper-Velocità**: Aumenta del 25% la velocità delle sfere e aggiunge +1 danno base permanente a ogni impatto.
10. **Sfera Bomba**: All'8° rimbalzo consecutivo innesca un'esplosione nucleare ad area da 10 danni.
11. **Eco Prismatico**: Ogni 5 colpi messi a segno libera una pulsazione circolare.
12. **Massa Inerziale**: Infligge +3 danni extra contro cubi Corazzati e Boss.
13. **Rete di Sicurezza**: Un campo di forza sul fondo respinge verso l'alto la prima sfera caduta in ogni settore.

---

## 🎵 Audio Procedurale Pentatonico (Game Feel)

Il comparto sonoro non impiega file MP3 o campionamenti statici: tutte le frequenze sono generate in tempo reale tramite **`AudioTrack` PCM a 16-bit**:
* **Scala Pentatonica Crescente**: ogni rimbalzo della sfera suona una frequenza della scala (C4, D4, E4, G4, A4, C5, D5, E5, G5, A5, C6...). Più a lungo la sfera rimbalza tra i cubi, più l'arpeggio sale verso l'acuto, ricreando la stessa gratificazione acustica di *Peggle*.
* **Basso Dinamico di Frantumazione**: decadimento sinusoidale a frequenza modulata accompagnato da rumore bianco smorzato per restituire la sensazione tattile di un cubo che va in pezzi.
* **Feedback Aptico**: vibrazioni mirate al millisecondo sincronizzate con impatti, detonazioni e catture nel cestello.

---

## 🛠️ Architettura Tecnica

* **100% Nativo Android (Java 17 / SDK 36)**: Nessun motore pesante (Unity/Unreal), zero WebView o framework ibridi.
* **SurfaceView a 60/120 FPS**: Game loop dedicato in thread separato con sincronizzazione temporale e delta time limitato.
* **Risoluzione Virtuale 1080×1920**: Rendering scalato con preservazione dell'aspect ratio su qualsiasi display moderno (Galaxy Z Flip, smartphone pieghevoli, tablet, schermi 20:9 o 16:9).
* **Display Cutout Safe Area**: Finestra estesa a tutto schermo anche sotto a notch e fori per la fotocamera frontale (`LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES`).
* **Suite di Test Unitari Nativa**: Modello logico disaccoppiato da Android UI, verificabile al 100% da terminale in 0.5 secondi con `GameTest.java`.
* **Zero Permessi Intrusivi & 100% Offline**: Non richiede permessi di rete o internet, garantendo massima privacy e consumi batteria minimi.

---

## 🚀 Compilazione ed Esecuzione Locale

```bash
# Esecuzione test nativi e compilazione APK debug
./scripts/build-apk.sh

# Verifica formale e integrità dell'APK
python3 scripts/check-apk.py

# Generazione di nuove icone launcher neon
python3 scripts/generate_icons.py

# Creazione tag, push e GitHub Release automatica
./scripts/release.sh
```

---

## 📦 Container Docker per Download Locale

Il repository include una configurazione Docker Compose per esporre la pagina di download dell'APK sulla rete locale:

```bash
docker compose up -d
# L'interfaccia di download è disponibile su:
# http://192.168.1.200:8144
```

---

**Licenza**: MIT · Sviluppato per la comunità open-source da **Frozeduck**.
