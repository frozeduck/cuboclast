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

    // Paints di rendering pre-allocati per 60/120 FPS
    private final Paint bgPaint = new Paint();
    private final Paint linePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint fillPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint strokePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint textPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint aimPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint cardPaint = new Paint(Paint.ANTI_ALIAS_FLAG);

    private final RectF tempRect = new RectF();

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

            @Override
            public void onFreeBall() {
                AudioHelper.playFreeBall();
                vibrate(50);
            }

            @Override
            public void onFever() {
                AudioHelper.playFeverFanfare();
                vibrate(80);
            }

            @Override
            public void onMercyRefund() {
                AudioHelper.playMercyRefund();
                vibrate(25);
            }
        };

        bgPaint.setColor(COLOR_BG);
        aimPaint.setColor(COLOR_AIM_LINE);
        aimPaint.setStrokeWidth(3.5f);
        aimPaint.setStyle(Paint.Style.STROKE);
        aimPaint.setPathEffect(new DashPathEffect(new float[]{14f, 12f}, 0));
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
        canvas.drawColor(0xFF04060A);

        canvas.save();
        float shakeX = (game.screenShake > 0) ? (game.random.nextFloat() - 0.5f) * game.screenShake : 0;
        float shakeY = (game.screenShake > 0) ? (game.random.nextFloat() - 0.5f) * game.screenShake : 0;
        canvas.translate(offsetX + shakeX, offsetY + shakeY);
        canvas.scale(scale, scale);

        canvas.clipRect(0, 0, Game.VIRTUAL_WIDTH, Game.VIRTUAL_HEIGHT);

        drawBackground(canvas);

        if (game.state == Game.State.AIMING) {
            drawAimTrajectory(canvas);
        }

        drawCubes(canvas);
        drawBasket(canvas);
        drawShards(canvas);
        drawBalls(canvas);
        drawCannon(canvas);
        drawFloatingTexts(canvas);
        drawHUD(canvas);

        if (game.state == Game.State.FEVER) {
            drawFeverBanner(canvas);
        } else if (game.state == Game.State.RELIC_DRAFT) {
            drawRelicDraftModal(canvas);
        } else if (game.state == Game.State.GAME_OVER) {
            drawGameOverModal(canvas);
        } else if (game.state == Game.State.VICTORY) {
            drawVictoryModal(canvas);
        }

        canvas.restore();
    }

    private void drawBackground(Canvas canvas) {
        canvas.drawRect(0, 0, Game.VIRTUAL_WIDTH, Game.VIRTUAL_HEIGHT, bgPaint);

        strokePaint.setStyle(Paint.Style.STROKE);
        strokePaint.setStrokeWidth(1.5f);
        strokePaint.setColor(COLOR_GRID);

        for (float x = 60f; x < Game.VIRTUAL_WIDTH; x += 120f) {
            canvas.drawLine(x, 0, x, Game.VIRTUAL_HEIGHT, strokePaint);
        }
        for (float y = 60f; y < Game.VIRTUAL_HEIGHT; y += 120f) {
            canvas.drawLine(0, y, Game.VIRTUAL_WIDTH, y, strokePaint);
        }

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

        fillPaint.setStyle(Paint.Style.FILL);
        fillPaint.setColor(0xFF141D2D);
        canvas.drawCircle(cx, cy, 42f, fillPaint);

        strokePaint.setStyle(Paint.Style.STROKE);
        strokePaint.setStrokeWidth(4f);
        strokePaint.setColor(COLOR_CANNON);
        canvas.drawCircle(cx, cy, 42f, strokePaint);

        float barrelLen = 52f;
        float barrelX = cx + (float) Math.cos(game.aimAngle) * barrelLen;
        float barrelY = cy + (float) Math.sin(game.aimAngle) * barrelLen;

        strokePaint.setStrokeWidth(12f);
        strokePaint.setColor(0xFF00E5FF);
        strokePaint.setStrokeCap(Paint.Cap.ROUND);
        canvas.drawLine(cx, cy, barrelX, barrelY, strokePaint);

        fillPaint.setColor(0xFFFFFFFF);
        canvas.drawCircle(cx, cy, 14f, fillPaint);
    }

    // Traiettoria Predittiva Avanzata a 2 Segmenti con Rimbalzo (Stile Peggle)
    private void drawAimTrajectory(Canvas canvas) {
        float startX = Game.CANNON_X + (float) Math.cos(game.aimAngle) * 55f;
        float startY = Game.CANNON_Y + (float) Math.sin(game.aimAngle) * 55f;
        float dirX = (float) Math.cos(game.aimAngle);
        float dirY = (float) Math.sin(game.aimAngle);

        float minT = 1600f;
        float normX = 0f;
        float normY = 1f;

        // Parete sinistra (x = 25)
        if (dirX < -0.001f) {
            float t = (25f - startX) / dirX;
            if (t > 0 && t < minT) {
                minT = t;
                normX = 1f;
                normY = 0f;
            }
        }
        // Parete destra (x = VIRTUAL_WIDTH - 25)
        if (dirX > 0.001f) {
            float t = (Game.VIRTUAL_WIDTH - 25f - startX) / dirX;
            if (t > 0 && t < minT) {
                minT = t;
                normX = -1f;
                normY = 0f;
            }
        }

        // Test intersezione con Cubi attivi
        for (Game.Cube c : game.cubes) {
            if (!c.isAlive) continue;
            float r = 18f;
            float minX = c.x - r;
            float maxX = c.x + c.width + r;
            float minY = c.y - r;
            float maxY = c.y + c.height + r;

            float t1 = (minX - startX) / (Math.abs(dirX) > 0.0001f ? dirX : 0.0001f);
            float t2 = (maxX - startX) / (Math.abs(dirX) > 0.0001f ? dirX : 0.0001f);
            float t3 = (minY - startY) / (Math.abs(dirY) > 0.0001f ? dirY : 0.0001f);
            float t4 = (maxY - startY) / (Math.abs(dirY) > 0.0001f ? dirY : 0.0001f);

            float tNear = Math.max(Math.min(t1, t2), Math.min(t3, t4));
            float tFar = Math.min(Math.max(t1, t2), Math.max(t3, t4));

            if (tFar >= 0 && tNear <= tFar && tNear > 0 && tNear < minT) {
                minT = tNear;
                float hitPx = startX + dirX * minT;
                float hitPy = startY + dirY * minT;
                float dLeft = Math.abs(hitPx - minX);
                float dRight = Math.abs(hitPx - maxX);
                float dTop = Math.abs(hitPy - minY);
                float dBottom = Math.abs(hitPy - maxY);
                float m = Math.min(Math.min(dLeft, dRight), Math.min(dTop, dBottom));
                if (m == dLeft) { normX = -1f; normY = 0f; }
                else if (m == dRight) { normX = 1f; normY = 0f; }
                else if (m == dTop) { normX = 0f; normY = -1f; }
                else { normX = 0f; normY = 1f; }
            }
        }

        float hitX = startX + dirX * minT;
        float hitY = startY + dirY * minT;

        // Disegna Segmento 1
        canvas.drawLine(startX, startY, hitX, hitY, aimPaint);
        fillPaint.setStyle(Paint.Style.FILL);
        fillPaint.setColor(0xEE00E5FF);
        int steps1 = Math.max(3, (int) (minT / 42f));
        for (int i = 1; i <= steps1; i++) {
            float frac = (float) i / steps1;
            canvas.drawCircle(startX + (hitX - startX) * frac, startY + (hitY - startY) * frac, 4.5f, fillPaint);
        }

        // Raggio Riflesso (Segmento 2)
        float dot = dirX * normX + dirY * normY;
        float refX = dirX - 2f * dot * normX;
        float refY = dirY - 2f * dot * normY;
        float len2 = 360f;
        float refEndX = hitX + refX * len2;
        float refEndY = hitY + refY * len2;

        canvas.drawLine(hitX, hitY, refEndX, refEndY, aimPaint);
        fillPaint.setColor(0xAA00FF88);
        int steps2 = 8;
        for (int i = 1; i <= steps2; i++) {
            float frac = (float) i / steps2;
            canvas.drawCircle(hitX + (refEndX - hitX) * frac, hitY + (refEndY - hitY) * frac, 3.5f, fillPaint);
        }

        // Mirino circolare sull'impatto
        strokePaint.setStyle(Paint.Style.STROKE);
        strokePaint.setStrokeWidth(2.5f);
        strokePaint.setColor(0xFFFFE600);
        canvas.drawCircle(hitX, hitY, 14f, strokePaint);
    }

    private void drawCubes(Canvas canvas) {
        for (Game.Cube c : game.cubes) {
            if (!c.isAlive) continue;

            float wScale = 1.0f + c.wobble * 0.18f;
            float hScale = 1.0f - c.wobble * 0.14f;
            float cx = c.centerX();
            float cy = c.centerY();
            float halfW = (c.width * wScale) / 2f;
            float halfH = (c.height * hScale) / 2f;

            tempRect.set(cx - halfW, cy - halfH, cx + halfW, cy + halfH);

            int baseColor;
            int strokeColor;
            if (c.isCore) {
                baseColor = 0xFF352B08;
                strokeColor = 0xFFFFE600; // Oro vibrante per i bersagli principali!
            } else {
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
            }

            fillPaint.setStyle(Paint.Style.FILL);
            fillPaint.setColor(baseColor);
            canvas.drawRoundRect(tempRect, 12f, 12f, fillPaint);

            strokePaint.setStyle(Paint.Style.STROKE);
            strokePaint.setStrokeWidth(c.isCore ? 4.5f : 3.0f);
            strokePaint.setColor(strokeColor);
            canvas.drawRoundRect(tempRect, 12f, 12f, strokePaint);

            // Se Cubo Core (Target Principale): alone interno pulsante dorato
            if (c.isCore) {
                float pulse = 0.5f + (float) Math.sin(c.shieldPulse) * 0.35f;
                strokePaint.setColor(Color.argb((int) (pulse * 255), 255, 230, 0));
                strokePaint.setStrokeWidth(1.8f);
                canvas.drawCircle(cx, cy, halfH * 0.7f, strokePaint);
            }

            if (c.hitFlash > 0f) {
                fillPaint.setColor(Color.argb((int) (c.hitFlash * 180), 255, 255, 255));
                canvas.drawRoundRect(tempRect, 12f, 12f, fillPaint);
            }

            textPaint.setTextAlign(Paint.Align.CENTER);
            textPaint.setColor(c.isCore ? 0xFFFFE600 : 0xFFFFFFFF);
            textPaint.setFakeBoldText(true);
            textPaint.setTextSize((c.type == Game.CubeType.BOSS) ? 44f : 24f);

            Paint.FontMetrics fm = textPaint.getFontMetrics();
            float textY = cy - (fm.ascent + fm.descent) / 2f;
            canvas.drawText(String.valueOf(c.hp), cx, textY, textPaint);

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

        fillPaint.setStyle(Paint.Style.FILL);
        fillPaint.setColor(0xFF0F2538);
        canvas.drawRoundRect(tempRect, 12f, 12f, fillPaint);

        strokePaint.setStyle(Paint.Style.STROKE);
        strokePaint.setStrokeWidth(3.5f);
        strokePaint.setColor(0xFF00FF88);
        canvas.drawRoundRect(tempRect, 12f, 12f, strokePaint);

        strokePaint.setColor(0xFFFFFFFF);
        strokePaint.setStrokeWidth(2f);
        canvas.drawLine(b.x + 20f, b.y + b.height / 2f, b.x + b.width - 20f, b.y + b.height / 2f, strokePaint);

        // Flusso magnetico visibile
        strokePaint.setColor(0x6600E5FF);
        strokePaint.setStrokeWidth(2f);
        canvas.drawArc(b.x + 10f, b.y - 35f, b.x + b.width - 10f, b.y + 15f, 180, 180, false, strokePaint);
    }

    private void drawBalls(Canvas canvas) {
        for (Game.Ball b : game.balls) {
            if (!b.isAlive) continue;

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

            fillPaint.setStyle(Paint.Style.FILL);
            fillPaint.setColor(b.isMini ? 0xFFA855F7 : 0xFF00E5FF);
            canvas.drawCircle(b.x, b.y, b.radius, fillPaint);

            strokePaint.setStyle(Paint.Style.STROKE);
            strokePaint.setStrokeWidth(2.5f);
            strokePaint.setColor(0xFFFFFFFF);
            canvas.drawCircle(b.x, b.y, b.radius, strokePaint);

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
        tempRect.set(30f, 30f, 260f, 90f);
        canvas.drawRoundRect(tempRect, 10f, 10f, fillPaint);

        strokePaint.setStyle(Paint.Style.STROKE);
        strokePaint.setStrokeWidth(2.5f);
        strokePaint.setColor(COLOR_WALL_GLOW);
        canvas.drawRoundRect(tempRect, 10f, 10f, strokePaint);

        textPaint.setTextAlign(Paint.Align.LEFT);
        textPaint.setColor(0xFFFFFFFF);
        textPaint.setTextSize(24f);
        textPaint.setFakeBoldText(true);
        canvas.drawText("SETTORE " + game.currentLevel + "/" + game.maxLevel, 45f, 68f, textPaint);

        // Contatore Core Targets in alto
        int remainingCores = game.getRemainingCoreCubes();
        int totalCores = game.getTotalCoreCubes();
        fillPaint.setColor(0xDD2A2208);
        tempRect.set(275f, 30f, 485f, 90f);
        canvas.drawRoundRect(tempRect, 10f, 10f, fillPaint);

        strokePaint.setColor(0xFFFFE600);
        strokePaint.setStrokeWidth(2.5f);
        canvas.drawRoundRect(tempRect, 10f, 10f, strokePaint);

        textPaint.setColor(0xFFFFE600);
        textPaint.setTextSize(22f);
        canvas.drawText("★ CORE: " + remainingCores + "/" + totalCores, 290f, 68f, textPaint);

        // Punteggio in alto al centro/destra
        textPaint.setTextAlign(Paint.Align.CENTER);
        textPaint.setTextSize(32f);
        textPaint.setColor(0xFFFFFFFF);
        canvas.drawText(String.format("%,d", game.score), Game.VIRTUAL_WIDTH / 2f + 130f, 70f, textPaint);

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
        tempRect.set(30f, 1835f, 340f, 1895f);
        canvas.drawRoundRect(tempRect, 10f, 10f, fillPaint);

        textPaint.setTextAlign(Paint.Align.LEFT);
        textPaint.setColor(0xFF00E5FF);
        textPaint.setTextSize(24f);
        canvas.drawText("SFERE: " + game.ballsRemaining, 50f, 1872f, textPaint);

        fillPaint.setColor(0xFF00E5FF);
        for (int i = 0; i < Math.min(game.ballsRemaining, 8); i++) {
            canvas.drawCircle(185f + i * 18f, 1865f, 5.5f, fillPaint);
        }

        // Reliquie Attive in basso a destra
        if (!game.activeRelics.isEmpty()) {
            textPaint.setTextAlign(Paint.Align.RIGHT);
            textPaint.setColor(0xFFA855F7);
            textPaint.setTextSize(22f);
            canvas.drawText("RELIQUIE: " + game.activeRelics.size(), Game.VIRTUAL_WIDTH - 40f, 1872f, textPaint);
        }
    }

    private void drawFeverBanner(Canvas canvas) {
        fillPaint.setStyle(Paint.Style.FILL);
        fillPaint.setColor(0xCC080B12);
        canvas.drawRect(0, 750f, Game.VIRTUAL_WIDTH, 1050f, fillPaint);

        strokePaint.setStyle(Paint.Style.STROKE);
        strokePaint.setColor(0xFFFFE600);
        strokePaint.setStrokeWidth(5f);
        canvas.drawLine(0, 750f, Game.VIRTUAL_WIDTH, 750f, strokePaint);
        canvas.drawLine(0, 1050f, Game.VIRTUAL_WIDTH, 1050f, strokePaint);

        textPaint.setTextAlign(Paint.Align.CENTER);
        textPaint.setTextSize(64f);
        textPaint.setColor(0xFFFFE600);
        textPaint.setFakeBoldText(true);
        canvas.drawText("★ CUBOCLAST FEVER! ★", Game.VIRTUAL_WIDTH / 2f, 870f, textPaint);

        textPaint.setTextSize(30f);
        textPaint.setColor(0xFFFFFFFF);
        textPaint.setFakeBoldText(false);
        canvas.drawText("TUTTI I CORE DISTRUTTI! POLVERIZZAZIONE IN CORSO!", Game.VIRTUAL_WIDTH / 2f, 950f, textPaint);
    }

    private void drawRelicDraftModal(Canvas canvas) {
        fillPaint.setStyle(Paint.Style.FILL);
        fillPaint.setColor(0xEE080B12);
        canvas.drawRect(0, 0, Game.VIRTUAL_WIDTH, Game.VIRTUAL_HEIGHT, fillPaint);

        textPaint.setTextAlign(Paint.Align.CENTER);
        textPaint.setTextSize(44f);
        textPaint.setColor(0xFF00E5FF);
        textPaint.setFakeBoldText(true);
        boolean isStarter = game.activeRelics.isEmpty();
        canvas.drawText(isStarter ? "SCEGLI LA TUA RELIQUIA INIZIALE" : "SCEGLI UNA RELIQUIA ROGUELIKE", Game.VIRTUAL_WIDTH / 2f, 380f, textPaint);

        textPaint.setTextSize(25f);
        textPaint.setColor(0xFF94A3B8);
        textPaint.setFakeBoldText(false);
        canvas.drawText(isStarter ? "Inizia la tua scalata con un super-potere sinergico" : "Potenzia il tuo arsenale per il prossimo settore", Game.VIRTUAL_WIDTH / 2f, 430f, textPaint);

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

            fillPaint.setColor(0xFF00FF88);
            canvas.drawCircle(startX + 60f, cy + cardH / 2f, 28f, fillPaint);

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

        fillPaint.setColor(0xFF00FF88);
        canvas.drawRoundRect(restartBtnRect, 16f, 16f, fillPaint);

        textPaint.setColor(0xFF080B12);
        textPaint.setTextSize(34f);
        textPaint.setFakeBoldText(true);
        canvas.drawText("NUOVO LOOP ROGUE", restartBtnRect.centerX(), restartBtnRect.centerY() + 12f, textPaint);
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        float vx = (event.getX() - offsetX) / scale;
        float vy = (event.getY() - offsetY) / scale;

        int action = event.getActionMasked();

        if (game.state == Game.State.GAME_OVER || game.state == Game.State.VICTORY) {
            if (action == MotionEvent.ACTION_UP && restartBtnRect.contains(vx, vy)) {
                game.restartGame();
                AudioHelper.playLaunch();
                return true;
            }
            return true;
        }

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

        if (game.state == Game.State.AIMING) {
            if (action == MotionEvent.ACTION_DOWN || action == MotionEvent.ACTION_MOVE) {
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
