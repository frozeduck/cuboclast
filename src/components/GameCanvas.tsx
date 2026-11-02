import React, { useRef, useEffect, useCallback } from 'react';
import {
  VIRTUAL_WIDTH,
  VIRTUAL_HEIGHT,
  CANNON_X,
  CANNON_Y,
  Cube,
  ARCHETYPES_DATA,
} from '../types/game';
import { GameEngine } from '../game/GameEngine';

interface GameCanvasProps {
  engine: GameEngine;
  onAimAngleChange?: (angle: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ engine }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isPointerDownRef = useRef(false);

  // Resize canvas scale based on container
  const getScaleInfo = useCallback(() => {
    if (!containerRef.current) return { scale: 1, offsetX: 0, offsetY: 0, width: 1080, height: 1920 };
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = rect.width / VIRTUAL_WIDTH;
    const scaleY = rect.height / VIRTUAL_HEIGHT;
    const scale = Math.min(scaleX, scaleY);
    const offsetX = (rect.width - VIRTUAL_WIDTH * scale) / 2;
    const offsetY = (rect.height - VIRTUAL_HEIGHT * scale) / 2;
    return { scale, offsetX, offsetY, width: rect.width || 1080, height: rect.height || 1920 };
  }, []);

  // Main Render Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Update simulation
      engine.update(dt);

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

      // Ensure canvas internal resolution matches display size
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetCanvasW = Math.round(width * dpr);
      const targetCanvasH = Math.round(height * dpr);

