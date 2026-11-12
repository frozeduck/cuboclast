# CuboClast — Progressione Roguelike Ibrida & Bivi Tattici Settoriali

Questo piano introduce una curva di progressione autentica e graduale per **CuboClast**, eliminando il sovraccarico di poteri alla prima partita e trasformando ogni run in un viaggio tattico attraverso settori procedurali, bivi strategici (Normale, Elite, Mercante, Evento) e Boss narrativi di fine capitolo, mantenendo rigorosamente l'estetica **Minimalist Neon Geometric (`v0.4.0`)** ottimizzata per smartphone.

## User Review & Critical Decisions

> [!IMPORTANT]
> Di seguito sono riepilogate le scelte di design confermate insieme e il funzionamento dettagliato del nuovo ciclo di progressione prima di passare allo sviluppo.

- **Decisione Confermata 1 — Struttura Ibrida (Settori Procedurali + Boss ed Eventi Fissi)**: La campagna è divisa in **5 Capitoli da 5 Settori ciascuno** (Settori 1–25). I settori intermedi (1–4 di ogni capitolo) sono generati proceduralmente con pattern geometrici dinamici, mentre il 5° settore di ogni capitolo ospita un **Boss Guardiano fisso** accompagnato da brevi trasmissioni di trama.
- **Decisione Confermata 2 — Inizio Puro con 1 Nucleo Base Neutro**: Un nuovo giocatore inizia esclusivamente con il **Nucleo Prototipo (`PROTO_CORE`)**, privo di reliquie iniziali e con fisica balistica pura. Tutti i 7 Nuclei elementali avanzati partono bloccati e vengono sbloccati progressivamente raggiungendo traguardi nei capitoli.
- **Decisione Confermata 3 — Sblocco Graduale per Capitoli (Cubi, Reliquie e Nuclei)**: Nei primi settori compaiono solo cubi standard/core e un pool ristretto di reliquie base; ogni nuovo Capitolo raggiunto sblocca permanentemente nuove tipologie di cubi (`KINETIC`, `EXPLOSIVE`, `SPLITTER`, `ARMOR`, `SHIELD`) e nuovi scaglioni (Tier) di reliquie.
- **Decisione Confermata 4 — Scelta Bivio tra Settori (Normale, Elite, Evento, Mercante)**: Al termine di ogni settore, il giocatore sceglie la propria rotta successiva su una schermata di bivio tattico tra **Settore Normale**, **Settore Elite**, **Evento Anomalia** o **Mercante In-Run**, fino a convergere sul Boss del Capitolo.

---

## 1. Overview & Core Concept

- **Cosa Cambia nell'Esperienza di Gioco**:
  - **Partenza essenziale e leggibile**: La prima partita non travolge il giocatore con esplosioni a catena o 20 reliquie complesse fin dal primo rimbalzo. Il giocatore padroneggia la mira, i rimbalzi e il cestello magnetico con il **Nucleo Prototipo**, conquistando la prima reliquia solo dopo aver superato il Settore 1.
  - **Scoperta continua**: Ogni Capitolo introduce una nuova meccanica ambientale, un nuovo tipo di cubo nemico, un nuovo gruppo di reliquie nel Codex e un nuovo Nucleo sbloccabile.
  - **Scelte strategiche in-run**: Tra un settore e l'altro il giocatore decide se affrontare un **Settore Elite** ad alto rischio per ottenere reliquie rare e doppie Schegge, visitare un **Mercante** per ricaricare sfere o potenziare il cannone, oppure entrare in un'**Anomalia Quantica** con scelte narrative a rischio/ricompensa.

---

## 2. User Experience & Visual Design

### Flusso Utente Completo (Zero-State → Fine Capitolo)

1. **Selezione Nucleo (Inizio Run)**:
   - Alla prima apertura è sbloccato solo **Proto-Core Mk.I** (`[NEUTRO · NESSUNA RELIQUIA INIZIALE]`), mentre gli altri 7 Nuclei mostrano chiaramente il traguardo di capitolo richiesto per sbloccarli (es. *"Sblocca: Raggiungi il Settore 3"*, *"Sblocca: Sconfiggi The Monolith al Settore 5"*).
   - Se il giocatore ha già sbloccato Capitoli successivi (Cap. II–V), può anche scegliere da quale Capitolo sbloccato iniziare o partire dal Capitolo I.
2. **Briefing Narrativo di Inizio Capitolo**:
   - All'ingresso di ogni nuovo Capitolo (Settori 1, 6, 11, 16, 21) appare una scheda minimalista di trasmissione dati (1 schermata compatta, chiudibile con un tocco) che presenta il settore galattico, il Guardiano in attesa e il **nuovo tipo di cubo/anomalia** introdotto in quel capitolo.
3. **Combattimento Balistico Procedurale**:
   - Il generatore procedurale crea formazioni simmetriche o asimmetriche basate sul seme del settore, sul tipo di nodo scelto (`NORMALE` vs `ELITE`) e sui tipi di cubi consentiti dal Capitolo corrente.
