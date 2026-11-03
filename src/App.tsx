import React, { useState, useEffect, useMemo } from 'react';
import { GameEngine } from './game/GameEngine';
import { GameState, UnlockEventNotification } from './types/game';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { ArchetypeSelectModal } from './components/ArchetypeSelectModal';
import { RelicDraftModal } from './components/RelicDraftModal';
import { ShopModal } from './components/ShopModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { RelicListModal } from './components/RelicListModal';
import { InfoModal } from './components/InfoModal';
import { CodexModal } from './components/CodexModal';
import { UnlockNotificationModal } from './components/UnlockNotificationModal';
import { InstallModal } from './components/InstallModal';

export const App: React.FC = () => {
  const engine = useMemo(() => new GameEngine(), []);
  const [gameState, setGameState] = useState<GameState>(engine.state);
  const [showRelicList, setShowRelicList] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showCodex, setShowCodex] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [activeUnlock, setActiveUnlock] = useState<UnlockEventNotification | null>(null);

  useEffect(() => {
    engine.listener.onStateChange = (newState: GameState) => {
      setGameState(newState);
    };

    engine.listener.onNewUnlock = (unlock: UnlockEventNotification) => {
      setActiveUnlock(unlock);
    };
  }, [engine]);

  return (
    <div className="fixed inset-0 w-full h-full h-[100dvh] overflow-hidden bg-[#04060a] flex items-center justify-center font-sans select-none">
      {/* Game Playfield Container */}
      <div className="relative w-full h-full max-w-[500px] max-h-[100dvh] flex items-center justify-center overflow-hidden">
        <GameCanvas engine={engine} />

        {/* In-Game HUD (visible during AIMING, BALL_IN_PLAY, and FEVER) */}
        {(gameState === 'AIMING' || gameState === 'BALL_IN_PLAY' || gameState === 'FEVER') && (
          <HUD
            engine={engine}
            onOpenRelicList={() => setShowRelicList(true)}
            onOpenInfo={() => setShowInfo(true)}
            onOpenCodex={() => setShowCodex(true)}
            onOpenInstall={() => setShowInstall(true)}
          />
        )}

        {/* FEVER Banner Overlay */}
        {gameState === 'FEVER' && (
          <div className="pointer-events-none absolute inset-x-0 top-1/4 flex flex-col items-center justify-center z-30 animate-pulse px-4">
            <div className="bg-gradient-to-r from-amber-500/90 via-yellow-400 to-amber-500/90 text-slate-950 font-black text-2xl sm:text-3xl px-8 py-3 rounded-2xl shadow-[0_0_50px_rgba(255,230,0,0.8)] tracking-widest border-2 border-white uppercase text-center transform rotate-[-2deg]">
              ★ CuboClast Fever! ★
            </div>
            <span className="text-sm font-bold text-yellow-300 mt-2 font-mono drop-shadow-md">
              Bonificando il settore...
            </span>
          </div>
        )}
      </div>

      {/* Relic Draft Modal during run */}
      {gameState === 'RELIC_DRAFT' && <RelicDraftModal engine={engine} />}

      {/* Active Relics In-Game Drawer */}
      {showRelicList && (
        <RelicListModal engine={engine} onClose={() => setShowRelicList(false)} />
      )}

      {/* In-Game Guide Modal */}
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}

      {/* Archetype Select & Mode Screen */}
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

      {/* Meta Upgrade Shop Overlay */}
      {showShop && <ShopModal engine={engine} onClose={() => setShowShop(false)} />}

      {/* Roguelike Codex & Compendium */}
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

      {/* Install / APK Modal */}
      {showInstall && <InstallModal onClose={() => setShowInstall(false)} />}

      {/* Unlock Notification Celebration Modal */}
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
