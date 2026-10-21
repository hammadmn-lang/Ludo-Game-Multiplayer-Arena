import React from 'react';
import { Player } from '../types/ludo';
import { COLOR_PALETTE } from '../utils/ludoConstants';
import { TOTAL_PATH_STEPS } from '../utils/ludoEngine';

interface PlayerCardProps {
  player: Player;
  isActive: boolean;
  isCurrentUser: boolean;
  reaction?: { text: string; isEmoji: boolean; id: string } | null;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isActive,
  isCurrentUser,
  reaction,
}) => {
  const palette = COLOR_PALETTE[player.color];

  const finishedCount = player.tokens.filter(
    (t) => t.state === 'finished' || t.step >= 56
  ).length;

  return (
    <div
      className={`relative p-2.5 sm:p-3 rounded-xl transition-all duration-300 ${
        isActive
          ? 'bg-neutral-800 border-2 shadow-lg scale-102'
          : 'bg-neutral-900/80 border border-neutral-800 opacity-90'
      }`}
      style={{
        borderColor: isActive ? palette.primary : 'transparent',
        boxShadow: isActive ? `0 0 16px ${palette.glow}` : 'none',
      }}
      id={`player-card-${player.id}`}
    >
      {/* Floating Reaction Bubble */}
      {reaction && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 animate-bounce px-2 py-1 rounded-full bg-neutral-900 border border-amber-400 shadow-xl text-xs sm:text-sm font-bold flex items-center gap-1 whitespace-nowrap">
          <span>{reaction.text}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        {/* Left: Avatar & Name */}
        <div className="flex items-center gap-2">
          <div
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg border-2 shadow-inner"
            style={{
              backgroundColor: palette.light,
              borderColor: palette.primary,
            }}
          >
            <span>{player.avatar}</span>
            {/* Color Dot indicator */}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-neutral-900"
              style={{ backgroundColor: palette.primary }}
            />
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1">
              <span className="font-bold text-xs sm:text-sm text-white truncate max-w-[90px] sm:max-w-[120px]">
                {player.name}
              </span>
              {isCurrentUser && (
                <span className="text-[9px] px-1 rounded bg-neutral-700 text-neutral-300 font-semibold">
                  YOU
                </span>
              )}
              {player.isAI && (
                <span className="text-[9px] px-1 rounded bg-purple-900/60 text-purple-300 font-semibold">
                  AI
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-[11px] text-neutral-400">
              <span className="capitalize" style={{ color: palette.primary }}>
                {player.color}
              </span>
              <span>•</span>
              <span className="text-amber-400">
                {player.hasWon ? `🏆 ${player.rank}th Place!` : `${finishedCount}/4 Home`}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Mini Token Progress dots */}
        <div className="flex items-center gap-1">
          {player.tokens.map((token) => {
            const isFinished = token.state === 'finished' || token.step >= 56;
            const isInYard = token.state === 'home' || token.step === -1;
            
            return (
              <div
                key={`p-tok-${player.id}-${token.id}`}
                className={`w-2.5 h-2.5 rounded-full border transition-all ${
                  isFinished
                    ? 'bg-amber-400 border-amber-300 ring-1 ring-amber-400'
                    : isInYard
                    ? 'bg-neutral-700 border-neutral-600'
                    : 'bg-emerald-500 border-emerald-400'
                }`}
                title={`Token ${token.id + 1}: ${isFinished ? 'Finished' : isInYard ? 'In Base' : 'Active'}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
