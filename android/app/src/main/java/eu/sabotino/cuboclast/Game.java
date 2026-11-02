package eu.sabotino.cuboclast;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

public class Game {
    public static final float VIRTUAL_WIDTH = 1080f;
    public static final float VIRTUAL_HEIGHT = 1920f;
    public static final float CANNON_X = VIRTUAL_WIDTH / 2f;
    public static final float CANNON_Y = 120f;
    public static final float GRAVITY = 980f;

    public enum State {
        AIMING,
        BALL_IN_PLAY,
        LEVEL_CLEAR,
        RELIC_DRAFT,
        GAME_OVER,
        VICTORY
    }

    public enum CubeType {
        NORMAL,
        ARMOR,
        EXPLOSIVE,
        SPLITTER,
        KINETIC,
        SHIELD,
        BOSS
    }

    public enum RelicType {
        KINETIC_SURGE("Kinetic Surge", "Ogni rimbalzo aumenta il danno della sfera di +1 per quel tiro."),
        CHAIN_LIGHTNING("Fulmine a Catena", "Ogni 2 rimbalzi scaglia un fulmine su 2 cubi casuali per 3 danni."),
        SHRAPNEL_BURST("Schegge Taglienti", "I cubi distrutti proiettano 4 schegge geometriche perforanti."),
        MULTIBALL_REACTOR("Reattore Multiball", "Distruggere un cubo ha il 25% di probabilita di generare una mini-sfera."),
        PIERCING_RAIL("Sfera Perforante", "La sfera attraversa i cubi con 2 o meno HP senza rimbalzare."),
        CRITICAL_OVERDRIVE("Sovraccarico Critico", "25% di possibilita di colpo critico (danno x3 e onda d'urto)."),
        SUPERNOVA("Supernova", "Quando una sfera cade sul fondo, scatena un fascio d'energia verso l'alto."),
        MAGNETIC_BASKET("Cestello Magnetico", "Il cestello inferiore e piu largo del 35% e attira le sfere cadenti."),
        HYPER_VELOCITY("Iper-Velocita", "Le sfere viaggiano il 25% piu veloci e infliggono +1 danno base."),
        BOUNCING_BOMB("Sfera Bomba", "All'8° rimbalzo la sfera genera una massiccia detonazione ad area."),
        PRISMATIC_ECHO("Eco Prismatico", "Ogni 5 cubi colpiti attiva un'onda d'urto ad anello."),
        HEAVY_MASS("Massa Inerziale", "Infligge +3 danni extra contro i cubi corazzati e i boss."),
        SAFETY_NET("Rete di Sicurezza", "Un campo di forza respinge la prima sfera caduta in ogni livello.");

        public final String title;
        public final String description;

        RelicType(String title, String description) {
            this.title = title;
            this.description = description;
        }
    }

    // --- Entità di Gioco ---

    public static class Ball {
        public float x, y;
        public float vx, vy;
        public float radius = 18f;
        public boolean isMini = false;
        public boolean isAlive = true;
        public int bounces = 0;
        public float baseDamage = 1f;
        public final List<float[]> trail = new ArrayList<>();
        public float kineticCharge = 0f;