      if (canvas.width !== targetCanvasW || canvas.height !== targetCanvasH) {
        canvas.width = targetCanvasW;
        canvas.height = targetCanvasH;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Clear full background
      ctx.fillStyle = '#04060a';
      ctx.fillRect(0, 0, width, height);

      // Apply letterbox centering and screen shake
      const shakeX = engine.screenShake > 0 ? (Math.random() - 0.5) * engine.screenShake : 0;
      const shakeY = engine.screenShake > 0 ? (Math.random() - 0.5) * engine.screenShake : 0;

      ctx.translate(offsetX + shakeX, offsetY + shakeY);
      ctx.scale(scale, scale);

      // Clip to virtual playfield
      ctx.beginPath();
      ctx.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
      ctx.clip();

      // Draw cyber background
      drawBackground(ctx);

      // Draw aim trajectory if aiming
      if (engine.state === 'AIMING') {
        drawAimTrajectory(ctx, engine);
      }

      // Draw game elements
      drawCubes(ctx, engine.cubes);
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

  // Pointer event handlers for aiming and shooting
  const handlePointerDown = (e: React.PointerEvent) => {
    if (engine.state !== 'AIMING') return;
    isPointerDownRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateAim(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current || engine.state !== 'AIMING') return;
    updateAim(e);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current || engine.state !== 'AIMING') return;
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
      className="relative w-full h-full flex items-center justify-center overflow-hidden touch-none select-none"
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

// ----------------- Canvas Rendering Subroutines -----------------

function drawBackground(ctx: CanvasRenderingContext2D) {
  // Deep space cyber background
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

  // Grid lines
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

  // Outer neon glowing walls
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
  const archColor = engine.currentArchetype ? ARCHETYPES_DATA[engine.currentArchetype]?.color : '#00e5ff';

  // Base socket
  ctx.fillStyle = '#141d2d';
  ctx.beginPath();
  ctx.arc(cx, cy, 42, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = archColor || '#00e5ff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, 42, 0, Math.PI * 2);
  ctx.stroke();

  // Barrel
  const barrelLen = 52;
  const barrelX = cx + Math.cos(engine.aimAngle) * barrelLen;
  const barrelY = cy + Math.sin(engine.aimAngle) * barrelLen;

  ctx.strokeStyle = archColor || '#00e5ff';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(barrelX, barrelY);
  ctx.stroke();
  ctx.lineCap = 'butt';

  // Center glowing energy core
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

  // Wall collisions
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

  // Cubes collisions
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

  // Draw main dashed line
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.7)';
  ctx.lineWidth = 3.5;
  ctx.setLineDash([14, 12]);
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(hitX, hitY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Trajectory laser dots
  ctx.fillStyle = '#00e5ff';
  const steps1 = Math.max(3, Math.floor(minT / 42));
  for (let i = 1; i <= steps1; i++) {
    const frac = i / steps1;
    ctx.beginPath();
    ctx.arc(startX + (hitX - startX) * frac, startY + (hitY - startY) * frac, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw bounce preview ray
  const dot = dirX * normX + dirY * normY;
  const refX = dirX - 2 * dot * normX;
  const refY = dirY - 2 * dot * normY;
  const bounceLen = 220;
  const bEndX = hitX + refX * bounceLen;
  const bEndY = hitY + refY * bounceLen;

  ctx.strokeStyle = 'rgba(0, 255, 136, 0.6)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(hitX, hitY);
  ctx.lineTo(bEndX, bEndY);
  ctx.stroke();

  // Impact reticle at hit point
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(hitX, hitY, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawCubes(ctx: CanvasRenderingContext2D, cubes: Cube[]) {
  for (const c of cubes) {
    if (!c.isAlive) continue;

    ctx.save();
    let cx = c.x;
    let cy = c.y;

    // Wobble shake on hit
    if (c.wobble > 0) {
      cx += (Math.random() - 0.5) * c.wobble * 8;
      cy += (Math.random() - 0.5) * c.wobble * 8;
    }

    // Color definitions
    let baseColor = '#00e5ff';
    let borderColor = '#38bdf8';
    let badgeText = '';

    switch (c.type) {
      case 'ARMOR':
        baseColor = '#1e3a8a';
        borderColor = '#3b82f6';
        badgeText = 'ARMOR';
        break;
      case 'EXPLOSIVE':
        baseColor = '#9a3412';
        borderColor = '#ff6b00';
        badgeText = 'BOMB';
        break;
      case 'SPLITTER':
        baseColor = '#581c87';
        borderColor = '#a855f7';
        badgeText = 'SPLIT';
        break;
      case 'KINETIC':
        baseColor = '#713f12';
        borderColor = '#ffe600';
        badgeText = 'KINETIC';
        break;
      case 'SHIELD':
        baseColor = '#064e3b';
        borderColor = '#00ff88';
        badgeText = 'SHIELD';
        break;
      case 'BOSS':
        baseColor = '#4a044e';
        borderColor = '#ff007f';
        badgeText = 'BOSS';
        break;
      default:
        baseColor = '#0f172a';
        borderColor = c.isCore ? '#ffe600' : '#00e5ff';
        break;
    }

    if (c.isCore && c.type !== 'BOSS') {
      borderColor = '#ffe600';
    }

    // Hit flash
    if (c.hitFlash > 0) {
      baseColor = '#ffffff';
    }

    // Draw cube body with rounded corners
    ctx.fillStyle = baseColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = c.isCore ? 3.5 : 2;

    roundRect(ctx, cx, cy, c.width, c.height, 10);
    ctx.fill();
    ctx.stroke();

    // Shield aura pulse if SHIELD cube
    if (c.type === 'SHIELD') {
      const pulseR = 30 + Math.sin(c.shieldPulse) * 8;
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.4)';
      ctx.lineWidth = 2;
      roundRect(ctx, cx - pulseR / 4, cy - pulseR / 4, c.width + pulseR / 2, c.height + pulseR / 2, 14);
      ctx.stroke();
    }

    // Core star/glow indicator
    if (c.isCore && c.type !== 'BOSS') {
      ctx.fillStyle = '#ffe600';
      ctx.beginPath();
      ctx.arc(cx + c.width / 2, cy + 14, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Frozen ice crystals
    if (c.isFrozen) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
      roundRect(ctx, cx, cy, c.width, c.height, 10);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Health / Type label
    ctx.fillStyle = c.hitFlash > 0 ? '#000000' : '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (c.type === 'BOSS') {
      ctx.font = 'bold 24px "Chakra Petch", sans-serif';
      ctx.fillText(`TESSERACT HP: ${c.hp}/${c.maxHp}`, cx + c.width / 2, cy + c.height / 2 - 15);
      // Health bar
      const barW = c.width - 40;
      const barH = 12;
      const barX = cx + 20;
      const barY = cy + c.height / 2 + 15;
      ctx.fillStyle = '#141d2d';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = '#ff007f';
      ctx.fillRect(barX, barY, Math.max(0, barW * (c.hp / c.maxHp)), barH);
    } else {
      ctx.font = 'bold 18px "Chakra Petch", sans-serif';
      const label = c.hp > 1 ? `${c.hp}` : badgeText;
      ctx.fillText(label, cx + c.width / 2, cy + c.height / 2);
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

    // Laser connection tether to boss
    ctx.strokeStyle = 'rgba(255, 0, 127, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(sx, sy);
    ctx.stroke();

    // Satellite diamond body
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(sat.angle * 2);

    ctx.fillStyle = '#4a044e';
    ctx.strokeStyle = '#ff007f';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.rect(-sat.width / 2, -sat.height / 2, sat.width, sat.height);
    ctx.fill();
    ctx.stroke();

    // Sat health
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${sat.hp}`, 0, 0);

    ctx.restore();
  }
}

function drawBasket(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  const b = engine.basket;

  // Basket glowing aura
  ctx.save();
  ctx.fillStyle = 'rgba(0, 255, 136, 0.15)';
  roundRect(ctx, b.x - 8, b.y - 6, b.width + 16, b.height + 12, 16);
  ctx.fill();

  // Basket main hull
  ctx.fillStyle = '#141d2d';
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 4;
  roundRect(ctx, b.x, b.y, b.width, b.height, 12);
  ctx.fill();
  ctx.stroke();

  // Catch zone indicator
  ctx.fillStyle = '#00ff88';
  ctx.beginPath();
  ctx.arc(b.x + b.width / 2, b.y + b.height / 2, 8, 0, Math.PI * 2);
  ctx.fill();

  // Side thruster glows
  ctx.fillStyle = '#00e5ff';
  ctx.fillRect(b.x + 4, b.y + b.height - 4, 12, 6);
  ctx.fillRect(b.x + b.width - 16, b.y + b.height - 4, 12, 6);

  ctx.restore();
}

function drawBalls(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  for (const b of engine.balls) {
    if (!b.isAlive) continue;

    // Draw motion trail
    if (b.trail.length > 1) {
      for (let i = 0; i < b.trail.length - 1; i++) {
        const p1 = b.trail[i];
        const p2 = b.trail[i + 1];
        const alpha = (i / b.trail.length) * 0.5;
        ctx.strokeStyle = b.isMini ? `rgba(168, 85, 247, ${alpha})` : `rgba(0, 229, 255, ${alpha})`;
        ctx.lineWidth = b.radius * (i / b.trail.length);
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.stroke();
      }
    }

    // Ball glowing outer halo
    ctx.fillStyle = b.isMini ? 'rgba(168, 85, 247, 0.4)' : 'rgba(0, 229, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius + 6, 0, Math.PI * 2);
    ctx.fill();

    // Ball inner core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = b.isMini ? '#a855f7' : '#00e5ff';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
}

function drawShards(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  for (const s of engine.shards) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate((s.rotation * Math.PI) / 180);
    ctx.fillStyle = s.color;
    ctx.globalAlpha = Math.max(0, s.life);

    ctx.beginPath();
    ctx.rect(-s.size / 2, -s.size / 2, s.size, s.size);
    ctx.fill();

    ctx.restore();
  }
}

function drawFloatingTexts(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 24px "Chakra Petch", sans-serif';

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
