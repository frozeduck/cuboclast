import React, { useRef, useEffect, useCallback } from 'react';
import {
  VIRTUAL_WIDTH,
  VIRTUAL_HEIGHT,
  CANNON_X,
  CANNON_Y,
  Cube,
  ARCHETYPES_DATA,
  getChapterForSector,
} from '../types/game';
import { GameEngine } from '../game/GameEngine';

interface GameCanvasProps {
  engine: GameEngine;
  disabled?: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ engine, disabled = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isPointerDownRef = useRef(false);
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

  const getScaleInfo = useCallback(() => {
    if (!containerRef.current) {
      return { scale: 1, offsetX: 0, offsetY: 0, width: 1080, height: 1920 };
    }
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = rect.width / VIRTUAL_WIDTH;
    const scaleY = rect.height / VIRTUAL_HEIGHT;
    const scale = Math.min(scaleX, scaleY);
    const offsetX = (rect.width - VIRTUAL_WIDTH * scale) / 2;
    const offsetY = (rect.height - VIRTUAL_HEIGHT * scale) / 2;
    return {
      scale,
      offsetX,
      offsetY,
      width: rect.width || 1080,
      height: rect.height || 1920,
    };
  }, []);

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (!disabledRef.current) {
        engine.update(dt);
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(render);
        return;
      }

      const { scale, offsetX, offsetY, width, height } = getScaleInfo();

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetCanvasW = Math.round(width * dpr);
      const targetCanvasH = Math.round(height * dpr);

      if (canvas.width !== targetCanvasW || canvas.height !== targetCanvasH) {
        canvas.width = targetCanvasW;
        canvas.height = targetCanvasH;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Outer letterbox background
      ctx.fillStyle = '#080b12';
      ctx.fillRect(0, 0, width, height);

      const shakeX =
        !disabledRef.current && engine.screenShake > 0
          ? (Math.random() - 0.5) * engine.screenShake
          : 0;
      const shakeY =
        !disabledRef.current && engine.screenShake > 0
          ? (Math.random() - 0.5) * engine.screenShake
          : 0;

      ctx.translate(offsetX + shakeX, offsetY + shakeY);
      ctx.scale(scale, scale);

      ctx.beginPath();
      ctx.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
      ctx.clip();

      drawBackground(ctx);

      if (engine.state === 'AIMING' && !disabledRef.current) {
        drawAimTrajectory(ctx, engine);
      }

      drawCubes(ctx, engine);
      drawBossSatellites(ctx, engine);
      drawBasket(ctx, engine);
      drawShards(ctx, engine);
      drawBalls(ctx, engine);
      drawCannon(ctx, engine);
      drawFloatingTexts(ctx, engine);

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [engine, getScaleInfo]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || engine.state !== 'AIMING') return;
    isPointerDownRef.current = true;
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    updateAim(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (disabled || !isPointerDownRef.current || engine.state !== 'AIMING') return;
    updateAim(e);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (disabled || !isPointerDownRef.current || engine.state !== 'AIMING') return;
    isPointerDownRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    updateAim(e);
    engine.shoot();
  };

  const updateAim = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const { scale, offsetX, offsetY } = getScaleInfo();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const vx = (clientX - offsetX) / scale;
    const vy = (clientY - offsetY) / scale;

