import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getChapterForSector,
  ARCHETYPES_DATA,
  RELICS_DATA,
  FUSION_COMBOS,
} from '../types/game';
import { ProgressionManager } from './progression';
import { GameEngine } from './GameEngine';

test('getChapterForSector maps sectors 1..25 to chapters 1..5', () => {
  assert.equal(getChapterForSector(1).id, 1);
  assert.equal(getChapterForSector(5).id, 1);
  assert.equal(getChapterForSector(6).id, 2);
  assert.equal(getChapterForSector(10).id, 2);
  assert.equal(getChapterForSector(11).id, 3);
  assert.equal(getChapterForSector(15).id, 3);
  assert.equal(getChapterForSector(16).id, 4);
  assert.equal(getChapterForSector(20).id, 4);
  assert.equal(getChapterForSector(21).id, 5);
  assert.equal(getChapterForSector(25).id, 5);
});

test('Fresh ProgressionManager starts only with PROTO_CORE and 6 Tier 1 relics, unlocking progressively by chapter', () => {
  const pm = new ProgressionManager();
  pm.resetProgression();
  const data = pm.getData();

  // Only PROTO_CORE unlocked initially
  assert.deepEqual(data.unlockedArchetypes, ['PROTO_CORE']);
  assert.equal(pm.isArchetypeUnlocked('PROTO_CORE'), true);
  assert.equal(pm.isArchetypeUnlocked('VOLT_OVERCHARGE'), false);
  assert.equal(data.unlockedRelics.length, 6);

  // Reaching Sector 3 unlocks VOLT_OVERCHARGE + 3 relics
  pm.recordScoreAndLevel(1500, 3);
  assert.equal(pm.isArchetypeUnlocked('VOLT_OVERCHARGE'), true);
  assert.equal(data.unlockedRelics.length, 9);

  // Defeating Boss Sector 5 unlocks Chapter 2, PYRO_DETONATOR, KINETIC_TITAN & Tier 2 Relics
  pm.recordBossDefeated(5);
  assert.equal(data.storyProgress.highestChapterUnlocked, 2);
  assert.equal(pm.isArchetypeUnlocked('PYRO_DETONATOR'), true);
  assert.equal(pm.isArchetypeUnlocked('KINETIC_TITAN'), true);
  assert.equal(data.unlockedRelics.includes('SHRAPNEL_BURST'), true);

  // Defeating Boss Sector 10 unlocks Chapter 3, SWARM_MATRIX & CRYSTAL_SINGULARITY
  pm.recordBossDefeated(10);
  assert.equal(data.storyProgress.highestChapterUnlocked, 3);
  assert.equal(pm.isArchetypeUnlocked('SWARM_MATRIX'), true);
  assert.equal(pm.isArchetypeUnlocked('CRYSTAL_SINGULARITY'), true);
});

test('getAllowedCubeTypesForSector strictly gates cube mechanics across chapters', () => {
  const pm = new ProgressionManager();
  assert.deepEqual(pm.getAllowedCubeTypesForSector(1), ['NORMAL']);
  assert.deepEqual(pm.getAllowedCubeTypesForSector(2), ['NORMAL']);
  assert.deepEqual(pm.getAllowedCubeTypesForSector(3), ['NORMAL', 'KINETIC']);
  assert.deepEqual(pm.getAllowedCubeTypesForSector(7), ['NORMAL', 'KINETIC', 'EXPLOSIVE']);
  assert.equal(pm.getAllowedCubeTypesForSector(12).includes('SPLITTER'), true);
  assert.equal(pm.getAllowedCubeTypesForSector(12).includes('ARMOR'), true);
  assert.equal(pm.getAllowedCubeTypesForSector(12).includes('SHIELD'), false);
  assert.equal(pm.getAllowedCubeTypesForSector(17).includes('SHIELD'), true);
});

test('GameEngine starts PROTO_CORE with 0 relics, shows CHAPTER_INTRO, and transitions through SECTOR_MAP', () => {
  const pm = new ProgressionManager();
  pm.resetProgression();
  const engine = new GameEngine(pm);

  assert.equal(engine.state, 'ARCHETYPE_SELECT');

  // Start Story mode with PROTO_CORE -> enters CHAPTER_INTRO on Sector 1
  engine.selectArchetype('PROTO_CORE', 'STORY', 1, false);
  assert.equal(engine.state, 'CHAPTER_INTRO');
  assert.equal(engine.activeRelics.length, 0);
  assert.equal(engine.currentLevel, 1);

  // All cubes in Sector 1 are NORMAL
  assert.equal(
    engine.cubes.every((c) => c.type === 'NORMAL'),
    true
  );

  // Confirm Chapter Intro -> AIMING
  engine.confirmChapterIntro();
  assert.equal(engine.state, 'AIMING');

  // Fire a ball -> BALL_IN_PLAY
  const shot = engine.shoot();
  assert.equal(shot, true);
  assert.equal(engine.state, 'BALL_IN_PLAY');

  // Simulate Relic Draft -> Sector Map -> Event / Merchant / Elite
  engine.prepareRelicDraft();
  assert.equal(engine.state, 'RELIC_DRAFT');
  assert.equal(engine.draftChoices.length, 3);

  engine.selectRelic(engine.draftChoices[0]);
  assert.equal(engine.state, 'SECTOR_MAP');
  assert.equal(engine.nextMapNodes.length, 3);

  // Pick Elite node for Sector 2
  const eliteNode = engine.nextMapNodes.find((n) => n.type === 'ELITE');
  assert.ok(eliteNode);
  engine.selectSectorMapNode(eliteNode.id);
  assert.equal(engine.state, 'AIMING');
  assert.equal(engine.currentLevel, 2);
  assert.equal(engine.currentNodeType, 'ELITE');
});

test('All archetypes, relics, and fusion combos have valid metadata', () => {
  const archetypes = Object.values(ARCHETYPES_DATA);
  assert.equal(archetypes.length, 8);
  for (const arch of archetypes) {
    assert.ok(arch.title.length > 0);
    if (arch.initialRelic !== null) {
      assert.ok(RELICS_DATA[arch.initialRelic]);
    }
  }

  for (const fusion of Object.values(FUSION_COMBOS)) {
    assert.ok(fusion.title.length > 0);
    assert.ok(fusion.description.length > 0);
  }
});
