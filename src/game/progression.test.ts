import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ARCHETYPES_DATA,
  RELICS_DATA,
  FUSION_COMBOS,
  getChapterForSector,
} from '../types/game';
import { ProgressionManager } from './progression';
import { GameEngine } from './GameEngine';

test('getChapterForSector maps sectors 1..25 to chapters 1..5', () => {
  assert.equal(getChapterForSector(1).id, 1);
  assert.equal(getChapterForSector(5).id, 1);
  assert.equal(getChapterForSector(6).id, 2);
  assert.equal(getChapterForSector(10).id, 2);
  assert.equal(getChapterForSector(15).id, 3);
  assert.equal(getChapterForSector(20).id, 4);
  assert.equal(getChapterForSector(25).id, 5);
});

test('ProgressionManager unlocks default archetypes and handles shard upgrades', () => {
  const pm = new ProgressionManager();
  assert.equal(pm.isArchetypeUnlocked('VOLT_OVERCHARGE'), true);
  assert.equal(pm.isArchetypeUnlocked('PYRO_DETONATOR'), true);
  assert.equal(pm.isArchetypeUnlocked('SWARM_MATRIX'), true);

  const initialBalls = pm.getData().upgradeExtraBalls;
  pm.addQuantumShards(500);
  const bought = pm.buyExtraBalls();
  assert.equal(bought, true);
  assert.equal(pm.getData().upgradeExtraBalls, initialBalls + 1);
});

test('GameEngine transitions from ARCHETYPE_SELECT to AIMING and fires a ball', () => {
  const pm = new ProgressionManager();
  const engine = new GameEngine(pm);
  assert.equal(engine.state, 'ARCHETYPE_SELECT');

  engine.selectArchetype('VOLT_OVERCHARGE', 'ARCADE');
  assert.equal(engine.state, 'AIMING');
  assert.equal(engine.currentArchetype, 'VOLT_OVERCHARGE');
  assert.ok(engine.cubes.length > 0);
  assert.ok(engine.getRemainingCoreCubes() > 0);

  const initialBalls = engine.ballsRemaining;
  engine.setAimAngle(540, 900);
  const fired = engine.shoot();
  assert.equal(fired, true);
  assert.equal(engine.state, 'BALL_IN_PLAY');
  assert.equal(engine.ballsRemaining, initialBalls - 1);
  assert.equal(engine.balls.length, 1);
});

test('All archetypes, relics, and fusion combos have valid metadata', () => {
  assert.equal(Object.keys(ARCHETYPES_DATA).length, 7);
  assert.ok(Object.keys(RELICS_DATA).length >= 19);
  assert.equal(Object.keys(FUSION_COMBOS).length, 5);
});