    if (vy > 100) {
      engine.setAimAngle(vx, vy);
    }
  };

  return (
    <div
      ref={containerRef}
      data-testid="game-canvas-container"
      className={`relative w-full h-full flex items-center justify-center overflow-hidden select-none ${
        disabled ? 'pointer-events-none' : 'touch-none'
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => (isPointerDownRef.current = false)}
    >
      <canvas
        ref={canvasRef}
        className="block cursor-crosshair active:cursor-grabbing w-full h-full"
      />
    </div>
  );
};

// ----------------- Minimalist Neon Geometric Rendering (v0.4.0 Style) -----------------

function drawBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

  ctx.strokeStyle = '#141d2d';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let x = 60; x < VIRTUAL_WIDTH; x += 120) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, VIRTUAL_HEIGHT);
  }
  for (let y = 60; y < VIRTUAL_HEIGHT; y += 120) {
    ctx.moveTo(0, y);
    ctx.lineTo(VIRTUAL_WIDTH, y);
  }
  ctx.stroke();

  ctx.strokeStyle = '#1e2e48';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, VIRTUAL_WIDTH - 8, VIRTUAL_HEIGHT - 8);

  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(6, 6, VIRTUAL_WIDTH - 12, VIRTUAL_HEIGHT - 12);
}

function drawCannon(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  const cx = CANNON_X;
  const cy = CANNON_Y;
  const cannonColor = engine.currentArchetype
    ? ARCHETYPES_DATA[engine.currentArchetype]?.color || '#00e5ff'
    : '#00e5ff';

  ctx.fillStyle = '#141d2d';
  ctx.beginPath();
  ctx.arc(cx, cy, 38, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = cannonColor;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 38, 0, Math.PI * 2);
  ctx.stroke();

  const barrelLen = 52;
  const barrelX = cx + Math.cos(engine.aimAngle) * barrelLen;
  const barrelY = cy + Math.sin(engine.aimAngle) * barrelLen;

  ctx.strokeStyle = cannonColor;
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(barrelX, barrelY);
  ctx.stroke();
  ctx.lineCap = 'butt';

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.fill();
}

function drawAimTrajectory(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  const startX = CANNON_X + Math.cos(engine.aimAngle) * 55;
  const startY = CANNON_Y + Math.sin(engine.aimAngle) * 55;
  const dirX = Math.cos(engine.aimAngle);
  const dirY = Math.sin(engine.aimAngle);

  let minT = 1600;
  let normX = 0;
  let normY = 1;

  if (dirX < -0.001) {
    const t = (25 - startX) / dirX;
    if (t > 0 && t < minT) {
      minT = t;
      normX = 1;
      normY = 0;
    }
  }
  if (dirX > 0.001) {
    const t = (VIRTUAL_WIDTH - 25 - startX) / dirX;
    if (t > 0 && t < minT) {
      minT = t;
      normX = -1;
      normY = 0;
    }
  }

  const r = 18;
  for (const c of engine.cubes) {
    if (!c.isAlive) continue;
    const minX = c.x - r;
    const maxX = c.x + c.width + r;
    const minY = c.y - r;
    const maxY = c.y + c.height + r;

    const t1 = (minX - startX) / (Math.abs(dirX) > 0.0001 ? dirX : 0.0001);
    const t2 = (maxX - startX) / (Math.abs(dirX) > 0.0001 ? dirX : 0.0001);
    const t3 = (minY - startY) / (Math.abs(dirY) > 0.0001 ? dirY : 0.0001);
    const t4 = (maxY - startY) / (Math.abs(dirY) > 0.0001 ? dirY : 0.0001);

    const tNear = Math.max(Math.min(t1, t2), Math.min(t3, t4));
    const tFar = Math.min(Math.max(t1, t2), Math.max(t3, t4));

    if (tFar >= 0 && tNear <= tFar && tNear > 0 && tNear < minT) {
      minT = tNear;
      const hitPx = startX + dirX * minT;
      const hitPy = startY + dirY * minT;
      const dLeft = Math.abs(hitPx - minX);
      const dRight = Math.abs(hitPx - maxX);
      const dTop = Math.abs(hitPy - minY);
      const dBottom = Math.abs(hitPy - maxY);
      const m = Math.min(Math.min(dLeft, dRight), Math.min(dTop, dBottom));

      if (m === dLeft) {
        normX = -1;
        normY = 0;
      } else if (m === dRight) {
        normX = 1;
        normY = 0;
      } else if (m === dTop) {
        normX = 0;
        normY = -1;
      } else {
        normX = 0;
        normY = 1;
      }
    }
  }

  const hitX = startX + dirX * minT;
  const hitY = startY + dirY * minT;

  ctx.save();
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.55)';
  ctx.lineWidth = 3.5;
  ctx.setLineDash([14, 12]);
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(hitX, hitY);
  ctx.stroke();

  ctx.fillStyle = 'rgba(0, 229, 255, 0.93)';
  const steps1 = Math.max(3, Math.floor(minT / 42));
  for (let i = 1; i <= steps1; i++) {
    const frac = i / steps1;
    ctx.beginPath();
    ctx.arc(startX + (hitX - startX) * frac, startY + (hitY - startY) * frac, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const dot = dirX * normX + dirY * normY;
  const refX = dirX - 2 * dot * normX;
  const refY = dirY - 2 * dot * normY;
  const len2 = 360;
  const refEndX = hitX + refX * len2;
  const refEndY = hitY + refY * len2;

  ctx.beginPath();
  ctx.moveTo(hitX, hitY);
  ctx.lineTo(refEndX, refEndY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = 'rgba(0, 255, 136, 0.67)';
  const steps2 = 8;
  for (let i = 1; i <= steps2; i++) {
    const frac = i / steps2;
    ctx.beginPath();
    ctx.arc(hitX + (refEndX - hitX) * frac, hitY + (refEndY - hitY) * frac, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = '#ffe600';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(hitX, hitY, 14, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawCubes(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  for (const c of engine.cubes) {
    if (!c.isAlive) continue;

    ctx.save();
    const wScale = 1.0 + c.wobble * 0.18;
    const hScale = 1.0 - c.wobble * 0.14;
    const centerX = c.x + c.width / 2;
    const centerY = c.y + c.height / 2;
    const drawW = c.width * wScale;
    const drawH = c.height * hScale;
    const rx = centerX - drawW / 2;
    const ry = centerY - drawH / 2;

    let baseColor = '#082635';
    let strokeColor = '#00e5ff';

    if (c.isCore && c.type !== 'BOSS') {
      baseColor = '#352b08';
      strokeColor = '#ffe600';
    } else {
      switch (c.type) {
        case 'EXPLOSIVE':
          baseColor = '#351a08';
          strokeColor = '#ff6b00';
          break;
        case 'SPLITTER':
          baseColor = '#2b0f3a';
          strokeColor = '#a855f7';
          break;
        case 'KINETIC':
          baseColor = '#353008';
          strokeColor = '#ffe600';
          break;
        case 'SHIELD':
          baseColor = '#08351e';
          strokeColor = '#00ff88';
          break;
        case 'ARMOR':
          baseColor = '#0e1a38';
          strokeColor = '#3b82f6';
          break;
        case 'BOSS':
          baseColor = engine.bossPhase === 3 ? '#4a0826' : '#36081e';
          strokeColor = engine.bossPhase === 3 ? '#ff0055' : '#ff007f';
          break;
        default:
          baseColor = '#082635';
          strokeColor = '#00e5ff';
          break;
      }
    }

    if (c.isFrozen) {
      baseColor = '#0e2a4a';
      strokeColor = '#38bdf8';
    }

    // Minimalist rounded rect body
    ctx.fillStyle = baseColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = c.isCore ? 4.5 : 3.0;

    roundRect(ctx, rx, ry, drawW, drawH, 12);
    ctx.fill();
    ctx.stroke();

    // Pulsing inner circle for Core cubes (authentic v0.4.0 style)
    if (c.isCore && c.type !== 'BOSS') {
      const pulse = 0.5 + Math.sin(c.shieldPulse) * 0.35;
      ctx.strokeStyle = `rgba(255, 230, 0, ${pulse.toFixed(2)})`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(centerX, centerY, (drawH / 2) * 0.7, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Subtle shield aura for SHIELD cubes
    if (c.type === 'SHIELD') {
      const pulseR = 12 + Math.sin(c.shieldPulse) * 4;
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.35)';
      ctx.lineWidth = 1.8;
      roundRect(ctx, rx - pulseR / 2, ry - pulseR / 2, drawW + pulseR, drawH + pulseR, 14);
      ctx.stroke();
    }

    // Hit flash overlay
    if (c.hitFlash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, c.hitFlash * 0.7)})`;
      roundRect(ctx, rx, ry, drawW, drawH, 12);
      ctx.fill();
    }

    // Clean numeric HP only (minimalist v0.4.0 style)
    ctx.fillStyle = c.isCore && c.type !== 'BOSS' ? '#ffe600' : '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font =
      c.type === 'BOSS'
        ? 'bold 44px "Chakra Petch", sans-serif'
        : 'bold 24px "Chakra Petch", sans-serif';
    ctx.fillText(String(c.hp), centerX, centerY);

    // Boss HP bar above the Boss cube
    if (c.type === 'BOSS') {
      const barW = 340;
      const barH = 14;
      const barX = centerX - barW / 2;
      const barY = ry - 38;
      ctx.fillStyle = '#1e2e48';
      ctx.fillRect(barX, barY, barW, barH);
      const hpRatio = Math.max(0, c.hp / c.maxHp);
      ctx.fillStyle =
        engine.bossPhase === 3 ? '#ff0055' : engine.bossPhase === 2 ? '#ff6b00' : '#ff007f';
      ctx.fillRect(barX, barY, barW * hpRatio, barH);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(barX, barY, barW, barH);

      const chapter = getChapterForSector(engine.currentLevel);
      ctx.fillStyle = '#ff007f';
      ctx.font = 'bold 20px "Chakra Petch", sans-serif';
      ctx.fillText(
        `${chapter.bossName.toUpperCase()} · FASE ${engine.bossPhase}/3`,
        centerX,
        barY - 14
      );
    }

    ctx.restore();
  }
}

