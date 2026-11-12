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

test('Fresh ProgressionManager starts only with PROTO_CORE and 6 COMMON relics, unlocking UNCOMMON/RARE/EPIC/LEGENDARY by Boss kills', () => {
  const pm = new ProgressionManager();
  pm.resetProgression();
  const data = pm.getData();

  // Only PROTO_CORE unlocked initially
  assert.deepEqual(data.unlockedArchetypes, ['PROTO_CORE']);
  assert.equal(pm.isArchetypeUnlocked('PROTO_CORE'), true);
  assert.equal(pm.isArchetypeUnlocked('VOLT_OVERCHARGE'), false);
  assert.equal(data.unlockedRelics.length, 6);
  assert.equal(
    data.unlockedRelics.every((id) => RELICS_DATA[id].rarity === 'COMMON'),
    true
  );

  // Reaching Sector 3 alone does NOT unlock Boss-gated archetypes/relics
  pm.recordScoreAndLevel(1500, 3);
  assert.equal(pm.isArchetypeUnlocked('VOLT_OVERCHARGE'), false);
  assert.equal(data.unlockedRelics.length, 6);

  // Defeating Boss 1 (Sector 5) unlocks Chapter 2, VOLT_OVERCHARGE, PYRO_DETONATOR & UNCOMMON Relics
  pm.recordBossDefeated(5);
  assert.equal(data.storyProgress.highestChapterUnlocked, 2);
  assert.equal(pm.isArchetypeUnlocked('VOLT_OVERCHARGE'), true);
  assert.equal(pm.isArchetypeUnlocked('PYRO_DETONATOR'), true);
  assert.equal(data.unlockedRelics.includes('CHAIN_LIGHTNING'), true);
  assert.equal(data.unlockedRelics.includes('SHRAPNEL_BURST'), false);

  // Defeating Boss 2 (Sector 10) unlocks Chapter 3, KINETIC_TITAN, SWARM_MATRIX & RARE Relics
  pm.recordBossDefeated(10);
  assert.equal(data.storyProgress.highestChapterUnlocked, 3);
  assert.equal(pm.isArchetypeUnlocked('KINETIC_TITAN'), true);
  assert.equal(pm.isArchetypeUnlocked('SWARM_MATRIX'), true);
  assert.equal(data.unlockedRelics.includes('SHRAPNEL_BURST'), true);

  // Defeating Boss 3 (Sector 15) unlocks EPIC Relics & CRYSTAL_SINGULARITY / CHRONO_PULSE
  pm.recordBossDefeated(15);
  assert.equal(data.storyProgress.highestChapterUnlocked, 4);
  assert.equal(pm.isArchetypeUnlocked('CRYSTAL_SINGULARITY'), true);
  assert.equal(pm.isArchetypeUnlocked('CHRONO_PULSE'), true);
  assert.equal(data.unlockedRelics.includes('CLUSTER_CHARGE'), true);

  // Defeating Boss 4 (Sector 20) unlocks LEGENDARY Relics & QUANTUM_SINGULARITY
  pm.recordBossDefeated(20);
  assert.equal(data.storyProgress.highestChapterUnlocked, 5);
  assert.equal(pm.isArchetypeUnlocked('QUANTUM_SINGULARITY'), true);
  assert.equal(data.unlockedRelics.includes('SUPERNOVA'), true);
});

