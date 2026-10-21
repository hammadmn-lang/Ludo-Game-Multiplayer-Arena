import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Player, GameMode } from '../types/ludo';
import { COLOR_PALETTE } from '../utils/ludoConstants';
import { Trophy, Award, RotateCcw, Home, Zap } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface VictoryModalProps {
  winnerOrder: string[];
  players: Player[];
  gameMode: GameMode;
  onRematch: () => void;
  onReturnToLobby: () => void;
  eloChange?: number;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winnerOrder,
  players,
  gameMode,
  onRematch,
  onReturnToLobby,
  eloChange = +20,
}) => {
  useEffect(() => {
    sounds.playVictory();

    // Trigger double confetti blast
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.5 },
        });
      }, 400);
    } catch {
      // Confetti fallback
    }
  }, []);

  const orderedPlayers = winnerOrder
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  // Any players who didn't finish placed afterwards
  players.forEach((p) => {
    if (!orderedPlayers.some((op) => op.id === p.id)) {
      orderedPlayers.push(p);
    }
  });

  const champion = orderedPlayers[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-center relative overflow-hidden">
        
        {/* Decorative Indigo/Amber Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Crown Icon */}
        <div className="w-16 h-16 mx-auto mb-3.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-3xl shadow-xl border border-amber-200 animate-bounce">
          <Trophy className="w-8 h-8 text-slate-950 fill-slate-950" />
        </div>

        <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-1">
          Match Completed!
        </h2>
        <p className="text-sm text-amber-400 font-bold mb-6">
          🏆 Champion: {champion?.name}
        </p>

        {/* Podium Rankings */}
        <div className="space-y-2 mb-6 text-left">
          {orderedPlayers.map((player, idx) => {
            const palette = COLOR_PALETTE[player.color];
            const isFirst = idx === 0;
            const rankBadge =
              idx === 0 ? '🥇 1st' : idx === 1 ? '🥈 2nd' : idx === 2 ? '🥉 3rd' : '4th';

            return (
              <div
                key={`podium-${player.id}`}
                className={`flex items-center justify-between p-3 rounded-2xl border ${
                  isFirst
                    ? 'bg-amber-500/15 border-amber-500/50 text-white font-bold'
                    : 'bg-slate-800/70 border-slate-700/60 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-black text-sm w-12">{rankBadge}</span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm border shadow-inner"
                    style={{
                      backgroundColor: palette.light,
                      borderColor: palette.primary,
                    }}
                  >
                    <span>{player.avatar}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-bold">{player.name}</span>
                    <span className="block text-[11px] capitalize font-medium" style={{ color: palette.primary }}>
                      {player.color} Player
                    </span>
                  </div>
                </div>

                <div className="text-right text-xs">
                  {isFirst ? (
                    <span className="text-emerald-400 font-black flex items-center gap-0.5">
                      <Zap className="w-3.5 h-3.5" /> +{eloChange} Elo
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium">Finished</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onRematch}
            id="btn-rematch"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg transition active:scale-95 cursor-pointer text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          <button
            onClick={onReturnToLobby}
            id="btn-lobby"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold border border-slate-700 transition active:scale-95 cursor-pointer text-sm"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
