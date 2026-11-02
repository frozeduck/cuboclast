import React, { useState, useEffect, useMemo } from 'react';
import { GameEngine } from './game/GameEngine';
import { GameState } from './types/game';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { ArchetypeSelectModal } from './components/ArchetypeSelectModal';
import { RelicDraftModal } from './components/RelicDraftModal';
import { ShopModal } from './components/ShopModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { RelicListModal } from './components/RelicListModal';
import { InfoModal } from './components/InfoModal';

export const App: React.FC = () => {
  const engine = useMemo(() => new GameEngine(), []);
  const [gameState, setGameState] = useState<GameState>(engine.state);
  const [showRelicList, setShowRelicList] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showShop, setShowShop] = useState(false);

  useEffect(() => {
    engine.listener.onStateChange = (newState: GameState) => {
      setGameState(newState);
    };
  }, [engine]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#04060a] flex items-center justify-center font-sans">
      {/* Game Canvas */}
      <div className="relative w-full h-full max-w-[580px] max-h-[1020px] aspect-[9/16] shadow-2xl flex items-center justify-center">
        <GameCanvas engine={engine} />

        {/* In-Game HUD (visible during AIMING, BALL_IN_PLAY, and FEVER) */}
        {(gameState === 'AIMING' || gameState === 'BALL_IN_PLAY' || gameState === 'FEVER') && (
          <HUD
            engine={engine}
            onOpenRelicList={() => setShowRelicList(true)}
            onOpenInfo={() => setShowInfo(true)}
          />
        )}

        {/* FEVER Banner Overlay */}
        {gameState === 'FEVER' && (
          <div className="pointer-events-none absolute inset-x-0 top-1/4 flex flex-col items-center justify-center z-30 animate-pulse">
            <div className="bg-gradient-to-r from-amber-500/90 via-yellow-400 to-amber-500/90 text-slate-950 font-black text-2xl sm:text-3xl px-8 py-3 rounded-2xl shadow-[0_0_50px_rgba(255,230,0,0.8)] tracking-widest border-2 border-white uppercase text-center transform rotate-[-2deg]">
              ★ CuboClast Fever! ★
            </div>
            <span className="text-sm font-bold text-yellow-300 mt-2 font-mono drop-shadow-md">
              Bonificando il settore...
            </span>
          </div>
        )}

        {/* State Modals */}
        {gameState === 'ARCHETYPE_SELECT' && (
          <ArchetypeSelectModal
            engine={engine}
            onOpenShop={() => setShowShop(true)}
          />
        )}

        {gameState === 'RELIC_DRAFT' && (
          <RelicDraftModal engine={engine} />
        )}

        {gameState === 'GAME_OVER' && (
          <GameOverModal
            engine={engine}
            onOpenShop={() => setShowShop(true)}
          />
        )}

        {gameState === 'VICTORY' && (
          <VictoryModal engine={engine} />
        )}

        {/* Meta Upgrade Shop Overlay */}
        {showShop && (
          <ShopModal
            engine={engine}
            onClose={() => setShowShop(false)}
          />
        )}

        {/* Active Relics Drawer/Modal */}
        {showRelicList && (
          <RelicListModal
            engine={engine}
            onClose={() => setShowRelicList(false)}
          />
        )}

        {/* Guide / Info Modal */}
        {showInfo && (
          <InfoModal onClose={() => setShowInfo(false)} />
        )}
      </div>
    </div>
  );
};

export default App;