        public Ball(float x, float y, float vx, float vy) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
        }
    }

    public static class Cube {
        public float x, y, width, height;
        public int hp;
        public int maxHp;
        public CubeType type;
        public float wobble = 0f;
        public float hitFlash = 0f;
        public boolean isAlive = true;
        public float shieldPulse = 0f;

        public Cube(float x, float y, float w, float h, int hp, CubeType type) {
            this.x = x;
            this.y = y;
            this.width = w;
            this.height = h;
            this.hp = hp;
            this.maxHp = hp;
            this.type = type;
        }

        public float centerX() { return x + width / 2f; }
        public float centerY() { return y + height / 2f; }
    }

    public static class Basket {
        public float x;
        public float y = 1780f;
        public float width = 180f;
        public float height = 34f;
        public float vx = 280f;

        public Basket() {
            this.x = VIRTUAL_WIDTH / 2f - width / 2f;
        }

        public void update(float dt) {
            x += vx * dt;
            float minX = 40f;
            float maxX = VIRTUAL_WIDTH - 40f - width;
            if (x < minX) {
                x = minX;
                vx = Math.abs(vx);
            } else if (x > maxX) {
                x = maxX;
                vx = -Math.abs(vx);
            }
        }
    }

    public static class Shard {
        public float x, y;
        public float vx, vy;
        public float size;
        public float life = 1f;
        public int color;
        public float rotation = 0f;
        public float rotSpeed;
        public boolean isDead = false;

        public Shard(float x, float y, float vx, float vy, float size, int color) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.size = size;
            this.color = color;
            this.rotSpeed = (new Random().nextFloat() - 0.5f) * 720f;
        }
    }

    public static class FloatingText {
        public float x, y;
        public String text;
        public int color;
        public float life = 1f;
        public float vy = -70f;

        public FloatingText(float x, float y, String text, int color) {
            this.x = x;
            this.y = y;
            this.text = text;
            this.color = color;
        }
    }

    // --- Stato Globale del Gioco ---
    public State state = State.AIMING;
    public int currentLevel = 1;
    public int maxLevel = 10;
    public int score = 0;
    public int highScore = 0;
    public int ballsRemaining = 5;
    public int ballsInShotCount = 0;
    public int totalCubesDestroyed = 0;
    public int currentCombo = 0;
    public float aimAngle = (float) Math.PI / 2f; // Rivolto verso il basso (90 gradi)
    public boolean speedBoost = false;

    public final List<Ball> balls = new ArrayList<>();
    public final List<Cube> cubes = new ArrayList<>();
    public final Basket basket = new Basket();
    public final List<Shard> shards = new ArrayList<>();
    public final List<FloatingText> floatingTexts = new ArrayList<>();
    public final List<RelicType> activeRelics = new ArrayList<>();
    public final List<RelicType> draftChoices = new ArrayList<>();

    private boolean safetyNetAvailable = true;
    public float screenShake = 0f;
    public final Random random = new Random();

    // Event listener per riproduzione audio e haptic
    public interface GameEventListener {
        void onBounceHit(int combo);
        void onCubeShattered();
        void onBallCaught();
        void onExplosion();
        void onChainLightning();
        void onRelicChosen();
    }
    public GameEventListener listener = null;

    public Game() {
        initLevel(1);
    }

    public void initLevel(int level) {
        currentLevel = level;
        cubes.clear();
        balls.clear();
        shards.clear();
        floatingTexts.clear();
        currentCombo = 0;
        safetyNetAvailable = activeRelics.contains(RelicType.SAFETY_NET);

        // Se passiamo al livello successivo, ricarichiamo le sfere base (minimo 5)
        if (ballsRemaining < 5) {
            ballsRemaining = 5;
        }

        // Applica potenziamenti reliquie al cestello
        basket.width = activeRelics.contains(RelicType.MAGNETIC_BASKET) ? 245f : 180f;

        generateLevelGrid(level);
        state = State.AIMING;
    }

    public void restartGame() {
        if (score > highScore) {
            highScore = score;
        }
        score = 0;
        ballsRemaining = 5;
        activeRelics.clear();
        totalCubesDestroyed = 0;
        initLevel(1);
    }

    private void generateLevelGrid(int level) {
        float startY = 320f;
        int rows;
        int cols = 9;
        float cubeWidth = 84f;
        float cubeHeight = 56f;
        float paddingX = 26f;
        float paddingY = 24f;
        float totalGridW = cols * cubeWidth + (cols - 1) * paddingX;
        float startX = (VIRTUAL_WIDTH - totalGridW) / 2f;

        // Difficoltà e HP crescenti
        int baseHp = 1 + (level - 1) * 2; // Lv 1: 1-3 HP, Lv 5: 9-15 HP, Lv 10: 19-30 HP

        if (level == 5 || level == 10) {
            // LIVELLI BOSS
            generateBossLevel(level, startX, startY, cols, cubeWidth, cubeHeight, paddingX, paddingY);
            return;
        }

        rows = Math.min(4 + level, 8);

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                // Disposizione a scacchiera / motivi geometrici
                boolean placeCube = false;
                if (level == 1) {
                    placeCube = (r % 2 == 0) || (c % 2 == 0);
                } else if (level % 2 == 0) {
                    placeCube = (r + c) % 2 == 0 || (r == 0 || r == rows - 1);
                } else {
                    placeCube = (c >= 1 && c <= 7) && !(r == 1 && c == 4);
                }

                if (!placeCube) continue;

                float cx = startX + c * (cubeWidth + paddingX);
                float cy = startY + r * (cubeHeight + paddingY);

                // Determina tipologia di cubo
                CubeType type = CubeType.NORMAL;
                float roll = random.nextFloat();
                int cubeHp = baseHp + random.nextInt(Math.max(1, level));

                if (roll < 0.12f) {
                    type = CubeType.EXPLOSIVE;
                    cubeHp = Math.max(2, baseHp - 1);
                } else if (roll < 0.22f) {
                    type = CubeType.SPLITTER;
                    cubeHp = Math.max(2, baseHp);
                } else if (roll < 0.32f) {
                    type = CubeType.KINETIC;
                    cubeHp = Math.max(1, baseHp - 2);
                } else if (roll < 0.42f && level >= 3) {
                    type = CubeType.ARMOR;
                    cubeHp = baseHp * 2 + 2;
                } else if (roll < 0.50f && level >= 4) {
                    type = CubeType.SHIELD;
                    cubeHp = baseHp + 3;
                }

                cubes.add(new Cube(cx, cy, cubeWidth, cubeHeight, Math.max(1, cubeHp), type));
            }
        }
    }

    private void generateBossLevel(int level, float startX, float startY, int cols, float cubeWidth, float cubeHeight, float paddingX, float paddingY) {
        // Boss centrale gigante
        float bossW = 260f;
        float bossH = 180f;
        float bossX = (VIRTUAL_WIDTH - bossW) / 2f;
        float bossY = startY + 120f;
        int bossHp = (level == 5) ? 90 : 220;

        Cube boss = new Cube(bossX, bossY, bossW, bossH, bossHp, CubeType.BOSS);
        cubes.add(boss);

        // Satelliti difensivi attorno al boss
        int orbitCubes = (level == 5) ? 8 : 12;
        float orbitRadius = 260f;
        for (int i = 0; i < orbitCubes; i++) {
            double angle = (2 * Math.PI / orbitCubes) * i;
            float ox = boss.centerX() + (float) Math.cos(angle) * orbitRadius - cubeWidth / 2f;
            float oy = boss.centerY() + (float) Math.sin(angle) * orbitRadius - cubeHeight / 2f;
            CubeType type = (i % 2 == 0) ? CubeType.ARMOR : CubeType.EXPLOSIVE;
            cubes.add(new Cube(ox, oy, cubeWidth, cubeHeight, 10 + level * 2, type));
        }

        // Fila di barriera superiore
        for (int c = 1; c < cols - 1; c += 2) {
            float cx = startX + c * (cubeWidth + paddingX);
            float cy = startY;
            cubes.add(new Cube(cx, cy, cubeWidth, cubeHeight, 8 + level, CubeType.KINETIC));
        }
    }

    public void setAimAngle(float touchX, float touchY) {
        if (state != State.AIMING) return;
        float dx = touchX - CANNON_X;
        float dy = touchY - CANNON_Y;
        if (dy < 50f) dy = 50f; // Impedisci sparo all'indietro
        aimAngle = (float) Math.atan2(dy, dx);

        // Limita l'angolo a un cono di puntamento verso il basso
        float minAngle = (float) Math.toRadians(18);
        float maxAngle = (float) Math.toRadians(162);
        if (aimAngle < minAngle) aimAngle = minAngle;
        if (aimAngle > maxAngle) aimAngle = maxAngle;
    }

    public boolean shoot() {
        if (state != State.AIMING || ballsRemaining <= 0) return false;

        ballsRemaining--;
        ballsInShotCount = 1;
        currentCombo = 0;

        float speed = 1250f;
        if (activeRelics.contains(RelicType.HYPER_VELOCITY)) {
            speed *= 1.25f;
        }

        float vx = (float) Math.cos(aimAngle) * speed;
        float vy = (float) Math.sin(aimAngle) * speed;

        Ball b = new Ball(CANNON_X, CANNON_Y + 25f, vx, vy);
        if (activeRelics.contains(RelicType.HYPER_VELOCITY)) {
            b.baseDamage += 1f;
        }
        balls.add(b);
        state = State.BALL_IN_PLAY;
        return true;
    }

    public void update(float dt) {
        if (dt > 0.05f) dt = 0.05f; // Limite delta per stabilità fisica
        if (speedBoost && state == State.BALL_IN_PLAY) {
            dt *= 2.0f;
        }

        // Aggiorna scuotimento schermo
        if (screenShake > 0f) {
            screenShake -= dt * 25f;
            if (screenShake < 0f) screenShake = 0f;
        }

        // Aggiorna cestello
        basket.update(dt);

        // Aggiorna particelle schegge
        for (int i = shards.size() - 1; i >= 0; i--) {
            Shard s = shards.get(i);
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            s.vy += GRAVITY * 0.4f * dt;
            s.rotation += s.rotSpeed * dt;
            s.life -= dt * 1.8f;
            if (s.life <= 0f) {
                shards.remove(i);
            }
        }

        // Aggiorna testi fluttuanti
        for (int i = floatingTexts.size() - 1; i >= 0; i--) {
            FloatingText ft = floatingTexts.get(i);
            ft.y += ft.vy * dt;
            ft.life -= dt * 1.5f;
            if (ft.life <= 0f) {
                floatingTexts.remove(i);
            }
        }

        // Aggiorna animazioni cubi (wobble e hitFlash)
        for (Cube c : cubes) {
            if (c.wobble > 0f) {
                c.wobble -= dt * 6f;
                if (c.wobble < 0f) c.wobble = 0f;
            }
            if (c.hitFlash > 0f) {
                c.hitFlash -= dt * 8f;
                if (c.hitFlash < 0f) c.hitFlash = 0f;
            }
            if (c.type == CubeType.SHIELD) {
                c.shieldPulse = (c.shieldPulse + dt * 3f) % ((float) Math.PI * 2f);
            }
        }

        // Aggiorna fisica sfere se in gioco
        if (state == State.BALL_IN_PLAY) {
            updateBalls(dt);
        }
    }

    private void updateBalls(float dt) {
        List<Ball> newBalls = new ArrayList<>();

        for (int i = balls.size() - 1; i >= 0; i--) {
            Ball b = balls.get(i);
            if (!b.isAlive) {
                balls.remove(i);
                continue;
            }

            // Aggiungi scia
            b.trail.add(new float[]{b.x, b.y});
            if (b.trail.size() > 10) {
                b.trail.remove(0);
            }

            // Gravità
            b.vy += GRAVITY * dt;

            // Spostamento
            b.x += b.vx * dt;
            b.y += b.vy * dt;

            // Rimbalzo pareti laterali
            float leftWall = 25f;
            float rightWall = VIRTUAL_WIDTH - 25f;
            if (b.x - b.radius < leftWall) {
                b.x = leftWall + b.radius;
                b.vx = -b.vx * 0.95f;
            } else if (b.x + b.radius > rightWall) {
                b.x = rightWall - b.radius;
                b.vx = -b.vx * 0.95f;
            }

            // Rimbalzo soffitto
            float ceiling = 70f;
            if (b.y - b.radius < ceiling) {
                b.y = ceiling + b.radius;
                b.vy = Math.abs(b.vy) * 0.95f;
            }

            // Rete di sicurezza (Reliquia Safety Net)
            if (safetyNetAvailable && b.y + b.radius >= 1840f) {
                b.y = 1840f - b.radius;
                b.vy = -Math.abs(b.vy) * 1.1f;
                safetyNetAvailable = false;
                screenShake = 12f;
                floatingTexts.add(new FloatingText(b.x, b.y - 40, "RETE DI SICUREZZA!", 0xFF00E5FF));
                if (listener != null) listener.onBounceHit(1);
            }

            // Cattura nel cestello inferiore
            if (b.y + b.radius >= basket.y && b.y - b.radius <= basket.y + basket.height) {
                if (b.x >= basket.x - 10f && b.x <= basket.x + basket.width + 10f) {
                    // SFERA SALVATA!
                    b.isAlive = false;
                    ballsRemaining++;
                    score += 250 * Math.max(1, currentCombo);
                    floatingTexts.add(new FloatingText(b.x, basket.y - 50, "+1 SFERA! CATTURA!", 0xFF00FF88));
                    if (listener != null) listener.onBallCaught();

                    if (activeRelics.contains(RelicType.SUPERNOVA)) {
                        triggerSupernova(b.x);
                    }
                    continue;
                }
            }

            // Sfera caduta fuori dallo schermo
            if (b.y - b.radius > VIRTUAL_HEIGHT + 20f) {
                b.isAlive = false;
                if (activeRelics.contains(RelicType.SUPERNOVA)) {
                    triggerSupernova(b.x);
                }
                continue;
            }

            // Collisione con i cubi
            handleCubeCollisions(b, newBalls);
        }

        balls.addAll(newBalls);

        // Verifica se tutte le sfere del tiro sono terminate
        if (balls.isEmpty()) {
            checkRoundEnd();
        }
    }

    private void handleCubeCollisions(Ball b, List<Ball> newBalls) {
        boolean hasPiercing = activeRelics.contains(RelicType.PIERCING_RAIL);

        for (int j = cubes.size() - 1; j >= 0; j--) {
            Cube c = cubes.get(j);
            if (!c.isAlive) continue;

            // Test collisione Sfera - AABB Cubo
            float closestX = Math.max(c.x, Math.min(b.x, c.x + c.width));
            float closestY = Math.max(c.y, Math.min(b.y, c.y + c.height));
            float distX = b.x - closestX;
            float distY = b.y - closestY;
            float distSq = distX * distX + distY * distVy(distY);

            if (distSq <= b.radius * b.radius) {
                // COLLISIONE AVVENUTA!
                b.bounces++;
                currentCombo++;

                // Calcolo penetrazione e normale di collisione
                float overlapLeft = (b.x + b.radius) - c.x;
                float overlapRight = (c.x + c.width) - (b.x - b.radius);
                float overlapTop = (b.y + b.radius) - c.y;
                float overlapBottom = (c.y + c.height) - (b.y - b.radius);

                float minOverlap = Math.min(Math.min(overlapLeft, overlapRight), Math.min(overlapTop, overlapBottom));

                boolean pierceThrough = hasPiercing && c.hp <= 2 && c.type != CubeType.BOSS;

                if (!pierceThrough) {
                    if (minOverlap == overlapLeft) {
                        b.x = c.x - b.radius;
                        b.vx = -Math.abs(b.vx);
                    } else if (minOverlap == overlapRight) {
                        b.x = c.x + c.width + b.radius;
                        b.vx = Math.abs(b.vx);
                    } else if (minOverlap == overlapTop) {
                        b.y = c.y - b.radius;
                        b.vy = -Math.abs(b.vy);
                    } else {
                        b.y = c.y + c.height + b.radius;
                        b.vy = Math.abs(b.vy);
                    }

                    // Aggiungi leggera componente orizzontale casuale per evitare rimbalzi verticali infiniti
                    b.vx += (random.nextFloat() - 0.5f) * 40f;
                }

                // Calcolo Danno con Reliquie e Sinergie
                float damage = b.baseDamage;

                // Sinergia 1: Kinetic Surge (+1 danno per ogni rimbalzo nel tiro)
                if (activeRelics.contains(RelicType.KINETIC_SURGE)) {
                    damage += (b.bounces - 1);
                }

                // Sinergia 2: Kinetic Booster Cube
                if (c.type == CubeType.KINETIC) {
                    damage += 2f;
                    b.vx *= 1.35f;
                    b.vy *= 1.35f;
                    floatingTexts.add(new FloatingText(c.centerX(), c.centerY() - 30, "KINETIC BOOST!", 0xFFFFE600));
                }

                // Sinergia 3: Heavy Mass (+3 vs Armor / Boss)
                if (activeRelics.contains(RelicType.HEAVY_MASS) && (c.type == CubeType.ARMOR || c.type == CubeType.BOSS)) {
                    damage += 3f;
                }

                // Sinergia 4: Colpo Critico
                boolean isCrit = false;
                if (activeRelics.contains(RelicType.CRITICAL_OVERDRIVE) && random.nextFloat() < 0.25f) {
                    damage *= 3f;
                    isCrit = true;
                    screenShake = Math.max(screenShake, 14f);
                    floatingTexts.add(new FloatingText(c.centerX(), c.centerY() - 40, "CRIT! x3", 0xFFFF007F));
                }

                // Verifica protezione scudo da vicini
                boolean isShielded = isCubeProtectedByShield(c);
                if (isShielded) {
                    damage = Math.max(1f, damage * 0.5f);
                }

                int finalDamage = Math.max(1, Math.round(damage));
                c.hp -= finalDamage;
                c.wobble = 1f;
                c.hitFlash = 1f;

                score += 50 * currentCombo;
                floatingTexts.add(new FloatingText(c.centerX(), c.centerY(), "-" + finalDamage, isCrit ? 0xFFFF007F : 0xFF00E5FF));

                if (listener != null) {
                    listener.onBounceHit(currentCombo);
                }

                // Sinergia 5: Chain Lightning
                if (activeRelics.contains(RelicType.CHAIN_LIGHTNING) && (b.bounces % 2 == 0)) {
                    triggerChainLightning(c);
                }

                // Sinergia 6: Bouncing Bomb all'8° rimbalzo
                if (activeRelics.contains(RelicType.BOUNCING_BOMB) && b.bounces == 8) {
                    triggerExplosion(b.x, b.y, 220f, 10);
                    floatingTexts.add(new FloatingText(b.x, b.y - 50, "BOUNCING BOMB!", 0xFFFF6B00));
                }

                // Sinergia 7: Prismatic Echo ogni 5 colpi
                if (activeRelics.contains(RelicType.PRISMATIC_ECHO) && (currentCombo % 5 == 0)) {
                    triggerExplosion(c.centerX(), c.centerY(), 160f, 5);
                }

                // Se il cubo viene distrutto
                if (c.hp <= 0) {
                    c.isAlive = false;
                    totalCubesDestroyed++;
                    score += 200 * currentCombo;
                    spawnCubeShards(c);

                    if (listener != null) {
                        listener.onCubeShattered();
                    }

                    // Cubo Esplosivo -> Detonazione
                    if (c.type == CubeType.EXPLOSIVE) {
                        triggerExplosion(c.centerX(), c.centerY(), 240f, 6);
                        screenShake = 16f;
                    }

                    // Cubo Splitter -> Genera 2 mini-sfere
                    if (c.type == CubeType.SPLITTER) {
                        spawnMiniBalls(c.centerX(), c.centerY(), newBalls);
                    }

                    // Sinergia 8: Shrapnel Burst
                    if (activeRelics.contains(RelicType.SHRAPNEL_BURST)) {
                        triggerShrapnel(c.centerX(), c.centerY());
                    }

                    // Sinergia 9: Multiball Reactor
                    if (activeRelics.contains(RelicType.MULTIBALL_REACTOR) && random.nextFloat() < 0.25f) {
                        spawnMiniBalls(c.centerX(), c.centerY(), newBalls);
                        floatingTexts.add(new FloatingText(c.centerX(), c.centerY() - 40, "MULTIBALL!", 0xFFA855F7));
                    }
                }
                break; // Un rimbalzo per frame di collisione
            }
        }
    }

    private float distVy(float dy) {
        return dy;
    }

    private boolean isCubeProtectedByShield(Cube target) {
        if (target.type == CubeType.SHIELD) return false;
        for (Cube c : cubes) {
            if (c.isAlive && c.type == CubeType.SHIELD && c != target) {
                float dx = c.centerX() - target.centerX();
                float dy = c.centerY() - target.centerY();
                if (dx * dx + dy * dy < 280f * 280f) {
                    return true;
                }
            }
        }
        return false;
    }

    private void triggerChainLightning(Cube origin) {
        int zaps = 0;
        for (Cube c : cubes) {
            if (c.isAlive && c != origin) {
                float dx = c.centerX() - origin.centerX();
                float dy = c.centerY() - origin.centerY();
                if (dx * dx + dy * dy < 450f * 450f) {
                    c.hp -= 3;
                    c.hitFlash = 1f;
                    c.wobble = 1f;
                    floatingTexts.add(new FloatingText(c.centerX(), c.centerY(), "ZAP -3", 0xFFFFE600));
                    spawnSparks(c.centerX(), c.centerY(), 0xFFFFE600, 6);
                    zaps++;
                    if (c.hp <= 0) {
                        c.isAlive = false;
                        spawnCubeShards(c);
                    }
                    if (zaps >= 2) break;
                }
            }
        }
        if (listener != null && zaps > 0) {
            listener.onChainLightning();
        }
    }

    private void triggerExplosion(float ex, float ey, float radius, int damage) {
        for (Cube c : cubes) {
            if (c.isAlive) {
                float dx = c.centerX() - ex;
                float dy = c.centerY() - ey;
                if (dx * dx + dy * dy <= radius * radius) {
                    c.hp -= damage;
                    c.hitFlash = 1f;
                    c.wobble = 1.2f;
                    floatingTexts.add(new FloatingText(c.centerX(), c.centerY(), "BOOM -" + damage, 0xFFFF6B00));
                    if (c.hp <= 0) {
                        c.isAlive = false;
                        spawnCubeShards(c);
                    }
                }
            }
        }
        spawnSparks(ex, ey, 0xFFFF6B00, 18);
        if (listener != null) {
            listener.onExplosion();
        }
    }

    private void triggerShrapnel(float sx, float sy) {
        // Lancia schegge penetranti che infliggono danno ai cubi vicini
        float[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        for (float[] d : dirs) {
            for (Cube c : cubes) {
                if (c.isAlive) {
                    float dx = c.centerX() - sx;
                    float dy = c.centerY() - sy;
                    // Proietta lungo la direzione
                    float dot = dx * d[0] + dy * d[1];
                    if (dot > 0 && Math.abs(dx * d[1] - dy * d[0]) < 60f && dot < 350f) {
                        c.hp -= 2;
                        c.hitFlash = 0.8f;
                        floatingTexts.add(new FloatingText(c.centerX(), c.centerY(), "SHRAPNEL -2", 0xFFFF007F));
                        if (c.hp <= 0) {
                            c.isAlive = false;
                            spawnCubeShards(c);
                        }
                        break;
                    }
                }
            }
        }
    }

    private void triggerSupernova(float x) {
        screenShake = 14f;
        // Danneggia tutti i cubi nella colonna sopra l'impatto
        for (Cube c : cubes) {
            if (c.isAlive && Math.abs(c.centerX() - x) < 90f) {
                c.hp -= 8;
                c.hitFlash = 1f;
                c.wobble = 1.2f;
                floatingTexts.add(new FloatingText(c.centerX(), c.centerY(), "SUPERNOVA -8", 0xFF00FF88));
                if (c.hp <= 0) {
                    c.isAlive = false;
                    spawnCubeShards(c);
                }
            }
        }
        spawnSparks(x, 1750f, 0xFF00FF88, 20);
        if (listener != null) listener.onExplosion();
    }

    private void spawnMiniBalls(float x, float y, List<Ball> outList) {
        float speed = 900f;
        Ball b1 = new Ball(x, y - 10f, -speed * 0.7f, -speed * 0.7f);
        b1.radius = 12f;
        b1.isMini = true;
        b1.baseDamage = 1f;

        Ball b2 = new Ball(x, y - 10f, speed * 0.7f, -speed * 0.7f);
        b2.radius = 12f;
        b2.isMini = true;
        b2.baseDamage = 1f;

        outList.add(b1);
        outList.add(b2);
    }

    private void spawnCubeShards(Cube c) {
        int color;
        switch (c.type) {
            case EXPLOSIVE: color = 0xFFFF6B00; break;
            case SPLITTER:  color = 0xFFA855F7; break;
            case KINETIC:   color = 0xFFFFE600; break;
            case SHIELD:    color = 0xFF00FF88; break;
            case ARMOR:     color = 0xFF3B82F6; break;
            case BOSS:      color = 0xFFFF007F; break;
            default:        color = 0xFF00E5FF; break;
        }

        int count = (c.type == CubeType.BOSS) ? 36 : 12;
        for (int i = 0; i < count; i++) {
            float angle = random.nextFloat() * (float) Math.PI * 2f;
            float speed = 150f + random.nextFloat() * 450f;
            float vx = (float) Math.cos(angle) * speed;
            float vy = (float) Math.sin(angle) * speed;
            float size = 8f + random.nextFloat() * 14f;
            shards.add(new Shard(c.centerX(), c.centerY(), vx, vy, size, color));
        }
    }

    private void spawnSparks(float x, float y, int color, int count) {
        for (int i = 0; i < count; i++) {
            float angle = random.nextFloat() * (float) Math.PI * 2f;
            float speed = 100f + random.nextFloat() * 300f;
            shards.add(new Shard(x, y, (float) Math.cos(angle) * speed, (float) Math.sin(angle) * speed, 6f, color));
        }
    }

    private void checkRoundEnd() {
        // Conta quanti cubi rimangono
        int aliveCount = 0;
        boolean bossAlive = false;
        for (Cube c : cubes) {
            if (c.isAlive) {
                aliveCount++;
                if (c.type == CubeType.BOSS) {
                    bossAlive = true;
                }
            }
        }

        boolean levelWon = (aliveCount == 0) || (currentLevel % 5 == 0 && !bossAlive);

        if (levelWon) {
            // LIVELLO COMPLETATO!
            score += 1000 * currentLevel;
            if (score > highScore) highScore = score;

            if (currentLevel >= maxLevel) {
                state = State.VICTORY;
            } else {
                prepareRelicDraft();
            }
        } else {
            // Livello non ancora vinto: controlla se abbiamo ancora sfere
            if (ballsRemaining <= 0) {
                // SFERE ESAURITE -> GAME OVER
                if (score > highScore) highScore = score;
                state = State.GAME_OVER;
            } else {
                // Ancora sfere a disposizione: torna alla modalità di mira
                state = State.AIMING;
            }
        }
    }

    public void prepareRelicDraft() {
        draftChoices.clear();
        List<RelicType> available = new ArrayList<>();
        for (RelicType r : RelicType.values()) {
            if (!activeRelics.contains(r)) {
                available.add(r);
            }
        }
        Collections.shuffle(available, random);
        for (int i = 0; i < Math.min(3, available.size()); i++) {
            draftChoices.add(available.get(i));
        }
        state = State.RELIC_DRAFT;
    }

    public void selectRelic(RelicType relic) {
        if (state != State.RELIC_DRAFT) return;
        activeRelics.add(relic);
        if (listener != null) listener.onRelicChosen();
        initLevel(currentLevel + 1);
    }
}
