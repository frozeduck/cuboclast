# CuboClast (Android APK · Verticale · Minimalist Roguelike Peggle)

**CuboClast** è un videogioco arcade d'azione e strategia con fisica pinball nativo per **Android**, progettato da zero per essere giocato in **orientamento verticale (portrait)** con una sola mano. Combina la fisica cinetica e la soddisfazione dei rimbalzi stile *Peggle* con la distruzione progressiva di **cubetti geometrici**, boss fight dinamiche a fasi, **5 Archetipi Core** e un profondo sistema di **sinergie di set categorizzate**.

L'estetica è rigorosamente **minimalista e geometrica**: tonalità scure deep-space, linee vettoriali al neon ad alto contrasto (Ciano, Magenta, Ambra, Smeraldo, Zaffiro), particelle geometriche affilate e un sistema di **sintesi audio procedurale pentatonica** che suona note crescenti all'accumularsi dei rimbalzi, offrendo un game feel inebriante senza appesantire il dispositivo.

---

## ⚡ Download e Release

* **[Scarica l'APK v0.4.0 su GitHub Release](https://github.com/frozeduck/cuboclast/releases/tag/v0.4.0)** · [Repository GitHub](https://github.com/frozeduck/cuboclast)
* **Server locale di download**: [http://192.168.1.200:8144](http://192.168.1.200:8144) (file: `cuboclast-latest-debug.apk`)

---

## 🌟 Novità v0.4.0: Zero Crash, Salvataggio Continuo della Run & Leggibilità Migliorata

### 1. 🛡️ Risoluzione Crash (Thread-Safe Synchronization)
* **Sincronizzazione Atomica Thread UI & Game Loop**: Eliminato qualsiasi rischio di `ConcurrentModificationException` tra gli eventi touch dell'interfaccia e il ciclo a 60 FPS su `SurfaceView`.
* **Iterazioni Indicizzate Protette**: Tutte le liste dinamiche (`cubes`, `balls`, `shards`, `floatingTexts`, `bossSatellites`) usano ora accessi per indice senza allocazione di iteratori concorrenti.
* **Auto-Recovery**: Gestione delle eccezioni con ripristino istantaneo dello stato per garantire che il ciclo grafico non si arresti mai.

### 2. 💾 Salvataggio Automatico Continuo & "Riprendi Partita"
* **Persistenza Stato Attivo**: Ad ogni settore raggiunto, ad ogni reliquia scelta e alla messa in pausa/chiusura dell'app, vengono salvati su disco:
  * Settore e livello corrente raggiunto.
  * Punteggio e sfere rimanenti.
  * Archetipo selezionato e lista completa delle reliquie attive accumulate.
  * Schegge Quantiche della sessione e stato Endless.
* **Pulsante "RIPRENDI PARTITA"**: All'avvio del gioco, se è presente una sessione in corso, compare un pulsante prominente smeraldo che permette di riprendere all'istante l'esatto stato della partita senza perdere alcun progresso.

### 3. 📖 Carte Abilità ad Alta Leggibilità
* **Testo Multiriga Dinamico (`drawMultilineText`)**: Le descrizioni delle abilità e dei perk iniziali si adattano ora automaticamente alla larghezza della schermata, evitando qualsiasi testo tagliato.
* **Tipografia Ridisegnata**: Font ingranditi ad alto contrasto (32f per titoli, 23f `#E2E8F0` per il corpo), card più alte (225px) con badge elementali dedicati e spaziatura ottimizzata.

---

## 🌟 Contenuti di Gioco: Archetipi, Risonanze di Set, Boss a Fasi & Endless Loop

### 1. 🛡️ 5 Archetipi Core Iniziali (Definiscono l'Intera Run)
All'avvio di ogni partita scegli il tuo **Nucleo di Potere**:
* ⚡ **Volt Overcharge (Elettrico)**: Tutti i fulmini e le scariche infliggono +50% di danno e si propagano a +1 bersaglio extra. Inizia con *Fulmine a Catena*.
* 💥 **Pyro Detonator (Esplosivo)**: Raggio di tutte le esplosioni aumentato del +40%, i cubi esplosivi infliggono +3 danni extra. Inizia con *Sfera Bomba*.
* 🌀 **Swarm Matrix (Multiball)**: Le mini-sfere rimbalzano 1 volta se cadono nel vuoto e hanno il +25% di probabilità di replicarsi. Inizia con *Reattore Multiball*.
* 🛡️ **Kinetic Titan (Cinetico)**: Cestello maggiorato fin dall'inizio (260px) con forte imbuto magnetico e +1 danno base su ogni rimbalzo. Inizia con *Kinetic Surge*.
* ❄️ **Crystal Singularity (Criogenico)**: Ogni impatto congela i cubetti; i cubi congelati subiscono il doppio del danno (2x) e rilasciano schegge di ghiaccio.

### 2. 🔮 4 Famiglie di Reliquie & Sinergie di Set (Risonanze Combo)
Le reliquie sono categorizzate in 4 famiglie elementali:
* ⚡ **ELETTRICO**: *Fulmine a Catena*, *Scarica di Tensione*, *Bobina Tesla*, *Impulso EMP*.
* 💥 **ESPLOSIVO**: *Sfera Bomba*, *Schegge Taglienti*, *Carica a Grappolo*, *Supernova*.
* 🌀 **MULTIBALL**: *Reattore Multiball*, *Duplicazione Quantica*, *Tempesta di Scissione*, *Micro-Sciame*.
* 🛡️ **CINETICO**: *Kinetic Surge*, *Cestello Magnetico*, *Massa Inerziale*, *Rete di Sicurezza*, *Sfera Perforante*, *Iper-Velocità*, *Sovraccarico Critico*.

**Bonus di Risonanza Set (Combo Attive)**:
* **Combo 2x (Tier 1)**: +25% di efficacia agli effetti della famiglia (es. fulmini a più bersagli, esplosioni più ampie).
* **Maestria 3x (Tier 2)**: Effetti sovraccarichi (es. mini-sfere ereditano il 100% del danno della sfera madre, catene di fulmini infinite con critico).

### 3. 👑 Boss Fight Dinamiche a 3 Fasi con Meccaniche Attive
I Boss del Settore 5 (*The Monolith*) e Settore 10 (*The Omega Tesseract*) non sono blocchi passivi:
* **Fase 1 (100% - 66% HP)**: Satelliti difensivi orbitanti che deflettono i colpi e proteggono il nucleo.
* **Fase 2 (66% - 33% HP)**: Satelliti convertiti in mine e **Impulso EMP Repulsivo**: ogni 7 secondi il boss rilascia un'onda d'urto che devia le traiettorie delle sfere!
* **Fase 3 (33% - 0% HP) - ENRAGE**: Il Boss entra in sovraccarico, pulsa di cremisi e inizia a scendere verso il basso riducendo l'area di gioco!

### 4. 💎 Meta-Progressione Permanente (Archivio Quantico)
* Durante le partite si raccolgono **Schegge Quantiche ◆** (+1 per cubo, +5 per cubo Core, +50 per Boss).
* Nel negozio permanente tra le run è possibile potenziare:
  * *Capacità del Serbatoio* (+1 Sfera iniziale per settore).
  * *Calibrazione Cestello* (+15px di ampiezza iniziale).
  * *Manipolazione Quantica* (+1 Reroll del draft per settore).
  * *Sblocco Archetipi Segreti* (*Crystal Singularity* a 100 ◆).
* Salvataggio offline automatico e persistente con `SharedPreferences`.

### 5. ♾️ Modalità Endless Loop (Oltre il Settore 10)
* Dopo aver sconfitto l'Omega Tesseract al Settore 10, puoi scegliere di continuare nel **Loop Infinito**:
* I settori proseguono (11, 12, 13...) con difficoltà scalata all'infinito e formazioni d'élite, permettendo di spingere la propria build a livelli cosmici con decine di mini-sfere, fulmini e detonazioni simultanee!

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
             │    (●) [===BOSS===] (●)     │  <- Satelliti orbitanti & 3 Fasi attive
             │                             │
             │        [ CESTELLO ]         │  <- Attrazione magnetica e recupero sfere!
             └─────────────────────────────┘
```

---

## 🎵 Audio Procedurale Pentatonico (Game Feel)

Tutte le frequenze sonore sono sintetizzate in tempo reale a latenza zero tramite **`AudioTrack` PCM a 16-bit**:
* **Scala Pentatonica Crescente**: ogni rimbalzo suona una nota che sale (C4, D4, E4, G4, A4, C5, D5, E5, G5, A5, C6...).
* **CuboClast Fever Fanfare**: fanfara festosa al completamento degli obiettivi Core.
* **Allarme Boss & Transizione di Fase**: klaxon profondo a due toni.
* **Chime Risonanza Elementale**: accordo brillante quando si attiva una combo di set.
* **Suono Raccolta Scheggia ◆**: tintinnio cristallino.

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
