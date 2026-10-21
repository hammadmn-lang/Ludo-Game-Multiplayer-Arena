import React from 'react';
import { PlayerColor } from '../types/ludo';
import { TokenSkinId } from '../types/theme';
import { COLOR_PALETTE } from '../utils/ludoConstants';

interface TokenViewProps {
  color: PlayerColor;
  skinId?: TokenSkinId;
  isValidMove?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TokenView: React.FC<TokenViewProps> = ({
  color,
  skinId = 'classic',
  isValidMove = false,
  size = 'md',
}) => {
  const palette = COLOR_PALETTE[color];

  // Mascot mapping
  const mascotIcons: Record<PlayerColor, string> = {
    red: '🦁',
    green: '🐉',
    yellow: '🦅',
    blue: '🐺',
  };

  if (skinId === 'crown') {
    return (
      <div className="w-full h-full rounded-full flex items-center justify-center p-[2px] shadow-lg relative bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 border border-amber-300">
        <div
          className="w-full h-full rounded-full flex items-center justify-center shadow-inner"
          style={{ backgroundColor: palette.primary }}
        >
          <span className="text-[11px] sm:text-[13px] leading-none drop-shadow filter">
            👑
          </span>
        </div>
      </div>
    );
  }

  if (skinId === 'cyber') {
    return (
      <div className="w-full h-full rounded-lg rotate-45 flex items-center justify-center p-[2px] shadow-lg relative bg-black/90 border border-cyan-400/80">
        <div
          className="w-full h-full rounded-md flex items-center justify-center shadow-inner"
          style={{
            backgroundColor: palette.primary,
            boxShadow: `0 0 10px ${palette.glow}`,
          }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-200 -rotate-45 shadow-[0_0_6px_#fff]" />
        </div>
      </div>
    );
  }

  if (skinId === 'mascot') {
    return (
      <div className="w-full h-full rounded-full flex items-center justify-center p-[2px] shadow-lg relative bg-slate-900 border-2 border-amber-400/80">
        <div
          className="w-full h-full rounded-full flex items-center justify-center shadow-inner"
          style={{ backgroundColor: palette.primary }}
        >
          <span className="text-[12px] sm:text-[14px] leading-none select-none drop-shadow">
            {mascotIcons[color]}
          </span>
        </div>
      </div>
    );
  }

  if (skinId === 'gold_ingot') {
    return (
      <div className="w-full h-full rounded-full flex items-center justify-center p-[2px] shadow-xl relative bg-gradient-to-tr from-amber-600 via-amber-300 to-yellow-100 border-2 border-yellow-200">
        <div
          className="w-full h-full rounded-full flex items-center justify-center border border-amber-600/50"
          style={{ backgroundColor: palette.secondary }}
        >
          <span className="text-[10px] sm:text-[11px] font-black text-amber-200 leading-none drop-shadow">
            ★
          </span>
        </div>
      </div>
    );
  }

  // Default Classic Pawn
  return (
    <div
      className="w-full h-full rounded-full flex items-center justify-center shadow-inner border border-white/20"
      style={{ backgroundColor: palette.tokenFill }}
    >
      <div className="w-[70%] h-[70%] rounded-full bg-white/90 shadow-inner flex items-center justify-center border border-neutral-200">
        <div
          className="w-[55%] h-[55%] rounded-full shadow"
          style={{ backgroundColor: palette.primary }}
        />
      </div>
    </div>
  );
};