4. **Bivio Tattico tra Settori (Nuova Schermata Mobile-First)**:
   - Completato un settore, dopo l'eventuale scelta della reliquia, si apre il **Selettore Rotta Settoriale** con 2 o 3 nodi selezionabili con un tocco:
     - **Settore Standard (`#00e5ff`)**: Difficoltà normale · Ricompensa: 1 Reliquia + Schegge base.
     - **Settore Elite (`#ff6d00`)**: Cubi potenziati (+50% HP, più Core) · Ricompensa: Reliquia Rara + 2x Schegge + +1 Sfera.
     - **Mercante Orbitale (`#ffe600`)**: Spendendo Schegge o Punti Run puoi acquistare `+2 Sfere`, `+1 Danno Base Run`, `+40px Cestello Run` o una Reliquia in vetrina.
     - **Anomalia Misteriosa (`#a855f7`)**: Evento interattivo con 2–3 scelte (es. barattare sfere per reliquie, sovraccaricare il cannone o riparare il cestello).
     - **Guardiano del Capitolo (`#ff007f`)**: Nodo obbligatorio ai Settori 5, 10, 15, 20, 25.

### Identità Visiva & Stile Minimalista (`v0.4.0`)

- **Direzione Estetica**: Geometria vettoriale neon su fondo nero profondo (`#090d16`), bordi netti da `2px`, zero sfocature (`backdrop-blur` assente), contrasto elevato e leggibilità istantanea su smartphone.
- **Palette Colori Semantica**:
  - Sfondo primario: `#090d16` · Superficie schede: `#141d2d` · Bordi strutturali: `#1e2e48`
  - Nodo Normale / Elettrico: `#00e5ff` (Ciano Neon)
  - Nodo Elite / Esplosivo: `#ff6d00` (Arancio Termico)
  - Nodo Mercante / Core / Cinetico: `#ffe600` (Giallo Solare)
  - Nodo Evento / Multiball: `#a855f7` (Viola Quantico)
  - Nodo Boss / Pericolo Critico: `#ff007f` (Magenta)
  - Conferma / Riparazione: `#00ff88` (Verde Smeraldo)
- **Layout Mobile-First Scorrevole**:
  - Tutte le nuove schermate (`Bivio Settoriale`, `Mercante In-Run`, `Evento Anomalia`, `Trasmissione Capitolo`) adottano lo schema a 3 fasce verificato: **Header fisso (`shrink-0`)** + **Corpo scorrevole singolo (`flex-1 min-h-0 modal-scroll`)** + **Footer fisso (`shrink-0`)** con pulsanti ad altezza minima `48px`.

---

## 3. Key Product Decisions & Trade-Offs

### Tabella di Sblocco Graduale per Capitoli (Tier 1 → Tier 5)

| Capitolo / Traguardo | Settori | Cubi Presenti nel Generatore | Nuclei Sbloccati | Pool Reliquie Sbloccato |
| :--- | :--- | :--- | :--- | :--- |
| **Inizio (Nuovo Profilo)** | Sett. 1–2 | `NORMAL`, `CORE` | **Proto-Core Mk.I** (Neutro, 0 reliquie iniziali) | **Tier 1 (6 Reliquie Base)**: `KINETIC_SURGE`, `MAGNETIC_BASKET`, `SAFETY_NET`, `CHAIN_LIGHTNING`, `BOUNCING_BOMB`, `MULTIBALL_REACTOR` |
| **Traguardo Settore 3** | Sett. 3–5 | + `KINETIC` (Rimbalzo elastico) | + **Volt Overcharge** | + `VOLT_DISCHARGE`, `HEAVY_MASS`, `HYPER_VELOCITY` |
| **Cap. II (Boss Sett. 5 sconfitto)** | Sett. 6–10 | + `EXPLOSIVE` (Detonazione area) | + **Pyro Detonator**, **Kinetic Titan** | + **Tier 2**: `SHRAPNEL_BURST`, `TESLA_COIL`, `CRITICAL_OVERDRIVE`, `QUANTUM_DUPLICATION`, `POLAR_VORTEX` |
| **Cap. III (Boss Sett. 10 sconfitto)** | Sett. 11–15 | + `SPLITTER`, `ARMOR` (Corazza 50%) | + **Swarm Matrix**, **Crystal Singularity** | + **Tier 3**: `CLUSTER_CHARGE`, `SPLIT_STORM`, `MICRO_SWARM`, `EMP_BURST`, `PIERCING_RAIL` |
| **Cap. IV (Boss Sett. 15 sconfitto)** | Sett. 16–20 | + `SHIELD` (Rigenerazione scudo) | + **Chrono Pulse** | + **Tier 4**: `SUPERNOVA`, `GRAVITY_WELL`, `PLASMA_CONDUIT`, `CHRONO_WARP` |
| **Cap. V (Boss Sett. 20 sconfitto)** | Sett. 21–25 | Tutti i cubi + Formazioni Doppia Barriera | + **Quantum Singularity** | + **Tier 5**: `SUPERNOVA_CATALYST` + Tutte le Combo Fusione |

