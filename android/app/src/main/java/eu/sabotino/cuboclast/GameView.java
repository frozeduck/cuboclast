package eu.sabotino.cuboclast;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.DashPathEffect;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
import android.os.SystemClock;
import android.os.Vibrator;
import android.view.MotionEvent;
import android.view.SurfaceHolder;
import android.view.SurfaceView;

import java.util.List;

public class GameView extends SurfaceView implements SurfaceHolder.Callback, Runnable {
    public final Game game;
    private Thread gameThread = null;
    private volatile boolean isRunning = false;
    public volatile boolean paused = false;

    private float scale = 1f;
    private float offsetX = 0f;
    private float offsetY = 0f;
    private final Vibrator vibrator;

    // Colori Tavolozza Minimalista Neon
    private static final int COLOR_BG = 0xFF090D16;
    private static final int COLOR_GRID = 0xFF141D2D;
    private static final int COLOR_WALL = 0xFF1E2E48;
    private static final int COLOR_WALL_GLOW = 0xFF00E5FF;
    private static final int COLOR_CANNON = 0xFF00E5FF;
    private static final int COLOR_AIM_LINE = 0x8800E5FF;

    // Paints di rendering pre-allocati per massima fluidità a 60/120 FPS
    private final Paint bgPaint = new Paint();
    private final Paint linePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint fillPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint strokePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint textPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint aimPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint cardPaint = new Paint(Paint.ANTI_ALIAS_FLAG);

    private final RectF tempRect = new RectF();
    private final Path tempPath = new Path();

    // Riquadri pulsanti HUD in coordinate virtuali
    private final RectF speedBtnRect = new RectF(Game.VIRTUAL_WIDTH - 280f, 30f, Game.VIRTUAL_WIDTH - 160f, 90f);
    private final RectF soundBtnRect = new RectF(Game.VIRTUAL_WIDTH - 140f, 30f, Game.VIRTUAL_WIDTH - 30f, 90f);
    private final RectF restartBtnRect = new RectF(Game.VIRTUAL_WIDTH / 2f - 180f, 1150f, Game.VIRTUAL_WIDTH / 2f + 180f, 1260f);

    public GameView(Context context) {
        super(context);
        getHolder().addCallback(this);
        setFocusable(true);

        vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
        game = new Game();

        // Collega gli eventi di gioco all'Audio procedurale e Haptic
        game.listener = new Game.GameEventListener() {
            @Override
            public void onBounceHit(int combo) {
                AudioHelper.playBounceHit(combo);
                vibrate(12);
            }

            @Override
            public void onCubeShattered() {
                AudioHelper.playCubeShatter();
                vibrate(28);
            }

            @Override
            public void onBallCaught() {
                AudioHelper.playCatch();
                vibrate(40);
            }

            @Override
            public void onExplosion() {
                AudioHelper.playExplosion();
                vibrate(60);
            }

            @Override
            public void onChainLightning() {
                AudioHelper.playChainZap();
                vibrate(20);
            }

            @Override
            public void onRelicChosen() {
                AudioHelper.playRelicSelect();
                vibrate(35);
            }
        };

        // Inizializza stili di pittura
        bgPaint.setColor(COLOR_BG);
        aimPaint.setColor(COLOR_AIM_LINE);
        aimPaint.setStrokeWidth(4f);
        aimPaint.setStyle(Paint.Style.STROKE);
        aimPaint.setPathEffect(new DashPathEffect(new float[]{16f, 14f}, 0));
    }

    private void vibrate(long ms) {
        try {
            if (vibrator != null && vibrator.hasVibrator()) {
                vibrator.vibrate(ms);
            }
        } catch (Throwable ignored) {
        }
    }

    @Override
    public void surfaceCreated(SurfaceHolder holder) {
        resume();
    }

