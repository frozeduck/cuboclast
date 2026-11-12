import React, { useRef, useEffect, useCallback } from 'react';
import {
  VIRTUAL_WIDTH,
  VIRTUAL_HEIGHT,
  CANNON_X,
  CANNON_Y,
  GRAVITY,
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
      drawVisualEffects(ctx, engine);
      drawBossSatellites(ctx, engine);
      drawFeverCapsules(ctx, engine);
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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (disabledRef.current) return;
      if (engine.state === 'FEVER' || engine.state === 'BALL_IN_PLAY') {
        const center = engine.basket.x + engine.basket.width / 2;
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          engine.steerBasketTo(center - 95);
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          engine.steerBasketTo(center + 95);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [engine]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    if (engine.state === 'FEVER' || engine.state === 'BALL_IN_PLAY') {
      isPointerDownRef.current = true;
      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      updatePointerAction(e);
      return;
    }
    if (engine.state !== 'AIMING') return;
    isPointerDownRef.current = true;
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    updatePointerAction(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (disabled) return;
    if (engine.state === 'FEVER') {
      updatePointerAction(e);
      return;
    }
    if (!isPointerDownRef.current) return;
    if (engine.state === 'AIMING' || engine.state === 'BALL_IN_PLAY') {
      updatePointerAction(e);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (disabled || !isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    if (engine.state === 'AIMING') {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const { scale, offsetY } = getScaleInfo();
        const vy = (e.clientY - rect.top - offsetY) / scale;
        // If user dragged the bottom basket slider track while aiming, steer basket without firing
        if (vy > 1680) {
          return;
        }
      }
      updatePointerAction(e);
      engine.shoot();
    }
  };

  const updatePointerAction = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const { scale, offsetX, offsetY } = getScaleInfo();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const vx = (clientX - offsetX) / scale;
    const vy = (clientY - offsetY) / scale;

    if (engine.state === 'FEVER') {
      engine.steerBasketTo(vx);
      return;
    }

    if (engine.state === 'BALL_IN_PLAY' && vy > 980) {
      engine.steerBasketTo(vx);
      return;
    }

    if (engine.state === 'AIMING') {
      if (vy > 1680) {
        engine.steerBasketTo(vx);
      } else if (vy > 100) {
        engine.setAimAngle(vx, vy);
      }
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

// ----------------- Minimalist Matte Monochrome & Mineral Rendering (v0.15.0 Style) -----------------

function drawBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#0a0b0e';
  ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
  ctx.lineWidth = 1;
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

  ctx.strokeStyle = '#181a20';
  ctx.lineWidth = 6;
  ctx.strokeRect(4, 4, VIRTUAL_WIDTH - 8, VIRTUAL_HEIGHT - 8);

  ctx.strokeStyle = '#2d313b';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(6, 6, VIRTUAL_WIDTH - 12, VIRTUAL_HEIGHT - 12);
}

function drawCannon(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  const cx = CANNON_X;
  const cy = CANNON_Y;
  const cannonColor = engine.currentArchetype
    ? ARCHETYPES_DATA[engine.currentArchetype]?.color || '#e4e4e7'
    : '#e4e4e7';

  // Subtle arena pattern banner during AIMING
  if (engine.state === 'AIMING' && engine.currentPatternName) {
    ctx.save();
    ctx.font = 'bold 17px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(212, 212, 216, 0.55)';
    ctx.fillText(engine.currentPatternName.toUpperCase(), VIRTUAL_WIDTH / 2, 268);
    ctx.restore();
  }

  ctx.fillStyle = '#12141a';
  ctx.beginPath();
  ctx.arc(cx, cy, 38, 0, Math.PI * 2);
  ctx.fill();

  if (engine.nextSectorOverchargeStacks > 0 && engine.state === 'AIMING') {
    ctx.strokeStyle = '#d4b483';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 48, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = '#3f4452';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 38, 0, Math.PI * 2);
  ctx.stroke();

  const barrelLen = 52;
  const barrelX = cx + Math.cos(engine.aimAngle) * barrelLen;
  const barrelY = cy + Math.sin(engine.aimAngle) * barrelLen;

  ctx.strokeStyle = cannonColor;
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(barrelX, barrelY);
  ctx.stroke();
  ctx.lineCap = 'butt';

  ctx.fillStyle = '#f4f4f5';
  ctx.beginPath();
  ctx.arc(cx, cy, 12, 0, Math.PI * 2);
  ctx.fill();
}

function drawAimTrajectory(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  const launchSpeed = engine.getLaunchSpeed();
  const simDt = 1 / 60;
  const ballRadius = 18;

  // Start from exact ball spawn point in GameEngine.shoot()
  let x = CANNON_X;
  let y = CANNON_Y + 25;
  let vx = Math.cos(engine.aimAngle) * launchSpeed;
  let vy = Math.sin(engine.aimAngle) * launchSpeed;

  const primaryPoints: { x: number; y: number }[] = [{ x, y }];
  let hitOccurred = false;
  let hitX = x;
  let hitY = y;
  let postVx = vx;
  let postVy = vy;

  const maxPrimarySteps = 95;
  for (let step = 0; step < maxPrimarySteps; step++) {
    vy += GRAVITY * simDt;
    x += vx * simDt;
    y += vy * simDt;

    // Left / Right wall bounce
    if (x - ballRadius < 25) {
      x = 25 + ballRadius;
      vx = Math.abs(vx) * 0.94;
      hitOccurred = true;
      hitX = x;
      hitY = y;
      postVx = vx;
      postVy = vy;
      primaryPoints.push({ x, y });
      break;
    } else if (x + ballRadius > VIRTUAL_WIDTH - 25) {
      x = VIRTUAL_WIDTH - 25 - ballRadius;
      vx = -Math.abs(vx) * 0.94;
      hitOccurred = true;
      hitX = x;
      hitY = y;
      postVx = vx;
      postVy = vy;
      primaryPoints.push({ x, y });
      break;
    }

    // Ceiling bounce
    if (y - ballRadius < 70) {
      y = 70 + ballRadius;
      vy = Math.abs(vy) * 0.85;
      hitOccurred = true;
      hitX = x;
      hitY = y;
      postVx = vx;
      postVy = vy;
      primaryPoints.push({ x, y });
      break;
    }

    // Boss Satellite collision check (matches GameEngine.handleBossSatellites)
    if (engine.activeBoss && engine.activeBoss.isAlive) {
      const bcx = engine.activeBoss.x + engine.activeBoss.width * 0.5;
      const bcy = engine.activeBoss.y + engine.activeBoss.height * 0.5;
      let satHit = false;
      for (const sat of engine.bossSatellites) {
        if (!sat.isAlive) continue;
        const sx = bcx + Math.cos(sat.angle) * sat.distance;
        const sy = bcy + Math.sin(sat.angle) * sat.distance;
        const dx = x - sx;
        const dy = y - sy;
        const dist = Math.hypot(dx, dy);
        if (dist < ballRadius + sat.width * 0.5) {
          const nx = dist > 0.01 ? dx / dist : 0;
          const ny = dist > 0.01 ? dy / dist : -1;
          const spd = Math.hypot(vx, vy);
          hitOccurred = true;
          hitX = x;
          hitY = y;
          postVx = nx * spd * 0.95;
          postVy = ny * spd * 0.95;
          primaryPoints.push({ x, y });
          satHit = true;
          break;
        }
      }
      if (satHit) break;
    }

    // Cube collision check (matches GameEngine.handleCubeCollisions)
    let cubeHit = false;
    for (const c of engine.cubes) {
      if (!c.isAlive) continue;
      const closestX = Math.max(c.x, Math.min(x, c.x + c.width));
      const closestY = Math.max(c.y, Math.min(y, c.y + c.height));
      const dx = x - closestX;
      const dy = y - closestY;
      const distSq = dx * dx + dy * dy;

      if (distSq <= ballRadius * ballRadius) {
        const overlapLeft = x + ballRadius - c.x;
        const overlapRight = c.x + c.width - (x - ballRadius);
        const overlapTop = y + ballRadius - c.y;
        const overlapBottom = c.y + c.height - (y - ballRadius);
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

        let rvx = vx;
        let rvy = vy;
        if (minOverlap === overlapLeft) {
          x = c.x - ballRadius;
          rvx = -Math.abs(vx) * 0.95;
        } else if (minOverlap === overlapRight) {
          x = c.x + c.width + ballRadius;
          rvx = Math.abs(vx) * 0.95;
        } else if (minOverlap === overlapTop) {
          y = c.y - ballRadius;
          rvy = -Math.abs(vy) * 0.88;
        } else {
          y = c.y + c.height + ballRadius;
          rvy = Math.abs(vy) * 0.92;
        }

        if (c.type === 'KINETIC') {
          rvx *= 1.35;
          rvy = -Math.abs(rvy) * 1.35;
        }

        hitOccurred = true;
        hitX = x;
        hitY = y;
        postVx = rvx;
        postVy = rvy;
        primaryPoints.push({ x, y });
        cubeHit = true;
        break;
      }
    }

    if (cubeHit) break;

    primaryPoints.push({ x, y });
    if (y > VIRTUAL_HEIGHT - 120) {
      hitX = x;
      hitY = y;
      break;
    }
  }

  // Simulate secondary post-bounce arc with real gravity
  const secondaryPoints: { x: number; y: number }[] = [];
  if (hitOccurred) {
    let sx = hitX;
    let sy = hitY;
    let svx = postVx;
    let svy = postVy;
    secondaryPoints.push({ x: sx, y: sy });

    for (let step = 0; step < 24; step++) {
      svy += GRAVITY * simDt;
      sx += svx * simDt;
      sy += svy * simDt;
      if (sx - ballRadius < 25) {
        sx = 25 + ballRadius;
        svx = Math.abs(svx) * 0.94;
      } else if (sx + ballRadius > VIRTUAL_WIDTH - 25) {
        sx = VIRTUAL_WIDTH - 25 - ballRadius;
        svx = -Math.abs(svx) * 0.94;
      }
      secondaryPoints.push({ x: sx, y: sy });
    }
  }

  ctx.save();

  // Draw primary curved trajectory line (clean monochrome silver)
  if (primaryPoints.length > 1) {
    ctx.strokeStyle = 'rgba(228, 228, 231, 0.36)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(primaryPoints[0].x, primaryPoints[0].y);
    for (let i = 1; i < primaryPoints.length; i++) {
      ctx.lineTo(primaryPoints[i].x, primaryPoints[i].y);
    }
    ctx.stroke();

    // Draw spaced trajectory dots along the parabolic curve
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(244, 244, 245, 0.78)';
    for (let i = 3; i < primaryPoints.length; i += 4) {
      ctx.beginPath();
      ctx.arc(primaryPoints[i].x, primaryPoints[i].y, 3.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw secondary bounce trajectory arc (subtle muted slate)
  if (secondaryPoints.length > 1) {
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.32)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.moveTo(secondaryPoints[0].x, secondaryPoints[0].y);
    for (let i = 1; i < secondaryPoints.length; i++) {
      ctx.lineTo(secondaryPoints[i].x, secondaryPoints[i].y);
    }
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(148, 163, 184, 0.55)';
    for (let i = 3; i < secondaryPoints.length; i += 4) {
      ctx.beginPath();
      ctx.arc(secondaryPoints[i].x, secondaryPoints[i].y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw minimal warm-sand target crosshair at true first hit point
  ctx.setLineDash([]);
  ctx.strokeStyle = '#d4b483';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(hitX, hitY, 14, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(hitX - 20, hitY);
  ctx.lineTo(hitX - 9, hitY);
  ctx.moveTo(hitX + 9, hitY);
  ctx.lineTo(hitX + 20, hitY);
  ctx.moveTo(hitX, hitY - 20);
  ctx.lineTo(hitX, hitY - 9);
  ctx.moveTo(hitX, hitY + 9);
  ctx.lineTo(hitX, hitY + 20);
  ctx.stroke();

  ctx.restore();
}

function drawCubes(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  for (const c of engine.cubes) {
    if (!c.isAlive) continue;

    ctx.save();
    const wScale = 1.0 + c.wobble * 0.14;
    const hScale = 1.0 - c.wobble * 0.11;
    const centerX = c.x + c.width / 2;
    const centerY = c.y + c.height / 2;
    const drawW = c.width * wScale;
    const drawH = c.height * hScale;
    const rx = centerX - drawW / 2;
    const ry = centerY - drawH / 2;

    let baseColor = '#12141a';
    let strokeColor = '#3f4452';

    const activeClassColor = engine.currentArchetype
      ? ARCHETYPES_DATA[engine.currentArchetype]?.color || '#e4e4e7'
      : '#e4e4e7';

    if (c.isCore && c.type !== 'BOSS') {
      baseColor = '#1c1813';
      strokeColor = '#d4b483';
    } else {
      switch (c.type) {
        case 'CLASS_ABILITY':
          baseColor = '#181b26';
          strokeColor = activeClassColor;
          break;
        case 'EXPLOSIVE':
          baseColor = '#1f1412';
          strokeColor = '#c87d65';
          break;
        case 'SPLITTER':
          baseColor = '#181622';
          strokeColor = '#9b95b8';
          break;
        case 'KINETIC':
          baseColor = '#181a20';
          strokeColor = '#a1a1aa';
          break;
        case 'SHIELD':
          baseColor = '#121916';
          strokeColor = '#7fa68e';
          break;
        case 'ARMOR':
          baseColor = '#161922';
          strokeColor = '#7c9cb4';
          break;
        case 'BOSS':
          baseColor = engine.bossPhase === 3 ? '#221215' : '#181215';
          strokeColor = engine.bossPhase === 3 ? '#c87d65' : '#c46d75';
          break;
        default:
          baseColor = '#12141a';
          strokeColor = '#3f4452';
          break;
      }
    }

    if (c.isFrozen) {
      baseColor = '#131b24';
      strokeColor = '#8ab4c9';
    }

    // Minimalist rounded rect body
    ctx.fillStyle = baseColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = c.isCore ? 3.0 : c.type === 'CLASS_ABILITY' ? 3.0 : 2.0;

    roundRect(ctx, rx, ry, drawW, drawH, 10);
    ctx.fill();
    ctx.stroke();

    // Distinct Geometric Signature per Cube Family (instant visual readability without text)
    if (c.isCore && c.type !== 'BOSS') {
      const pulse = 0.4 + Math.sin(c.shieldPulse) * 0.2;
      ctx.strokeStyle = `rgba(212, 180, 131, ${pulse.toFixed(2)})`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(centerX, centerY, (drawH / 2) * 0.7, 0, Math.PI * 2);
      ctx.stroke();
    } else if (c.type === 'CLASS_ABILITY') {
      // Unmistakable rotated diamond (◇) + 4 corner ticks in active class color
      const dw = drawW * 0.44;
      const dh = drawH * 0.46;
      ctx.strokeStyle = strokeColor;
      ctx.globalAlpha = 0.72;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - dh);
      ctx.lineTo(centerX + dw, centerY);
      ctx.lineTo(centerX, centerY + dh);
      ctx.lineTo(centerX - dw, centerY);
      ctx.closePath();
      ctx.stroke();

      // Small corner accent ticks so ◇ blocks pop immediately on mobile without obscuring the HP number
      ctx.fillStyle = strokeColor;
      ctx.fillRect(rx + 6, ry + 6, 4, 4);
      ctx.fillRect(rx + drawW - 10, ry + 6, 4, 4);
      ctx.fillRect(rx + 6, ry + drawH - 10, 4, 4);
      ctx.fillRect(rx + drawW - 10, ry + drawH - 10, 4, 4);
      ctx.globalAlpha = 1.0;
    } else if (c.type === 'EXPLOSIVE') {
      // Diagonal X cross for Explosive cubes
      ctx.strokeStyle = 'rgba(200, 125, 101, 0.42)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(rx + 12, ry + 10);
      ctx.lineTo(rx + drawW - 12, ry + drawH - 10);
      ctx.moveTo(rx + drawW - 12, ry + 10);
      ctx.lineTo(rx + 12, ry + drawH - 10);
      ctx.stroke();
    } else if (c.type === 'SPLITTER') {
      // Triad dots (∴) on left/right flanks for Splitter cubes
      ctx.fillStyle = 'rgba(155, 149, 184, 0.55)';
      ctx.beginPath();
      ctx.arc(rx + 13, centerY - 6, 2.6, 0, Math.PI * 2);
      ctx.arc(rx + 13, centerY + 6, 2.6, 0, Math.PI * 2);
      ctx.arc(rx + drawW - 13, centerY - 6, 2.6, 0, Math.PI * 2);
      ctx.arc(rx + drawW - 13, centerY + 6, 2.6, 0, Math.PI * 2);
      ctx.fill();
    } else if (c.type === 'KINETIC') {
      // Double bounce chevrons on left & right of Kinetic bumpers
      ctx.strokeStyle = 'rgba(212, 180, 131, 0.45)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(rx + 10, centerY - 7);
      ctx.lineTo(rx + 16, centerY);
      ctx.lineTo(rx + 10, centerY + 7);
      ctx.moveTo(rx + drawW - 10, centerY - 7);
      ctx.lineTo(rx + drawW - 16, centerY);
      ctx.lineTo(rx + drawW - 10, centerY + 7);
      ctx.stroke();
    } else if (c.type === 'ARMOR') {
      // Reinforced double inner frame + rivets for Armor walls
      ctx.strokeStyle = 'rgba(124, 156, 180, 0.42)';
      ctx.lineWidth = 1.8;
      roundRect(ctx, rx + 5, ry + 5, drawW - 10, drawH - 10, 6);
      ctx.stroke();
    }

    // Subtle shield frame for SHIELD cubes
    if (c.type === 'SHIELD') {
      const pulseR = 10 + Math.sin(c.shieldPulse) * 3;
      ctx.strokeStyle = 'rgba(127, 166, 142, 0.3)';
      ctx.lineWidth = 1.5;
      roundRect(ctx, rx - pulseR / 2, ry - pulseR / 2, drawW + pulseR, drawH + pulseR, 12);
      ctx.stroke();
    }

    // Hit flash overlay
    if (c.hitFlash > 0) {
      ctx.fillStyle = `rgba(244, 244, 245, ${Math.min(0.85, c.hitFlash * 0.55)})`;
      roundRect(ctx, rx, ry, drawW, drawH, 10);
      ctx.fill();
    }

    // Clean numeric HP only
    ctx.fillStyle =
      c.isCore && c.type !== 'BOSS'
        ? '#e6cfa0'
        : c.type === 'CLASS_ABILITY'
        ? activeClassColor
        : '#e4e4e7';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font =
      c.type === 'BOSS'
        ? 'bold 42px "Chakra Petch", sans-serif'
        : 'bold 23px "Chakra Petch", sans-serif';
    ctx.fillText(String(c.hp), centerX, centerY);

    // Boss HP bar & Frontal Shield Indicator for The Monolith
    if (c.type === 'BOSS') {
      const barW = 320;
      const barH = 10;
      const barX = centerX - barW / 2;
      const barY = ry - 34;
      ctx.fillStyle = '#181a20';
      ctx.fillRect(barX, barY, barW, barH);
      const hpRatio = Math.max(0, c.hp / c.maxHp);
      ctx.fillStyle =
        engine.bossPhase === 3 ? '#c87d65' : engine.bossPhase === 2 ? '#d4b483' : '#c46d75';
      ctx.fillRect(barX, barY, barW * hpRatio, barH);
      ctx.strokeStyle = '#52525b';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, barH);

      const chapter = getChapterForSector(engine.currentLevel);
      ctx.fillStyle = '#d4d4d8';
      ctx.font = 'bold 18px "Chakra Petch", sans-serif';
      ctx.fillText(
        `${chapter.bossName.toUpperCase()} · FASE ${engine.bossPhase}/3`,
        centerX,
        barY - 12
      );

      // Chapter 1 Boss Rule: Frontal Deflector Shield along the bottom edge
      if (engine.currentLevel === 5) {
        if (!engine.bossFrontShieldBrokenThisShot) {
          ctx.strokeStyle = '#7c9cb4';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(rx + 8, ry + drawH + 5);
          ctx.lineTo(rx + drawW - 8, ry + drawH + 5);
          ctx.stroke();

          ctx.fillStyle = '#7c9cb4';
          ctx.font = 'bold 14px "Chakra Petch", sans-serif';
          ctx.fillText('🛡️ SCUDO FRONTALE · COLPISCI I NODI ◇ O I LATI', centerX, ry + drawH + 22);
        } else {
          ctx.fillStyle = '#7fa68e';
          ctx.font = 'bold 14px "Chakra Petch", sans-serif';
          ctx.fillText('⚡ SCUDO FRONTALE DISATTIVATO!', centerX, ry + drawH + 22);
        }
      }
    }

    ctx.restore();
  }
}

function drawVisualEffects(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  if (engine.visualEffects.length === 0) return;

  for (const fx of engine.visualEffects) {
    const progress = 1 - Math.max(0, fx.life / fx.maxLife);
    const alpha = Math.max(0, Math.min(1, fx.life / fx.maxLife));
    ctx.save();

    if (fx.type === 'RING' && fx.radius) {
      const currentR = fx.radius * (0.35 + 0.65 * progress);
      ctx.strokeStyle = fx.color;
      ctx.globalAlpha = alpha * 0.85;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(fx.x1, fx.y1, currentR, 0, Math.PI * 2);
      ctx.stroke();

      // Dashed outer boundary showing full blast radius
      ctx.globalAlpha = alpha * 0.35;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(fx.x1, fx.y1, fx.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (fx.type === 'LIGHTNING' && fx.x2 !== undefined && fx.y2 !== undefined) {
      const x1 = fx.x1;
      const y1 = fx.y1;
      const x2 = fx.x2;
      const y2 = fx.y2;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const nx = -dy * 0.12;
      const ny = dx * 0.12;
      const sign = fx.id % 2 === 0 ? 1 : -1;

      ctx.strokeStyle = fx.color;
      ctx.globalAlpha = alpha * 0.95;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 + dx * 0.33 + nx * sign, y1 + dy * 0.33 + ny * sign);
      ctx.lineTo(x1 + dx * 0.66 - nx * sign * 0.8, y1 + dy * 0.66 - ny * sign * 0.8);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Inner bright core line
      ctx.strokeStyle = '#f4f4f5';
      ctx.globalAlpha = alpha * 0.75;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Origin & target terminal nodes
      ctx.fillStyle = fx.color;
      ctx.beginPath();
      ctx.arc(x1, y1, 5, 0, Math.PI * 2);
      ctx.arc(x2, y2, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (fx.type === 'BEAM' && fx.x2 !== undefined && fx.y2 !== undefined) {
      ctx.strokeStyle = fx.color;
      ctx.globalAlpha = alpha * 0.9;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(fx.x1, fx.y1);
      ctx.lineTo(fx.x2, fx.y2);
      ctx.stroke();

      ctx.strokeStyle = '#f4f4f5';
      ctx.globalAlpha = alpha * 0.7;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(fx.x1, fx.y1);
      ctx.lineTo(fx.x2, fx.y2);
      ctx.stroke();
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

    ctx.strokeStyle = 'rgba(161, 161, 170, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(sx, sy);
    ctx.stroke();

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(sat.angle * 2);

    ctx.fillStyle = '#181519';
    ctx.strokeStyle = '#a1a1aa';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.rect(-sat.width / 2, -sat.height / 2, sat.width, sat.height);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#e4e4e7';
    ctx.font = 'bold 14px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${sat.hp}`, 0, 0);

    ctx.restore();
  }
}

function drawFeverCapsules(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  if (engine.feverCapsules.length === 0) return;

  for (const cap of engine.feverCapsules) {
    if (!cap.isAlive) continue;
    ctx.save();
    const rx = cap.x - cap.width / 2;
    const ry = cap.y - cap.height / 2;

    ctx.fillStyle = '#14171f';
    ctx.strokeStyle = cap.color;
    ctx.lineWidth = 2.5;
    roundRect(ctx, rx, ry, cap.width, cap.height, 22);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = cap.color;
    ctx.font = 'bold 18px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(cap.label, cap.x, cap.y + 1);
    ctx.restore();
  }
}

function drawBasket(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  const b = engine.basket;
  ctx.save();

  // 1. Calm Second-Skill Aid: Landing Prediction Marker on the basket rail when main ball is falling
  for (const ball of engine.balls) {
    if (ball.isAlive && !ball.isMini && ball.vy > 0 && ball.y > 880 && ball.y < b.y) {
      const timeToBasket = Math.max(0, (b.y - ball.y) / Math.max(220, ball.vy));
      let predX = ball.x + ball.vx * timeToBasket;
      if (predX < 40) predX = 40 + (40 - predX);
      if (predX > VIRTUAL_WIDTH - 40) predX = VIRTUAL_WIDTH - 40 - (predX - (VIRTUAL_WIDTH - 40));
      predX = Math.max(50, Math.min(VIRTUAL_WIDTH - 50, predX));

      ctx.strokeStyle = 'rgba(212, 180, 131, 0.38)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(ball.x, ball.y + ball.radius);
      ctx.lineTo(predX, b.y - 6);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#d4b483';
      ctx.beginPath();
      ctx.arc(predX, b.y - 8, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2. Main Basket Body (at y = 1710, above the thumb zone)
  ctx.fillStyle = '#14171f';
  ctx.strokeStyle = '#d4d4d8';
  ctx.lineWidth = 2.8;
  roundRect(ctx, b.x, b.y, b.width, b.height, 10);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#71717a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(b.x + 22, b.y + b.height / 2);
  ctx.lineTo(b.x + b.width - 22, b.y + b.height / 2);
  ctx.stroke();

  // Subtle top capture arc
  ctx.strokeStyle = 'rgba(212, 180, 131, 0.28)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(
    b.x + b.width / 2,
    b.y - 6,
    Math.max(20, b.width / 2 - 10),
    16,
    0,
    Math.PI,
    Math.PI * 2
  );
  ctx.stroke();

  // 3. Ergonomic Mobile Thumb Slider Track below the basket (y = 1815) so player's finger never covers the basket
  const trackY = 1815;
  const basketCenter = b.x + b.width / 2;
  ctx.strokeStyle = 'rgba(161, 161, 170, 0.18)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(90, trackY);
  ctx.lineTo(VIRTUAL_WIDTH - 90, trackY);
  ctx.stroke();

  // Vertical connector from thumb knob to basket
  ctx.strokeStyle = 'rgba(212, 180, 131, 0.22)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(basketCenter, b.y + b.height);
  ctx.lineTo(basketCenter, trackY - 14);
  ctx.stroke();

  // Thumb pill on the lower rail
  ctx.fillStyle = '#161922';
  ctx.strokeStyle = 'rgba(212, 212, 216, 0.45)';
  ctx.lineWidth = 1.8;
  roundRect(ctx, basketCenter - 54, trackY - 14, 108, 28, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'rgba(212, 212, 216, 0.65)';
  ctx.font = 'bold 13px "Chakra Petch", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('◂ GUIDA ▸', basketCenter, trackY + 1);

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
          ? `rgba(161, 161, 170, ${(ratio * 0.38).toFixed(2)})`
          : `rgba(228, 228, 231, ${(ratio * 0.42).toFixed(2)})`;
        ctx.lineWidth = b.radius * 1.2 * ratio;
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.fillStyle = b.isMini ? '#a1a1aa' : '#f4f4f5';
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
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