test('getAllowedCubeTypesForSector strictly gates cube mechanics across chapters', () => {
  const pm = new ProgressionManager();
  pm.resetProgression();
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

  // All cubes in Sector 1 are NORMAL or CLASS_ABILITY (3 Class Ability blocks spawned)
  assert.equal(
    engine.cubes.every((c) => c.type === 'NORMAL' || c.type === 'CLASS_ABILITY'),
    true
  );
  const classBlocksSector1 = engine.cubes.filter((c) => c.type === 'CLASS_ABILITY');
  assert.equal(classBlocksSector1.length, 3);

  // Confirm Chapter Intro -> Starter Relic Draft (isStarterDraft = true) -> pick relic -> AIMING on Sector 1
  engine.confirmChapterIntro();
  assert.equal(engine.state, 'RELIC_DRAFT');
  assert.equal(engine.isStarterDraft, true);
  assert.equal(engine.draftChoices.length, 3);
  engine.selectRelic(engine.draftChoices[0]);
  assert.equal(engine.state, 'AIMING');
  assert.equal(engine.isStarterDraft, false);
  assert.equal(engine.activeRelics.length, 1);
  assert.equal(engine.nextSectorOverchargeStacks, 1);

  // Fire a ball -> BALL_IN_PLAY
  const shot = engine.shoot();
  assert.equal(shot, true);
  assert.equal(engine.state, 'BALL_IN_PLAY');

  // Simulate post-sector Relic Draft -> Sector Map -> Event / Merchant / Elite
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

test('Hybrid B: Boss kills permanently evolve world cube types and SWARM_MATRIX class blocks spawn mini-balls', () => {
  const pm = new ProgressionManager();
  pm.resetProgression();

  // Before Boss 1 is defeated, Sector 3 only allows NORMAL and KINETIC
  assert.deepEqual(pm.getAllowedCubeTypesForSector(3), ['NORMAL', 'KINETIC']);

  // Defeat Boss 1 (Sector 5) and Boss 2 (Sector 10) -> Sector 3 now also includes EXPLOSIVE, SPLITTER, ARMOR
  pm.recordBossDefeated(5);
  pm.recordBossDefeated(10);
  const evolvedSector3 = pm.getAllowedCubeTypesForSector(3);
  assert.equal(evolvedSector3.includes('EXPLOSIVE'), true);
  assert.equal(evolvedSector3.includes('SPLITTER'), true);
  assert.equal(evolvedSector3.includes('ARMOR'), true);

  // Select SWARM_MATRIX (now unlocked by Boss 2) and verify CLASS_ABILITY cubes spawn and trigger mini-balls on hit
  const engine = new GameEngine(pm);
  engine.selectArchetype('SWARM_MATRIX', 'STORY', 1, true);
  const swarmBlock = engine.cubes.find((c) => c.type === 'CLASS_ABILITY');
  assert.ok(swarmBlock);

  // Place a ball directly colliding with the SWARM_MATRIX CLASS_ABILITY cube
  engine.balls = [
    {
      x: swarmBlock.x + swarmBlock.width / 2,
      y: swarmBlock.y + swarmBlock.height / 2,
      vx: 0,
      vy: -400,
      radius: 18,
      isMini: false,
      isAlive: true,
      bounces: 0,
      baseDamage: 10, // enough to shatter the block immediately
      trail: [],
      hasSavedOnce: false,
    },
  ];
  engine.setState('BALL_IN_PLAY');
  engine.update(0.016);

  // Shattering a SWARM_MATRIX CLASS_ABILITY cube spawns 3 mini-balls (1 main ball + 3 mini-balls = 4 balls)
  const miniBalls = engine.balls.filter((b) => b.isMini);
  assert.equal(miniBalls.length, 3);
});

test('All archetypes, relics, and fusion combos have valid metadata', () => {
  const archetypes = Object.values(ARCHETYPES_DATA);
  assert.equal(archetypes.length, 8);
  for (const arch of archetypes) {
    assert.ok(arch.title.length > 0);
    assert.ok(arch.classBlockName.length > 0);
    assert.ok(arch.classBlockEffect.length > 0);
    if (arch.initialRelic !== null) {
      assert.ok(RELICS_DATA[arch.initialRelic]);
    }
  }

  for (const fusion of Object.values(FUSION_COMBOS)) {
    assert.ok(fusion.title.length > 0);
    assert.ok(fusion.description.length > 0);
  }
});

test('10 permanent Meta-Upgrades purchase, gameplay effect application, and 100% shard respec', () => {
  const pm = new ProgressionManager();
  pm.resetProgression();
  pm.addQuantumShards(1000);

  // Buy BASE_DAMAGE (cost 90),SHARD_MULTIPLIER (cost 50), MERCHANT_DISCOUNT (cost 55), BASKET_WIDTH (cost 45)
  assert.equal(pm.buyUpgrade('BASE_DAMAGE'), true);
  assert.equal(pm.getUpgradeLevel('BASE_DAMAGE'), 1);
  assert.equal(pm.buyUpgrade('SHARD_MULTIPLIER'), true);
  assert.equal(pm.getUpgradeLevel('SHARD_MULTIPLIER'), 1);
  assert.equal(pm.buyUpgrade('MERCHANT_DISCOUNT'), true);
  assert.equal(pm.getUpgradeLevel('MERCHANT_DISCOUNT'), 1);
  assert.equal(pm.buyUpgrade('BASKET_WIDTH'), true);
  assert.equal(pm.getUpgradeLevel('BASKET_WIDTH'), 1);

  const expectedSpent = 90 + 50 + 55 + 45;
  assert.equal(pm.getTotalShardsInvestedInUpgrades(), expectedSpent);
  assert.equal(pm.getData().quantumShards, 1000 - expectedSpent);

  const engine = new GameEngine(pm);
  engine.selectArchetype('PROTO_CORE', 'STORY', 1, true);

  // Effective base damage is 1 + 0.5 = 1.5
  assert.equal(engine.getEffectiveBaseDamage(), 1.5);
  // Basket width is 165 + 18 = 183
  assert.equal(engine.basket.width, 183);
  // Merchant BALLS cost is discounted by 12% from 20 -> 18
  assert.equal(engine.getMerchantItemCost('BALLS'), 18);

  // Refund all upgrades returns 100% of invested shards and resets levels to 0
  const refunded = pm.refundAllUpgrades();
  assert.equal(refunded, expectedSpent);
  assert.equal(pm.getData().quantumShards, 1000);
  assert.equal(pm.getUpgradeLevel('BASE_DAMAGE'), 0);
  assert.equal(pm.getTotalShardsInvestedInUpgrades(), 0);
});

test('Option B + C (v0.13.0): Fever drops playable Supply Capsules, triggers Relic Draft on Sector 1, enforces 4-ball minimum, and applies Overcharge Carry-Over on first shot', () => {
  const pm = new ProgressionManager();
  pm.resetProgression();
  const engine = new GameEngine(pm);
  engine.selectArchetype('PROTO_CORE', 'STORY', 1, true);
  assert.equal(engine.state, 'AIMING');
  assert.equal(engine.currentLevel, 1);

  // Destroy all Core cubes to trigger Fever Mode on Sector 1 with 1 ball left
  engine.ballsRemaining = 1;
  for (const c of engine.cubes) {
    if (c.isCore) {
      c.isAlive = false;
    }
  }
  engine.balls = [];
  engine.setState('BALL_IN_PLAY');
  engine.update(0.016);

  // Should now be in FEVER with at least 4 guaranteed Supply Capsules
  assert.equal(engine.state, 'FEVER');
  assert.equal(engine.feverCapsules.length >= 4, true);

  // Move a BALL capsule and an OVERCHARGE capsule directly onto the basket and tick
  const ballCap = engine.feverCapsules.find((cap) => cap.type === 'BALL');
  const overchargeCap = engine.feverCapsules.find((cap) => cap.type === 'OVERCHARGE');
  assert.ok(ballCap);
  assert.ok(overchargeCap);
  engine.steerBasketTo(540);
  ballCap.x = engine.basket.x + engine.basket.width / 2;
  ballCap.y = engine.basket.y;
  overchargeCap.x = engine.basket.x + engine.basket.width / 2;
  overchargeCap.y = engine.basket.y;

  engine.update(0.02);
  assert.equal(ballCap.isAlive, false);
  assert.equal(overchargeCap.isAlive, false);
  assert.equal(engine.ballsRemaining, 2); // 1 + 1 caught from capsule
  assert.equal(engine.feverOverchargeCaught, 1);

  // Complete Fever -> should trigger RELIC_DRAFT even on Sector 1 (odd sector in Chapter 1)
  engine.feverTimer = 0.01;
  engine.update(0.02);
  assert.equal(engine.state, 'RELIC_DRAFT');

  // Minimum 4 balls guaranteed after sector completion, and Overcharge stacks carried over (2 leftover + 1 caught = 3)
  assert.equal(engine.ballsRemaining >= 4, true);
  assert.equal(engine.nextSectorOverchargeStacks, 3);

  // Select a relic -> Sector Map -> enter Sector 2 -> fire first shot with Overcharge Carry-Over
  engine.selectRelic(engine.draftChoices[0]);
  assert.equal(engine.state, 'SECTOR_MAP');
  const normalNode = engine.nextMapNodes.find((n) => n.type === 'NORMAL');
  assert.ok(normalNode);
  engine.selectSectorMapNode(normalNode.id);
  assert.equal(engine.state, 'AIMING');
  assert.equal(engine.currentLevel, 2);
  assert.equal(engine.ballsRemaining >= 4, true);

  // Firing the first shot consumes Overcharge stacks, boosts damage, electrifies main ball, and spawns companion mini-balls
  const fired = engine.shoot();
  assert.equal(fired, true);
  assert.equal(engine.nextSectorOverchargeStacks, 0);
  const mainBall = engine.balls.find((b) => !b.isMini);
  const companionMinis = engine.balls.filter((b) => b.isMini);
  assert.ok(mainBall);
  assert.equal(mainBall.isElectrified, true);
  assert.equal(mainBall.baseDamage >= 2, true);
  assert.equal(companionMinis.length, 2);
});

test('v0.15.0 Chapter 1 Redesign: Pyro, Volt, Swarm handcrafted arenas, chain VisualEffects, and Monolith Frontal Shield + ◇ Relay Nodes', () => {
  const pm = new ProgressionManager();
  pm.resetProgression();
  const engine = new GameEngine(pm);

  // 1. Pyro, Volt, Swarm, and Kinetic are immediately available via engine.isArchetypeAvailable without grinding
  assert.equal(engine.isArchetypeAvailable('PYRO_DETONATOR'), true);
  assert.equal(engine.isArchetypeAvailable('VOLT_OVERCHARGE'), true);
  assert.equal(engine.isArchetypeAvailable('SWARM_MATRIX'), true);
  assert.equal(engine.isArchetypeAvailable('KINETIC_TITAN'), true);

  // 2. Pyro Handcrafted Arena ("Campo Pyro · Innesco a Grappolo") triggers chained explosions and RING visual effects
  engine.selectArchetype('PYRO_DETONATOR', 'STORY', 1, true);
  assert.equal(engine.currentPatternName, 'Campo Pyro · Innesco a Grappolo');
  const upperPyroFuse = engine.cubes.find((c) => c.type === 'CLASS_ABILITY');
  assert.ok(upperPyroFuse);
  engine.balls = [
    {
      x: upperPyroFuse.x + upperPyroFuse.width / 2,
      y: upperPyroFuse.y + upperPyroFuse.height / 2,
      vx: 0,
      vy: 400,
      radius: 18,
      isMini: false,
      isAlive: true,
      bounces: 0,
      baseDamage: 5,
      trail: [],
      hasSavedOnce: false,
    },
  ];
  engine.setState('BALL_IN_PLAY');
  engine.update(0.016);
  assert.equal(
    engine.visualEffects.some((fx) => fx.type === 'RING'),
    true
  );

  // 3. Volt Handcrafted Arena ("Campo Volt · Ponte Elettrostatico") arcs LIGHTNING across the gap into armored Cores
  engine.selectArchetype('VOLT_OVERCHARGE', 'STORY', 1, true);
  assert.equal(engine.currentPatternName, 'Campo Volt · Ponte Elettrostatico');
  const voltRelay = engine.cubes.find((c) => c.type === 'CLASS_ABILITY');
  assert.ok(voltRelay);
  engine.balls = [
    {
      x: voltRelay.x + voltRelay.width / 2,
      y: voltRelay.y + voltRelay.height / 2,
      vx: 0,
      vy: 400,
      radius: 18,
      isMini: false,
      isAlive: true,
      bounces: 0,
      baseDamage: 5,
      trail: [],
      hasSavedOnce: false,
    },
  ];
  engine.setState('BALL_IN_PLAY');
  engine.update(0.016);
  assert.equal(
    engine.visualEffects.some((fx) => fx.type === 'LIGHTNING'),
    true
  );

  // 4. Sector 5 Boss (The Monolith): Frontal Shield blocks direct bottom hits until a ◇ Relay Node is hit
  engine.initLevel(5, 'BOSS', false);
  const boss = engine.activeBoss;
  assert.ok(boss);
  const initialBossHp = boss.hp;
  assert.equal(engine.bossFrontShieldBrokenThisShot, false);

  // Direct bottom hit on The Monolith deals 0 damage while frontal shield is active
  engine.balls = [
    {
      x: boss.x + boss.width / 2,
      y: boss.y + boss.height + 10,
      vx: 0,
      vy: -600,
      radius: 18,
      isMini: false,
      isAlive: true,
      bounces: 0,
      baseDamage: 10,
      trail: [],
      hasSavedOnce: false,
    },
  ];
  engine.setState('BALL_IN_PLAY');
  engine.update(0.016);
  assert.equal(boss.hp, initialBossHp);

  // Hitting a flanking ◇ Class Relay Node damages the Boss and disables the frontal shield for the shot
  const relayNode = engine.cubes.find((c) => c.type === 'CLASS_ABILITY' && c.isAlive);
  assert.ok(relayNode);
  engine.balls = [
    {
      x: relayNode.x + relayNode.width / 2,
      y: relayNode.y + relayNode.height / 2,
      vx: 0,
      vy: -400,
      radius: 18,
      isMini: false,
      isAlive: true,
      bounces: 0,
      baseDamage: 5,
      trail: [],
      hasSavedOnce: false,
    },
  ];
  engine.update(0.016);
  assert.equal(engine.bossFrontShieldBrokenThisShot, true);
  assert.equal(boss.hp < initialBossHp, true);
});