    @Override
    public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
        // Calcola scala uniforme per mantenere il corretto aspect ratio 9:16
        float scaleX = (float) width / Game.VIRTUAL_WIDTH;
        float scaleY = (float) height / Game.VIRTUAL_HEIGHT;
        scale = Math.min(scaleX, scaleY);
        offsetX = (width - Game.VIRTUAL_WIDTH * scale) / 2f;
        offsetY = (height - Game.VIRTUAL_HEIGHT * scale) / 2f;
    }

    @Override
    public void surfaceDestroyed(SurfaceHolder holder) {
        pause();
    }

    public void pause() {
        isRunning = false;
        try {
            if (gameThread != null) {
                gameThread.join(800);
                gameThread = null;
            }
        } catch (InterruptedException ignored) {
        }
    }

    public void resume() {
        if (!isRunning) {
            isRunning = true;
            gameThread = new Thread(this);
            gameThread.start();
        }
    }

    public void togglePause() {
        paused = !paused;
    }

    @Override
    public void run() {
        long lastTime = SystemClock.elapsedRealtime();

        while (isRunning) {
            long now = SystemClock.elapsedRealtime();
            float dt = (now - lastTime) / 1000f;
            lastTime = now;

            if (!paused) {
                game.update(dt);
            }

            SurfaceHolder holder = getHolder();
            if (holder != null && holder.getSurface().isValid()) {
                Canvas canvas = holder.lockCanvas();
                if (canvas != null) {
                    try {
                        render(canvas);
                    } finally {
                        holder.unlockCanvasAndPost(canvas);
                    }
                }
            }

            // Target 60 FPS (~16ms frame time)
            long elapsed = SystemClock.elapsedRealtime() - now;
            long sleepTime = 16 - elapsed;
            if (sleepTime > 0) {
                try {
                    Thread.sleep(sleepTime);
                } catch (InterruptedException ignored) {
                }
            }
        }
    }

    private void render(Canvas canvas) {
        // Sfondo esterno
        canvas.drawColor(0xFF04060A);

        // Applica trasformazione al virtual viewport con screen shake
        canvas.save();
        float shakeX = (game.screenShake > 0) ? (game.random.nextFloat() - 0.5f) * game.screenShake : 0;
        float shakeY = (game.screenShake > 0) ? (game.random.nextFloat() - 0.5f) * game.screenShake : 0;
        canvas.translate(offsetX + shakeX, offsetY + shakeY);
        canvas.scale(scale, scale);

        // Clip all'area di gioco virtuale
        canvas.clipRect(0, 0, Game.VIRTUAL_WIDTH, Game.VIRTUAL_HEIGHT);

        // 1. Sfondo e Griglia minimale
        drawBackground(canvas);

        // 2. Traiettoria di puntamento se in mira
        if (game.state == Game.State.AIMING) {
            drawAimTrajectory(canvas);
        }

        // 3. Cubi
        drawCubes(canvas);

        // 4. Cestello inferiore
        drawBasket(canvas);

        // 5. Particelle e Schegge
        drawShards(canvas);

        // 6. Sfere e scie
        drawBalls(canvas);

        // 7. Cannone superiore
        drawCannon(canvas);

        // 8. Testi fluttuanti di danno / combo
        drawFloatingTexts(canvas);

        // 9. Overlay HUD (Livello, Punti, Sfere, Pulsanti)
        drawHUD(canvas);

        // 10. Schermate modali (Draft Reliquie, Game Over, Vittoria)
        if (game.state == Game.State.RELIC_DRAFT) {
            drawRelicDraftModal(canvas);
        } else if (game.state == Game.State.GAME_OVER) {
            drawGameOverModal(canvas);
        } else if (game.state == Game.State.VICTORY) {
            drawVictoryModal(canvas);
        }

        canvas.restore();
    }

    private void drawBackground(Canvas canvas) {
        // Rettangolo principale di gioco
        canvas.drawRect(0, 0, Game.VIRTUAL_WIDTH, Game.VIRTUAL_HEIGHT, bgPaint);

        // Griglia geometrica ultra-sottile
        strokePaint.setStyle(Paint.Style.STROKE);
        strokePaint.setStrokeWidth(1.5f);
        strokePaint.setColor(COLOR_GRID);

        for (float x = 60f; x < Game.VIRTUAL_WIDTH; x += 120f) {
            canvas.drawLine(x, 0, x, Game.VIRTUAL_HEIGHT, strokePaint);
        }
        for (float y = 60f; y < Game.VIRTUAL_HEIGHT; y += 120f) {
            canvas.drawLine(0, y, Game.VIRTUAL_WIDTH, y, strokePaint);
        }

        // Cornice perimetrale al neon
        strokePaint.setColor(COLOR_WALL);
        strokePaint.setStrokeWidth(8f);
        canvas.drawRect(4, 4, Game.VIRTUAL_WIDTH - 4, Game.VIRTUAL_HEIGHT - 4, strokePaint);

        strokePaint.setColor(COLOR_WALL_GLOW);
        strokePaint.setStrokeWidth(2.5f);
        canvas.drawRect(6, 6, Game.VIRTUAL_WIDTH - 6, Game.VIRTUAL_HEIGHT - 6, strokePaint);
    }

    private void drawCannon(Canvas canvas) {
        float cx = Game.CANNON_X;
        float cy = Game.CANNON_Y;

        // Base circolare cannone
        fillPaint.setStyle(Paint.Style.FILL);
        fillPaint.setColor(0xFF141D2D);
        canvas.drawCircle(cx, cy, 42f, fillPaint);

        strokePaint.setStyle(Paint.Style.STROKE);
        strokePaint.setStrokeWidth(4f);
        strokePaint.setColor(COLOR_CANNON);
        canvas.drawCircle(cx, cy, 42f, strokePaint);

        // Canna rotante
        float barrelLen = 52f;
        float barrelX = cx + (float) Math.cos(game.aimAngle) * barrelLen;
        float barrelY = cy + (float) Math.sin(game.aimAngle) * barrelLen;

        strokePaint.setStrokeWidth(12f);
        strokePaint.setColor(0xFF00E5FF);
        strokePaint.setStrokeCap(Paint.Cap.ROUND);
        canvas.drawLine(cx, cy, barrelX, barrelY, strokePaint);

        // Cuore energetico centrale
        fillPaint.setColor(0xFFFFFFFF);
        canvas.drawCircle(cx, cy, 14f, fillPaint);
    }

    private void drawAimTrajectory(Canvas canvas) {
        float startX = Game.CANNON_X + (float) Math.cos(game.aimAngle) * 55f;
        float startY = Game.CANNON_Y + (float) Math.sin(game.aimAngle) * 55f;

        // Traccia raggio fino al primo ostacolo o parete
        float rayLen = 520f;
        float targetX = startX + (float) Math.cos(game.aimAngle) * rayLen;
        float targetY = startY + (float) Math.sin(game.aimAngle) * rayLen;

        canvas.drawLine(startX, startY, targetX, targetY, aimPaint);

        // Pallini luminosi lungo la traiettoria
        fillPaint.setStyle(Paint.Style.FILL);
        fillPaint.setColor(0xCC00E5FF);
        for (float t = 0.15f; t <= 1.0f; t += 0.12f) {
            float px = startX + (targetX - startX) * t;
            float py = startY + (targetY - startY) * t;
            canvas.drawCircle(px, py, 5f + t * 3f, fillPaint);
        }
    }

    private void drawCubes(Canvas canvas) {
        for (Game.Cube c : game.cubes) {
            if (!c.isAlive) continue;

            // Wobble scale effect
            float wScale = 1.0f + c.wobble * 0.18f;
            float hScale = 1.0f - c.wobble * 0.14f;
            float cx = c.centerX();
            float cy = c.centerY();
            float halfW = (c.width * wScale) / 2f;
            float halfH = (c.height * hScale) / 2f;

            tempRect.set(cx - halfW, cy - halfH, cx + halfW, cy + halfH);

            int baseColor;
            int strokeColor;
            switch (c.type) {
                case EXPLOSIVE:
                    baseColor = 0xFF351A08;
                    strokeColor = 0xFFFF6B00;
                    break;
                case SPLITTER:
                    baseColor = 0xFF2B0F3A;
                    strokeColor = 0xFFA855F7;
                    break;
                case KINETIC:
                    baseColor = 0xFF353008;
                    strokeColor = 0xFFFFE600;
                    break;
                case SHIELD:
                    baseColor = 0xFF08351E;
                    strokeColor = 0xFF00FF88;
                    break;
                case ARMOR:
                    baseColor = 0xFF0E1A38;
                    strokeColor = 0xFF3B82F6;
                    break;
                case BOSS:
                    baseColor = 0xFF36081E;
                    strokeColor = 0xFFFF007F;
                    break;
                default:
                    baseColor = 0xFF082635;
                    strokeColor = 0xFF00E5FF;
                    break;
            }

            // Sfondo Cubo
            fillPaint.setStyle(Paint.Style.FILL);
            fillPaint.setColor(baseColor);
            canvas.drawRoundRect(tempRect, 12f, 12f, fillPaint);

            // Bordo al neon
            strokePaint.setStyle(Paint.Style.STROKE);
            strokePaint.setStrokeWidth(3.5f);
            strokePaint.setColor(strokeColor);
            canvas.drawRoundRect(tempRect, 12f, 12f, strokePaint);

            // Se colpito di recente: hit flash bianco
            if (c.hitFlash > 0f) {
                fillPaint.setColor(Color.argb((int) (c.hitFlash * 180), 255, 255, 255));
                canvas.drawRoundRect(tempRect, 12f, 12f, fillPaint);
            }

            // Testo HP al centro
            textPaint.setTextAlign(Paint.Align.CENTER);
            textPaint.setColor(0xFFFFFFFF);
            textPaint.setFakeBoldText(true);
            textPaint.setTextSize((c.type == Game.CubeType.BOSS) ? 44f : 24f);

            // Posiziona numero verticalmente centrato
            Paint.FontMetrics fm = textPaint.getFontMetrics();
            float textY = cy - (fm.ascent + fm.descent) / 2f;
            canvas.drawText(String.valueOf(c.hp), cx, textY, textPaint);

            // Se boss: barra vitale superiore e nome
            if (c.type == Game.CubeType.BOSS) {
                float barW = 320f;
                float barH = 14f;
                float barX = cx - barW / 2f;
                float barY = cy - halfH - 32f;

                fillPaint.setColor(0xFF1E2E48);
                canvas.drawRect(barX, barY, barX + barW, barY + barH, fillPaint);

                float hpRatio = (float) c.hp / c.maxHp;
                fillPaint.setColor(0xFFFF007F);
                canvas.drawRect(barX, barY, barX + barW * hpRatio, barY + barH, fillPaint);

                strokePaint.setColor(0xFFFFFFFF);
                strokePaint.setStrokeWidth(2f);
                canvas.drawRect(barX, barY, barX + barW, barY + barH, strokePaint);
            }
        }
    }

    private void drawBasket(Canvas canvas) {
        Game.Basket b = game.basket;
        tempRect.set(b.x, b.y, b.x + b.width, b.y + b.height);

        // Fondo del cestello
        fillPaint.setStyle(Paint.Style.FILL);
        fillPaint.setColor(0xFF0F2538);
        canvas.drawRoundRect(tempRect, 10f, 10f, fillPaint);

        // Bordo neon ciano
        strokePaint.setStyle(Paint.Style.STROKE);
        strokePaint.setStrokeWidth(3.5f);
        strokePaint.setColor(0xFF00FF88);
        canvas.drawRoundRect(tempRect, 10f, 10f, strokePaint);

        // Linea centrale di cattura
        strokePaint.setColor(0xFFFFFFFF);
        strokePaint.setStrokeWidth(2f);
        canvas.drawLine(b.x + 20f, b.y + b.height / 2f, b.x + b.width - 20f, b.y + b.height / 2f, strokePaint);

        // Se cestello magnetico: onde energetiche sopra
        if (game.activeRelics.contains(Game.RelicType.MAGNETIC_BASKET)) {
            strokePaint.setColor(0x8800E5FF);
            strokePaint.setStrokeWidth(2f);
            canvas.drawArc(b.x + 10f, b.y - 35f, b.x + b.width - 10f, b.y + 15f, 180, 180, false, strokePaint);
        }
    }

    private void drawBalls(Canvas canvas) {
        for (Game.Ball b : game.balls) {
            if (!b.isAlive) continue;

            // Disegna scia di movimento (motion trail)
            if (b.trail.size() > 1) {
                linePaint.setStyle(Paint.Style.STROKE);
                linePaint.setStrokeCap(Paint.Cap.ROUND);
                for (int i = 0; i < b.trail.size() - 1; i++) {
                    float[] p1 = b.trail.get(i);
                    float[] p2 = b.trail.get(i + 1);
                    float ratio = (float) i / b.trail.size();
                    linePaint.setStrokeWidth(b.radius * 1.4f * ratio);
                    linePaint.setColor(Color.argb((int) (ratio * 160), 0, 229, 255));
                    canvas.drawLine(p1[0], p1[1], p2[0], p2[1], linePaint);
                }
            }

            // Sfera principale
            fillPaint.setStyle(Paint.Style.FILL);
            fillPaint.setColor(b.isMini ? 0xFFA855F7 : 0xFF00E5FF);
            canvas.drawCircle(b.x, b.y, b.radius, fillPaint);

            // Alone esterno brillante
            strokePaint.setStyle(Paint.Style.STROKE);
            strokePaint.setStrokeWidth(2.5f);
            strokePaint.setColor(0xFFFFFFFF);
            canvas.drawCircle(b.x, b.y, b.radius, strokePaint);

            // Punto luce riflesso
            fillPaint.setColor(0xFFFFFFFF);
            canvas.drawCircle(b.x - b.radius * 0.35f, b.y - b.radius * 0.35f, b.radius * 0.35f, fillPaint);
        }
    }

    private void drawShards(Canvas canvas) {
        fillPaint.setStyle(Paint.Style.FILL);
        for (Game.Shard s : game.shards) {
            fillPaint.setColor(s.color);
            fillPaint.setAlpha((int) (Math.max(0f, Math.min(1f, s.life)) * 255));

            canvas.save();
            canvas.translate(s.x, s.y);
            canvas.rotate(s.rotation);
            float h = s.size / 2f;
            canvas.drawRect(-h, -h, h, h, fillPaint);
            canvas.restore();
        }
    }

    private void drawFloatingTexts(Canvas canvas) {
        textPaint.setTextAlign(Paint.Align.CENTER);
        textPaint.setFakeBoldText(true);
        textPaint.setTextSize(28f);

        for (Game.FloatingText ft : game.floatingTexts) {
            textPaint.setColor(ft.color);
            textPaint.setAlpha((int) (Math.max(0f, Math.min(1f, ft.life)) * 255));
            canvas.drawText(ft.text, ft.x, ft.y, textPaint);
        }
    }

    private void drawHUD(Canvas canvas) {
        // Badge Livello / Settore in alto a sinistra
        fillPaint.setStyle(Paint.Style.FILL);
        fillPaint.setColor(0xDD141D2D);
        tempRect.set(30f, 30f, 290f, 90f);
        canvas.drawRoundRect(tempRect, 10f, 10f, fillPaint);

        strokePaint.setStyle(Paint.Style.STROKE);
        strokePaint.setStrokeWidth(2.5f);
        strokePaint.setColor(COLOR_WALL_GLOW);
        canvas.drawRoundRect(tempRect, 10f, 10f, strokePaint);

        textPaint.setTextAlign(Paint.Align.LEFT);
        textPaint.setColor(0xFFFFFFFF);
        textPaint.setTextSize(26f);
        textPaint.setFakeBoldText(true);
        canvas.drawText("SETTORE " + game.currentLevel + "/" + game.maxLevel, 50f, 68f, textPaint);

        // Punteggio in alto al centro
        textPaint.setTextAlign(Paint.Align.CENTER);
        textPaint.setTextSize(34f);
        textPaint.setColor(0xFFFFE600);
        canvas.drawText(String.format("SCORE %,d", game.score), Game.VIRTUAL_WIDTH / 2f, 70f, textPaint);

        // Pulsante Velocità [>> 2X]
        fillPaint.setColor(game.speedBoost ? 0xFFFF007F : 0xDD141D2D);
        canvas.drawRoundRect(speedBtnRect, 10f, 10f, fillPaint);
        strokePaint.setColor(game.speedBoost ? 0xFFFFFFFF : COLOR_WALL_GLOW);
        canvas.drawRoundRect(speedBtnRect, 10f, 10f, strokePaint);

        textPaint.setTextAlign(Paint.Align.CENTER);
        textPaint.setTextSize(24f);
        textPaint.setColor(0xFFFFFFFF);
        canvas.drawText(game.speedBoost ? "2X >>" : "1X >", speedBtnRect.centerX(), speedBtnRect.centerY() + 8f, textPaint);

        // Pulsante Audio [♪ / ✕]
        fillPaint.setColor(AudioHelper.isSoundEnabled() ? 0xDD141D2D : 0xFF4A1020);
        canvas.drawRoundRect(soundBtnRect, 10f, 10f, fillPaint);
        strokePaint.setColor(AudioHelper.isSoundEnabled() ? COLOR_WALL_GLOW : 0xFFFF007F);
        canvas.drawRoundRect(soundBtnRect, 10f, 10f, strokePaint);

        canvas.drawText(AudioHelper.isSoundEnabled() ? "♪ ON" : "♪ OFF", soundBtnRect.centerX(), soundBtnRect.centerY() + 8f, textPaint);

        // Contatore Sfere Rimanenti in basso a sinistra
        fillPaint.setColor(0xDD141D2D);
        tempRect.set(30f, 1835f, 320f, 1895f);
        canvas.drawRoundRect(tempRect, 10f, 10f, fillPaint);

        textPaint.setTextAlign(Paint.Align.LEFT);
        textPaint.setColor(0xFF00E5FF);
        textPaint.setTextSize(24f);
        canvas.drawText("SFERE: " + game.ballsRemaining, 50f, 1872f, textPaint);

        // Icone pallini sfere rimanenti
        fillPaint.setColor(0xFF00E5FF);
        for (int i = 0; i < Math.min(game.ballsRemaining, 6); i++) {
            canvas.drawCircle(190f + i * 20f, 1865f, 6f, fillPaint);
        }

        // Reliquie Attive in basso a destra
        if (!game.activeRelics.isEmpty()) {
            textPaint.setTextAlign(Paint.Align.RIGHT);
            textPaint.setColor(0xFFA855F7);
            textPaint.setTextSize(22f);
            canvas.drawText("RELIQUIE: " + game.activeRelics.size(), Game.VIRTUAL_WIDTH - 40f, 1872f, textPaint);
        }
    }

    private void drawRelicDraftModal(Canvas canvas) {
        // Oscura sfondo
        fillPaint.setStyle(Paint.Style.FILL);
        fillPaint.setColor(0xEE080B12);
        canvas.drawRect(0, 0, Game.VIRTUAL_WIDTH, Game.VIRTUAL_HEIGHT, fillPaint);

        // Titolo
        textPaint.setTextAlign(Paint.Align.CENTER);
        textPaint.setTextSize(46f);
        textPaint.setColor(0xFF00E5FF);
        textPaint.setFakeBoldText(true);
        canvas.drawText("SCEGLI UNA RELIQUIA ROGUELIKE", Game.VIRTUAL_WIDTH / 2f, 380f, textPaint);

        textPaint.setTextSize(26f);
        textPaint.setColor(0xFF94A3B8);
        textPaint.setFakeBoldText(false);
        canvas.drawText("Potenzia il tuo arsenale per superare il prossimo settore", Game.VIRTUAL_WIDTH / 2f, 430f, textPaint);

        // 3 Carte da scegliere disposte verticalmente
        float cardW = 900f;
        float cardH = 190f;
        float startX = (Game.VIRTUAL_WIDTH - cardW) / 2f;
        float startY = 520f;
        float gapY = 220f;

        for (int i = 0; i < game.draftChoices.size(); i++) {
            Game.RelicType relic = game.draftChoices.get(i);
            float cy = startY + i * gapY;
            tempRect.set(startX, cy, startX + cardW, cy + cardH);

            cardPaint.setStyle(Paint.Style.FILL);
            cardPaint.setColor(0xFF141D2D);
            canvas.drawRoundRect(tempRect, 18f, 18f, cardPaint);

            strokePaint.setStyle(Paint.Style.STROKE);
            strokePaint.setStrokeWidth(3.5f);
            strokePaint.setColor(0xFF00FF88);
            canvas.drawRoundRect(tempRect, 18f, 18f, strokePaint);

            // Icona esagonale / distintivo
            fillPaint.setColor(0xFF00FF88);
            canvas.drawCircle(startX + 60f, cy + cardH / 2f, 28f, fillPaint);

            // Testo Reliquia
            textPaint.setTextAlign(Paint.Align.LEFT);
            textPaint.setColor(0xFFFFFFFF);
            textPaint.setTextSize(32f);
            textPaint.setFakeBoldText(true);
            canvas.drawText(relic.title, startX + 115f, cy + 65f, textPaint);

            textPaint.setColor(0xFFCBD5E1);
            textPaint.setTextSize(23f);
            textPaint.setFakeBoldText(false);
            canvas.drawText(relic.description, startX + 115f, cy + 120f, textPaint);
        }
    }

    private void drawGameOverModal(Canvas canvas) {
        fillPaint.setStyle(Paint.Style.FILL);
        fillPaint.setColor(0xF0080B12);
        canvas.drawRect(0, 0, Game.VIRTUAL_WIDTH, Game.VIRTUAL_HEIGHT, fillPaint);

        textPaint.setTextAlign(Paint.Align.CENTER);
        textPaint.setTextSize(54f);
        textPaint.setColor(0xFFFF007F);
        textPaint.setFakeBoldText(true);
        canvas.drawText("SFERE ESAURITE", Game.VIRTUAL_WIDTH / 2f, 680f, textPaint);

        textPaint.setTextSize(30f);
        textPaint.setColor(0xFFFFFFFF);
        canvas.drawText("Settore Raggiunto: " + game.currentLevel, Game.VIRTUAL_WIDTH / 2f, 780f, textPaint);
        canvas.drawText(String.format("Punteggio Finale: %,d", game.score), Game.VIRTUAL_WIDTH / 2f, 840f, textPaint);
        canvas.drawText(String.format("Record Personale: %,d", game.highScore), Game.VIRTUAL_WIDTH / 2f, 900f, textPaint);
        canvas.drawText("Cubi Frantumati: " + game.totalCubesDestroyed, Game.VIRTUAL_WIDTH / 2f, 960f, textPaint);

        // Bottone Riavvia
        fillPaint.setColor(0xFF00E5FF);
        canvas.drawRoundRect(restartBtnRect, 16f, 16f, fillPaint);

        textPaint.setColor(0xFF080B12);
        textPaint.setTextSize(36f);
        textPaint.setFakeBoldText(true);
        canvas.drawText("RIGIOCA", restartBtnRect.centerX(), restartBtnRect.centerY() + 12f, textPaint);
    }

    private void drawVictoryModal(Canvas canvas) {
        fillPaint.setStyle(Paint.Style.FILL);
        fillPaint.setColor(0xF0080B12);
        canvas.drawRect(0, 0, Game.VIRTUAL_WIDTH, Game.VIRTUAL_HEIGHT, fillPaint);

        textPaint.setTextAlign(Paint.Align.CENTER);
        textPaint.setTextSize(54f);
        textPaint.setColor(0xFF00FF88);
        textPaint.setFakeBoldText(true);
        canvas.drawText("SETTORI PURIFICATI!", Game.VIRTUAL_WIDTH / 2f, 680f, textPaint);

        textPaint.setTextSize(30f);
        textPaint.setColor(0xFFFFFFFF);
        canvas.drawText("Tutti i 10 settori sono stati polverizzati!", Game.VIRTUAL_WIDTH / 2f, 780f, textPaint);
        canvas.drawText(String.format("Punteggio Finale: %,d", game.score), Game.VIRTUAL_WIDTH / 2f, 840f, textPaint);
        canvas.drawText("Reliquie accumulate: " + game.activeRelics.size(), Game.VIRTUAL_WIDTH / 2f, 900f, textPaint);

        // Bottone Nuovo Loop
        fillPaint.setColor(0xFF00FF88);
        canvas.drawRoundRect(restartBtnRect, 16f, 16f, fillPaint);

        textPaint.setColor(0xFF080B12);
        textPaint.setTextSize(34f);
        textPaint.setFakeBoldText(true);
        canvas.drawText("NUOVO LOOP ROGUE", restartBtnRect.centerX(), restartBtnRect.centerY() + 12f, textPaint);
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        // Conversione coordinate schermo in coordinate virtuali di gioco
        float vx = (event.getX() - offsetX) / scale;
        float vy = (event.getY() - offsetY) / scale;

        int action = event.getActionMasked();

        // 1. Gestione click durante schermata Game Over o Vittoria
        if (game.state == Game.State.GAME_OVER || game.state == Game.State.VICTORY) {
            if (action == MotionEvent.ACTION_UP && restartBtnRect.contains(vx, vy)) {
                game.restartGame();
                AudioHelper.playLaunch();
                return true;
            }
            return true;
        }

        // 2. Gestione selezione carta Reliquia durante il Draft
        if (game.state == Game.State.RELIC_DRAFT) {
            if (action == MotionEvent.ACTION_UP) {
                float cardW = 900f;
                float cardH = 190f;
                float startX = (Game.VIRTUAL_WIDTH - cardW) / 2f;
                float startY = 520f;
                float gapY = 220f;

                for (int i = 0; i < game.draftChoices.size(); i++) {
                    float cy = startY + i * gapY;
                    if (vx >= startX && vx <= startX + cardW && vy >= cy && vy <= cy + cardH) {
                        game.selectRelic(game.draftChoices.get(i));
                        return true;
                    }
                }
            }
            return true;
        }

        // 3. Gestione pulsanti HUD
        if (action == MotionEvent.ACTION_UP) {
            if (speedBtnRect.contains(vx, vy)) {
                game.speedBoost = !game.speedBoost;
                return true;
            }
            if (soundBtnRect.contains(vx, vy)) {
                AudioHelper.toggleSound();
                return true;
            }
        }

        // 4. Modalità Puntata e Sparo
        if (game.state == Game.State.AIMING) {
            if (action == MotionEvent.ACTION_DOWN || action == MotionEvent.ACTION_MOVE) {
                // Non intercettare se stiamo premendo i tasti HUD in alto
                if (vy > 100f) {
                    game.setAimAngle(vx, vy);
                }
                return true;
            } else if (action == MotionEvent.ACTION_UP) {
                if (vy > 100f) {
                    game.setAimAngle(vx, vy);
                    boolean fired = game.shoot();
                    if (fired) {
                        AudioHelper.playLaunch();
                        vibrate(20);
                    }
                }
                return true;
            }
        }

        return true;
    }
}
