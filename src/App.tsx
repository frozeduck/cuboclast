import React, { useState, useEffect, useMemo } from 'react';
import { GameEngine } from './game/GameEngine';
import { GameState, UnlockEventNotification } from './types/game';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { ArchetypeSelectModal } from './components/ArchetypeSelectModal';
import { ChapterIntroModal } from './components/ChapterIntroModal';
import { RelicDraftModal } from './components/RelicDraftModal';
import { SectorMapModal } from './components/SectorMapModal';
import { SectorEventModal } from './components/SectorEventModal';
import { RunMerchantModal } from './components/RunMerchantModal';
import { ShopModal } from './components/ShopModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { RelicListModal } from './components/RelicListModal';
import { InfoModal } from './components/InfoModal';
import { CodexModal } from './components/CodexModal';
import { UnlockNotificationModal } from './components/UnlockNotificationModal';
import { InstallModal } from './components/InstallModal';
import { PauseMenuModal } from './components/PauseMenuModal';

export const App: React.FC = () => {
  const engine = useMemo(() => new GameEngine(), []);
  const [gameState, setGameState] = useState<GameState>(engine.state);
  const [showRelicList, setShowRelicList] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showCodex, setShowCodex] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const [activeUnlock, setActiveUnlock] = useState<UnlockEventNotification | null>(null);

  useEffect(() => {
    engine.listener.onStateChange = (newState: GameState) => {
      setGameState(newState);
    };

    engine.listener.onNewUnlock = (unlock: UnlockEventNotification) => {
      setActiveUnlock(unlock);
    };

    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' && engine.state === 'ARCHETYPE_SELECT') {
      engine.selectArchetype('PROTO_CORE', 'STORY', 1, true);
    }
  }, [engine]);

  // Keep document.body.dataset.state synced with game state and modal state
  const isAnyModalOpen =
    gameState === 'ARCHETYPE_SELECT' ||
    gameState === 'CHAPTER_INTRO' ||
    gameState === 'RELIC_DRAFT' ||
    gameState === 'SECTOR_MAP' ||
    gameState === 'SECTOR_EVENT' ||
    gameState === 'RUN_MERCHANT' ||
    gameState === 'GAME_OVER' ||
    gameState === 'VICTORY' ||
    gameState === 'CODEX' ||
    showPause ||
    showRelicList ||
    showInfo ||
    showShop ||
    showCodex ||
    showInstall ||
    activeUnlock !== null;

  useEffect(() => {
    if (gameState === 'ARCHETYPE_SELECT') {
      document.body.dataset.state = 'title';
    } else if (showPause) {
      document.body.dataset.state = 'paused';
    } else if (gameState === 'GAME_OVER' || gameState === 'VICTORY') {
      document.body.dataset.state = 'gameover';
    } else {
      document.body.dataset.state = 'playing';
    }
  }, [gameState, showPause]);

  // Bind Escape / P to toggle pause during gameplay
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (
          gameState === 'AIMING' ||
          gameState === 'BALL_IN_PLAY' ||
          gameState === 'FEVER'
        ) {
          setShowPause((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState]);

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-[#080b12] flex items-center justify-center font-sans select-none">
      {/* Game Playfield Container */}
      <div className="relative w-full h-full max-w-[520px] max-h-[100dvh] flex items-center justify-center overflow-hidden">
        <GameCanvas engine={engine} disabled={isAnyModalOpen} />

        {/* In-Game HUD */}
        {(gameState === 'AIMING' || gameState === 'BALL_IN_PLAY' || gameState === 'FEVER') && (
          <HUD
            engine={engine}
            onOpenRelicList={() => setShowRelicList(true)}
            onOpenPause={() => setShowPause(true)}
          />
        )}

        {/* Minimalist FEVER Banner (v0.4.0 Style) */}
        {gameState === 'FEVER' && (
          <div className="pointer-events-none absolute inset-x-0 top-1/3 bg-[#080b12]/90 border-y-4 border-[#ffe600] py-4 flex flex-col items-center justify-center z-30">
            <div className="text-[#ffe600] font-bold text-xl sm:text-2xl tracking-widest uppercase">
              ★ CUBOCLAST FEVER! ★
            </div>
            <span className="text-xs font-mono text-white mt-1">
              TUTTI I CORE DISTRUTTI · POLVERIZZAZIONE IN CORSO
            </span>
          </div>
        )}
      </div>

      {/* In-Game Pause Modal */}
      {showPause && (
        <PauseMenuModal
          engine={engine}
          onClose={() => setShowPause(false)}
          onOpenCodex={() => setShowCodex(true)}
          onOpenInfo={() => setShowInfo(true)}
          onOpenInstall={() => setShowInstall(true)}
        />
      )}

      {/* Chapter Intro Transmission Modal */}
      {gameState === 'CHAPTER_INTRO' && <ChapterIntroModal engine={engine} />}

      {/* Relic Draft Modal */}
      {gameState === 'RELIC_DRAFT' && <RelicDraftModal engine={engine} />}

      {/* Branching Sector Map Modal */}
      {gameState === 'SECTOR_MAP' && <SectorMapModal engine={engine} />}

      {/* Sector Anomaly Event Modal */}
      {gameState === 'SECTOR_EVENT' && <SectorEventModal engine={engine} />}

      {/* In-Run Orbital Merchant Modal */}
      {gameState === 'RUN_MERCHANT' && <RunMerchantModal engine={engine} />}

      {/* Active Relics Modal */}
      {showRelicList && (
        <RelicListModal engine={engine} onClose={() => setShowRelicList(false)} />
      )}

      {/* Guide Modal */}
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}

      {/* Archetype Select Screen */}
      {gameState === 'ARCHETYPE_SELECT' && (
        <ArchetypeSelectModal
          engine={engine}
          onOpenShop={() => setShowShop(true)}
          onOpenCodex={() => setShowCodex(true)}
          onOpenInstall={() => setShowInstall(true)}
        />
      )}

      {/* Game Over Screen */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal engine={engine} onOpenShop={() => setShowShop(true)} />
      )}

      {/* Victory Screen */}
      {gameState === 'VICTORY' && <VictoryModal engine={engine} />}

      {/* Meta Upgrade Shop */}
      {showShop && <ShopModal engine={engine} onClose={() => setShowShop(false)} />}

      {/* Codex */}
      {(showCodex || gameState === 'CODEX') && (
        <CodexModal
          engine={engine}
          onClose={() => {
            setShowCodex(false);
            if (gameState === 'CODEX') {
              engine.setState('ARCHETYPE_SELECT');
            }
          }}
        />
      )}

      {/* APK / Install Modal */}
      {showInstall && <InstallModal onClose={() => setShowInstall(false)} />}

      {/* Unlock Notification Modal */}
      {activeUnlock && (
        <UnlockNotificationModal
          unlock={activeUnlock}
          onDismiss={() => {
            setActiveUnlock(null);
            const next = engine.progression.popNextUnlock();
            if (next) {
              setTimeout(() => setActiveUnlock(next), 200);
            }
          }}
        />
      )}
    </div>
  );
};

export default App;
