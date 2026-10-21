import React from 'react';
import { Player } from '../types/ludo';
import { DiceSkinId } from '../types/theme';
import { COLOR_PALETTE } from '../utils/ludoConstants';
import { getDiceSkin } from '../utils/themeData';
import { Timer, TimerOff } from 'lucide-react';

interface DiceRollerProps {
  diceValue: number | null;
  isRolling: boolean;
  hasRolled: boolean;
  isMyTurn: boolean;
  activePlayer: Player;
  consecutiveSixes: number;
  timeLeft: number;
  maxTime: number;
  timerEnabled?: boolean;
  diceSkin?: DiceSkinId;
  onToggleTimer?: () => void;
  onRollClick: () => void;
}

export const DiceRoller: React.FC<DiceRollerProps> = ({
  diceValue,
  isRolling,
  hasRolled,
  isMyTurn,
  activePlayer,
  consecutiveSixes,
  timeLeft,
  maxTime,
  timerEnabled = true,
  diceSkin = 'classic',
  onToggleTimer,
  onRollClick,
}) => {
  const palette = COLOR_PALETTE[activePlayer.color];
  const timeProgress = (timeLeft / maxTime) * 100;
  const currentSkin = getDiceSkin(diceSkin);

  // Dice Pip Layout helper
  const renderPips = (val: number | null) => {
    const value = isRolling ? Math.floor(Math.random() * 6) + 1 : val || 6;
    const pipPrimary = currentSkin.pipColorPrimary;
    const pipAccent = currentSkin.pipColorAccent;
    const pipEmerald = currentSkin.pipColorEmerald;
    const pipShadow = currentSkin.pipShadow;
    
    // Grid dot positions for 1..6
    return (
      <div
        className={`w-12 h-12 sm:w-14 sm:h-14 p-2 rounded-xl grid grid-cols-3 grid-rows-3 gap-1 items-center justify-items-center transition-all duration-300 ${currentSkin.cubeClass}`}
      >
        {value === 1 && (
          <div
            className="col-start-2 row-start-2 w-3.5 h-3.5 rounded-full"
            style={{ backgroundColor: pipAccent, boxShadow: pipShadow }}
          />
        )}
        {value === 2 && (
          <>
            <div
              className="col-start-1 row-start-1 w-3 h-3 rounded-full"
              style={{ backgroundColor: pipPrimary, boxShadow: pipShadow }}
            />
            <div
              className="col-start-3 row-start-3 w-3 h-3 rounded-full"
              style={{ backgroundColor: pipPrimary, boxShadow: pipShadow }}
            />
          </>
        )}
        {value === 3 && (
          <>
            <div
              className="col-start-1 row-start-1 w-3 h-3 rounded-full"
              style={{ backgroundColor: pipPrimary, boxShadow: pipShadow }}
            />
            <div
              className="col-start-2 row-start-2 w-3.5 h-3.5 rounded-full"
              style={{ backgroundColor: pipAccent, boxShadow: pipShadow }}
            />
            <div
              className="col-start-3 row-start-3 w-3 h-3 rounded-full"
              style={{ backgroundColor: pipPrimary, boxShadow: pipShadow }}
            />
          </>
        )}
        {value === 4 && (
          <>
            <div
              className="col-start-1 row-start-1 w-3 h-3 rounded-full"
              style={{ backgroundColor: pipPrimary, boxShadow: pipShadow }}
            />
            <div
              className="col-start-3 row-start-1 w-3 h-3 rounded-full"
              style={{ backgroundColor: pipPrimary, boxShadow: pipShadow }}
            />
            <div
              className="col-start-1 row-start-3 w-3 h-3 rounded-full"
              style={{ backgroundColor: pipPrimary, boxShadow: pipShadow }}
            />
            <div
              className="col-start-3 row-start-3 w-3 h-3 rounded-full"
              style={{ backgroundColor: pipPrimary, boxShadow: pipShadow }}
            />
          </>
        )}
        {value === 5 && (
          <>
            <div
              className="col-start-1 row-start-1 w-3 h-3 rounded-full"
              style={{ backgroundColor: pipPrimary, boxShadow: pipShadow }}
            />
            <div
              className="col-start-3 row-start-1 w-3 h-3 rounded-full"
              style={{ backgroundColor: pipPrimary, boxShadow: pipShadow }}
            />
            <div
              className="col-start-2 row-start-2 w-3.5 h-3.5 rounded-full"
              style={{ backgroundColor: pipAccent, boxShadow: pipShadow }}
            />
            <div
              className="col-start-1 row-start-3 w-3 h-3 rounded-full"
              style={{ backgroundColor: pipPrimary, boxShadow: pipShadow }}
            />
            <div
              className="col-start-3 row-start-3 w-3 h-3 rounded-full"
              style={{ backgroundColor: pipPrimary, boxShadow: pipShadow }}
            />
          </>
        )}
        {value === 6 && (
          <>
            <div
              className="col-start-1 row-start-1 w-3 h-3 rounded-full"
              style={{ backgroundColor: pipEmerald, boxShadow: pipShadow }}
            />
            <div
              className="col-start-1 row-start-2 w-3 h-3 rounded-full"
              style={{ backgroundColor: pipEmerald, boxShadow: pipShadow }}
            />
            <div
              className="col-start-1 row-start-3 w-3 h-3 rounded-full"
              style={{ backgroundColor: pipEmerald, boxShadow: pipShadow }}
            />
            <div
              className="col-start-3 row-start-1 w-3 h-3 rounded-full"
              style={{ backgroundColor: pipEmerald, boxShadow: pipShadow }}
            />
            <div
              className="col-start-3 row-start-2 w-3 h-3 rounded-full"
              style={{ backgroundColor: pipEmerald, boxShadow: pipShadow }}
            />
            <div
              className="col-start-3 row-start-3 w-3 h-3 rounded-full"
              style={{ backgroundColor: pipEmerald, boxShadow: pipShadow }}
            />
          </>
        )}
      </div>
    );
  };

  const canRoll = isMyTurn && !hasRolled && !isRolling;

  return (
    <div
      className="w-full flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl backdrop-blur"
      id="dice-roller-container"
    >
      {/* Active Player Banner & Timer */}
      <div className="flex items-center gap-3">
        {timerEnabled ? (
          <div className="relative flex items-center justify-center">
            {/* Circular Countdown Ring */}
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="#1e293b"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke={timeLeft <= 5 ? '#f43f5e' : palette.primary}
                strokeWidth="4"
                fill="transparent"
                strokeDasharray="125.6"
                strokeDashoffset={125.6 - (125.6 * timeProgress) / 100}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <span className="absolute font-bold text-xs text-white">
              {timeLeft}s
            </span>
          </div>
        ) : (
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-slate-400">
            <TimerOff className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400">Relax</span>
          </div>
        )}

        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg">{activePlayer.avatar}</span>
            <span
              className="font-bold text-sm sm:text-base capitalize"
              style={{ color: palette.primary }}
            >
              {activePlayer.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-slate-400">
              {activePlayer.isAI
                ? '🤖 AI is deciding...'
                : !hasRolled
                ? 'Waiting to roll dice...'
                : 'Select a highlighted token!'}
            </p>
            {onToggleTimer && (
              <button
                onClick={onToggleTimer}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-semibold cursor-pointer"
                title={timerEnabled ? 'Remove timer from turn' : 'Enable 15s turn timer'}
              >
                {timerEnabled ? 'Remove timer' : 'Enable timer'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Six Streak Indicator */}
      {consecutiveSixes > 0 && (
        <div className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-semibold animate-pulse">
          <span>🔥</span>
          <span>{consecutiveSixes}x Six Streak!</span>
        </div>
      )}

      {/* Interactive Dice Roller Button */}
      <button
        id="btn-roll-dice"
        onClick={onRollClick}
        disabled={!canRoll}
        className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-200 ${
          canRoll
            ? 'cursor-pointer scale-105 shadow-xl active:scale-95'
            : 'opacity-80 cursor-default'
        }`}
        style={{
          backgroundColor: canRoll ? palette.primary : '#1e293b',
          boxShadow: canRoll ? `0 0 24px ${palette.glow}` : 'none',
        }}
      >
        <div
          className={`transition-transform duration-300 ${
            isRolling ? 'animate-spin scale-110' : ''
          }`}
        >
          {renderPips(diceValue)}
        </div>

        <div className="text-left hidden xs:block">
          <span className="block text-[11px] font-bold text-white/80 uppercase tracking-wider">
            {canRoll ? 'Your Turn' : hasRolled ? 'Rolled' : 'Rolling'}
          </span>
          <span className="block font-black text-sm sm:text-base text-white">
            {canRoll ? 'ROLL DICE' : diceValue ? `Rolled ${diceValue}` : '...'}
          </span>
        </div>
      </button>
    </div>
  );
};