function drawBossSatellites(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  if (!engine.activeBoss || !engine.activeBoss.isAlive) return;
  const bx = engine.activeBoss.x + engine.activeBoss.width / 2;
  const by = engine.activeBoss.y + engine.activeBoss.height / 2;

  for (const sat of engine.bossSatellites) {
    if (!sat.isAlive) continue;
    const sx = bx + Math.cos(sat.angle) * sat.distance;
    const sy = by + Math.sin(sat.angle) * sat.distance;

    ctx.strokeStyle = 'rgba(255, 0, 127, 0.28)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(sx, sy);
    ctx.stroke();

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(sat.angle * 2);

    ctx.fillStyle = '#36081e';
    ctx.strokeStyle = '#ff007f';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.rect(-sat.width / 2, -sat.height / 2, sat.width, sat.height);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${sat.hp}`, 0, 0);

    ctx.restore();
  }
}

function drawBasket(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  const b = engine.basket;
  ctx.save();

  ctx.fillStyle = '#0f2538';
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 3.5;
  roundRect(ctx, b.x, b.y, b.width, b.height, 12);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(b.x + 20, b.y + b.height / 2);
  ctx.lineTo(b.x + b.width - 20, b.y + b.height / 2);
  ctx.stroke();

  // Subtle magnetic arc above basket (authentic v0.4.0 style)
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(
    b.x + b.width / 2,
    b.y - 8,
    Math.max(20, b.width / 2 - 12),
    20,
    0,
    Math.PI,
    Math.PI * 2
  );
  ctx.stroke();

  ctx.restore();
}

function drawBalls(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  for (const b of engine.balls) {
    if (!b.isAlive) continue;

    if (b.trail.length > 1) {
      ctx.save();
      ctx.lineCap = 'round';
      for (let i = 0; i < b.trail.length - 1; i++) {
        const p1 = b.trail[i];
        const p2 = b.trail[i + 1];
        const ratio = i / b.trail.length;
        ctx.strokeStyle = b.isMini
          ? `rgba(168, 85, 247, ${(ratio * 0.6).toFixed(2)})`
          : `rgba(0, 229, 255, ${(ratio * 0.6).toFixed(2)})`;
        ctx.lineWidth = b.radius * 1.4 * ratio;
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.fillStyle = b.isMini ? '#a855f7' : '#00e5ff';
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(b.x - b.radius * 0.35, b.y - b.radius * 0.35, b.radius * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawShards(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  for (const s of engine.shards) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate((s.rotation * Math.PI) / 180);
    ctx.fillStyle = s.color;
    ctx.globalAlpha = Math.max(0, Math.min(1, s.life));
    ctx.fillRect(-s.size / 2, -s.size / 2, s.size, s.size);
    ctx.restore();
  }
}

function drawFloatingTexts(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 26px "Chakra Petch", sans-serif';

  for (const ft of engine.floatingTexts) {
    ctx.globalAlpha = Math.max(0, Math.min(1, ft.life));
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
  }

  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
