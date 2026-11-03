# CuboClast (React · TypeScript · Vite · Minimalist Roguelike Peggle)

**CuboClast** è un videogioco arcade d'azione e strategia con fisica pinball, riscritto in **React + TypeScript + Vite**. Combina la fisica cinetica e la soddisfazione dei rimbalzi stile *Peggle* con la distruzione progressiva di **cubetti geometrici**, boss fight dinamiche a 3 fasi, **5 Archetipi Core** e un profondo sistema di **sinergie di set categorizzate**.

L'estetica è rigorosamente **cyberpunk minimalista e geometrica**: tonalità scure deep-space (`#090D16`), linee vettoriali al neon ad alto contrasto (Ciano, Magenta, Ambra, Smeraldo, Zaffiro), particelle geometriche affilate e un sistema di **sintesi audio procedurale pentatonica Web Audio API** che suona note crescenti all'accumularsi dei rimbalzi, offrendo un game feel inebriante su desktop e dispositivi mobili.

---

## ⚡ Download e Release APK Android

* **[Scarica l'APK v0.5.0 su GitHub Release](https://github.com/frozeduck/cuboclast/releases/tag/v0.5.0)** · [Repository GitHub](https://github.com/frozeduck/cuboclast)
* **Server locale di download**: [http://192.168.1.200:8144](http://192.168.1.200:8144) (file: `cuboclast-latest-debug.apk`)
* **Versione Web / PWA**: compilabile con `npm run build` o visualizzabile in locale.

---

## 🌟 Caratteristiche Principali

### 1. 🛡️ 5 Archetipi Core Iniziali
All'avvio di ogni partita scegli il tuo **Nucleo di Potere**:
* ⚡ **Volt Overcharge (Elettrico)**: I fulmini infliggono +50% di danno e si propagano a +1 bersaglio extra. Inizia con *Fulmine a Catena*.
* 💥 **Pyro Detonator (Esplosivo)**: Raggio di tutte le esplosioni aumentato del +40%, i cubi esplosivi infliggono +3 danni extra. Inizia con *Sfera Bomba*.
* 🌀 **Swarm Matrix (Multiball)**: Le mini-sfere rimbalzano 1 volta se cadono nel vuoto e hanno il +25% di probabilità di replicarsi. Inizia con *Reattore Multiball*.
* 🛡️ **Kinetic Titan (Cinetico)**: Cestello maggiorato fin dall'inizio (260px) con forte imbuto magnetico e +1 danno base naturale. Inizia con *Kinetic Surge*.
* ❄️ **Crystal Singularity (Criogenico)**: Ogni impatto congela i cubetti; i cubi congelati subiscono il doppio del danno (2x) e rilasciano schegge di ghiaccio. Inizia con *Sfera Perforante*.

### 2. 🔮 4 Famiglie di Reliquie & Sinergie di Set (Risonanze Combo)
Le reliquie sono categorizzate in 4 famiglie elementali:
* ⚡ **ELETTRICO**: *Fulmine a Catena*, *Scarica di Tensione*, *Bobina Tesla*, *Impulso EMP*.
* 💥 **ESPLOSIVO**: *Sfera Bomba*, *Schegge Taglienti*, *Carica a Grappolo*, *Supernova*.
* 🌀 **MULTIBALL**: *Reattore Multiball*, *Duplicazione Quantica*, *Tempesta di Scissione*, *Micro-Sciame*.
* 🛡️ **CINETICO**: *Kinetic Surge*, *Cestello Magnetico*, *Massa Inerziale*, *Rete di Sicurezza*, *Sfera Perforante*, *Iper-Velocità*, *Sovraccarico Critico*.

**Bonus di Risonanza Set (Combo Attive)**:
* **Combo 2x (Tier 1 Sinergia)**: +25% di efficacia agli effetti della famiglia (es. fulmini a più bersagli, esplosioni più ampie).
* **Maestria 3x (Tier 2 Maestria)**: Effetti sovraccarichi (es. mini-sfere ereditano il 100% del danno della sfera madre, catene di fulmini con critico).

### 3. 👑 Boss Fight Dinamiche a 3 Fasi con Meccaniche Attive
I Boss del Settore 5, 10, 15... (*The Omega Tesseract*) non sono blocchi passivi:
* **Fase 1 (100% - 66% HP)**: Satelliti difensivi orbitanti che deflettono i colpi e proteggono il nucleo.
* **Fase 2 (66% - 33% HP)**: Satelliti convertiti in mine e **Impulso EMP Repulsivo**: ogni 7 secondi il boss rilascia un'onda d'urto che devia le traiettorie delle sfere!
* **Fase 3 (33% - 0% HP) - ENRAGE**: Il Boss entra in sovraccarico, pulsa di cremisi e inizia a scendere verso il basso riducendo l'area di gioco!

### 4. 💎 Meta-Progressione Permanente & Salvataggio Continuo
* Durante le partite si raccolgono **Schegge Quantiche ◆** (+1 per cubo, +5 per cubo Core, +50 per Boss).
* Nel negozio permanente tra le run è possibile potenziare:
  * *Sfere Iniziali Extra* (+1 Sfera garantita per settore).
  * *Ampiezza Cestello* (+15px di ampiezza iniziale).
  * *Reroll Aggiuntivo* (+1 Reroll del draft per settore).
* **Salvataggio automatico persistente (LocalStorage)**: Nessun progresso perso. Riprendi in qualsiasi momento la partita in corso con settore, punteggio, archetipo e reliquie attive.

### 5. ♾️ Modalità Endless Loop (Oltre il Settore 10)
Dopo aver sconfitto l'Omega Tesseract al Settore 10, entra nel Loop Infinito con formazioni d'élite scalate all'infinito!

---

## 🎵 Audio Procedurale Pentatonico Web Audio API

Tutti i suoni sono sintetizzati al volo nel browser tramite Web Audio API a latenza zero:
* **Scala Pentatonica Crescente**: ogni rimbalzo suona una nota che sale (C4, D4, E4, G4, A4, C5, D5, E5, G5, A5, C6...).
* **CuboClast Fever Fanfare**: fanfara festosa al completamento degli obiettivi Core.
* **Allarme Boss & Transizione di Fase**: klaxon profondo a due toni.
* **Chime Risonanza Elementale**: accordo brillante quando si attiva una combo di set.
* **Suono Raccolta Scheggia ◆**: tintinnio cristallino.

---

## 🚀 Sviluppo ed Esecuzione

```bash
# Installa le dipendenze
npm install

# Avvia il server di sviluppo su http://localhost:3000
npm run dev

# Compila l'applicazione per la produzione
npm run build
```

---

**Licenza**: MIT