- **Perché questo approccio**:
  - **Evita il caos visivo e cognitivo iniziale**: Nelle prime partite il giocatore capisce subito cosa fa ogni singolo cubo e ogni reliquia pescata.
  - **Ricompensa ogni traguardo**: Anche se il giocatore perde al Settore 3 o al Boss del Settore 5, sblocca nuovi Nuclei, nuove reliquie e nuovi cubi per la run successiva.
  - **Migrazione salvataggi sicura**: Chi inizia da zero (o usa il pulsante *"Reset Progressione"* nelle opzioni) vive la nuova progressione graduale pura a partire dal `PROTO_CORE`.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architettura della Macchina a Stati & Ciclo Settoriale

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ARCHETYPE_SELECT (Menu)                          │
│   • Proto-Core Mk.I (Default, 0 Reliquie) + Nuclei sbloccati per Cap.   │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ Avvia Run (Settore 1)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     CHAPTER_INTRO (Trasmissione)                        │
│   • Breve scheda lore + anteprima nuovi Cubi/Meccaniche del Capitolo    │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  AIMING ◄───► BALL_IN_PLAY ◄───► FEVER                  │
│   • Generatore Procedurale parametrico per Capitolo (Normal / Elite)    │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ Tutti i Core distrutti
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     RELIC_DRAFT (Scelta Reliquia)                       │
│   • Filtra solo le Reliquie sbloccate fino al Tier del giocatore        │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   SECTOR_MAP (Bivio Tattico 2-3 Nodi)                   │
├──────────────────┬──────────────────┬──────────────────┬────────────────┤
│  [NORMALE]       │  [ELITE]         │  [EVENTO]        │  [MERCANTE]    │
│  Settore         │  HP +50%,        │  Scelta narrativa│  Officina Run: │
│  Procedurale     │  2x Schegge +    │  a 2-3 opzioni   │  +Sfere, +Danno│
│  Bilanciato      │   +1 Sfera Bonus  │  rischio/premio  │  o Reliquia    │
└────────┬─────────┴────────┬─────────┴────────┬─────────┴────────┬───────┘
         └──────────────────┴──────────────────┴──────────────────┘
                                    │ Al Settore 5, 10, 15, 20, 25
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    BOSS_SECTOR (Guardiano Capitolo)                     │
│   • Sconfitta Boss ──► Sblocco Nuovo Capitolo, Cubi, Nuclei e Reliquie  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Modello Dati e Gestione Stato

1. **Nuovi Stati del Motore (`GameState`)**:
   - `CHAPTER_INTRO`: Mostra la trasmissione di apertura del Capitolo (Settori 1, 6, 11, 16, 21) con il briefing sul Boss e sui nuovi tipi di cubi.
   - `SECTOR_MAP`: Mostra il bivio procedurale con 2–3 nodi generati per il settore successivo (`NORMAL`, `ELITE`, `EVENT`, `MERCHANT`, o `BOSS` se il prossimo settore è multiplo di 5).
   - `SECTOR_EVENT`: Gestisce l'incontro narrativo/anomalia con 2–3 scelte interattive e applicazione immediata degli effetti (es. `+3 Sfere`, `+1 Danno Base`, `Reliquia Casuale`, `Scudo Cestello`).
   - `RUN_MERCHANT`: Gestisce il Mercante Orbitale in-run dove spendere Schegge raccolte per potenziamenti temporanei della run o ricarica sfere.
2. **Modificatori In-Run Persistiti nel Salvataggio (`SavedRunState`)**:
   - `runBonusDamage`: Bonus danno piatto accumulato tramite Eventi o Mercante durante la run.
   - `runBonusBasketWidth`: Bonus larghezza cestello accumulato nella run.
   - `currentNodeType`: Tipo del nodo corrente (`NORMAL`, `ELITE`, `BOSS`) per scalare gli HP dei cubi e le ricompense di fine settore.
   - `nextMapNodes`: Opzioni del bivio generate per la scelta del settore successivo.
3. **Controllo Qualità e Test Automatici**:
   - Aggiornamento della suite di test unitari per verificare:
     - Che un nuovo profilo inizi esclusivamente con `PROTO_CORE` e 0 reliquie attive al Settore 1.
     - Che il generatore di livelli rispetti rigorosamente i tipi di cubi sbloccati per ciascun Capitolo.
     - Che la generazione dei bivi (`SECTOR_MAP`) produca sempre un nodo `BOSS` ai Settori 5, 10, 15, 20 e 25 e scelte valide negli altri settori.
     - Che le transizioni tra `RELIC_DRAFT` → `SECTOR_MAP` → `SECTOR_EVENT` / `RUN_MERCHANT` / `AIMING` funzionino senza blocchi su mobile.
