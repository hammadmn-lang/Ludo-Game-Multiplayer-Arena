import React from 'react';
import { Player, Token, MoveOption, PlayerColor } from '../types/ludo';
import { BoardThemeId, TokenSkinId } from '../types/theme';
import {
  TRACK_COORDINATES,
  HOME_PATHS,
  SAFE_TRACK_INDICES,
  COLOR_PALETTE,
  GridCoord,
} from '../utils/ludoConstants';
import { getTokenBoardCoordinate } from '../utils/ludoEngine';
import { getBoardTheme } from '../utils/themeData';
import { TokenView } from './TokenView';

interface LudoBoardProps {
  players: Player[];
  activePlayerIndex: number;
  validMoves: MoveOption[];
  hasRolled: boolean;
  onTokenClick: (tokenId: number) => void;
  isInteractive: boolean;
  boardTheme?: BoardThemeId;
  tokenSkin?: TokenSkinId;
}

export const LudoBoard: React.FC<LudoBoardProps> = ({
  players,
  activePlayerIndex,
  validMoves,
  hasRolled,
  onTokenClick,
  isInteractive,
  boardTheme = 'classic',
  tokenSkin = 'classic',
}) => {
  const activePlayer = players[activePlayerIndex];
  const theme = getBoardTheme(boardTheme);

  // Group tokens by their board position to handle stacking
  const tokensOnBoard: { token: Token; player: Player; isValidMove: boolean }[] = [];
  players.forEach((player) => {
    player.tokens.forEach((token) => {
      const isValid =
        isInteractive &&
        hasRolled &&
        player.id === activePlayer?.id &&
        validMoves.some((m) => m.tokenId === token.id);

      tokensOnBoard.push({
        token,
        player,
        isValidMove: isValid,
      });
    });
  });

  // Calculate pixel percentages on 15x15 board (each cell is 100 / 15 = 6.6667%)
  const CELL_SIZE = 100 / 15;

  const getCoordStyle = (coord: GridCoord, offsetIndex = 0, totalAtCell = 1) => {
    let offsetX = 0;
    let offsetY = 0;
    if (totalAtCell > 1) {
      const angle = (offsetIndex / totalAtCell) * Math.PI * 2;
      const radius = 1.2; // percentage offset
      offsetX = Math.cos(angle) * radius;
      offsetY = Math.sin(angle) * radius;
    }

    return {
      left: `${(coord.x + 0.5) * CELL_SIZE + offsetX}%`,
      top: `${(coord.y + 0.5) * CELL_SIZE + offsetY}%`,
      transform: 'translate(-50%, -50%)',
    };
  };

  // Group tokens by cell coordinate key to calculate stacking offsets
  const cellGroups = new Map<string, typeof tokensOnBoard>();
  tokensOnBoard.forEach((item) => {
    const coord = getTokenBoardCoordinate(item.token);
    const key = `${Math.round(coord.x * 10)}_${Math.round(coord.y * 10)}`;
    if (!cellGroups.has(key)) {
      cellGroups.set(key, []);
    }
    cellGroups.get(key)!.push(item);
  });

  return (
    <div
      className={`relative w-full max-w-[min(100vw-16px,540px)] aspect-square mx-auto select-none rounded-2xl sm:rounded-3xl p-2 sm:p-4 backdrop-blur transition-all duration-300 ${theme.boardOuterClass}`}
      id="bento-ludo-board-outer"
    >
      {/* Board Base Container */}
      <div
        className={`relative w-full h-full rounded-2xl overflow-hidden transition-all duration-300 ${theme.boardBaseClass}`}
      >
        {/* === 4 HOME YARDS (6x6 cells each) === */}
        {/* Red Home Yard (Top-Left) */}
        <div
          className={`absolute top-0 left-0 w-[40%] h-[40%] p-2 sm:p-3 flex items-center justify-center border-r-2 border-b-2 border-slate-900 ${theme.yardBgs.red}`}
          id="yard-red"
        >
          <div className="w-full h-full bg-slate-950/90 rounded-2xl p-2 grid grid-cols-2 gap-2 shadow-inner border border-red-500/30">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={`red-pad-${idx}`}
                className={`rounded-full border-2 shadow-inner flex items-center justify-center ${theme.yardPadBgs.red}`}
              />
            ))}
          </div>
        </div>

        {/* Green Home Yard (Top-Right) */}
        <div
          className={`absolute top-0 right-0 w-[40%] h-[40%] p-2 sm:p-3 flex items-center justify-center border-l-2 border-b-2 border-slate-900 ${theme.yardBgs.green}`}
          id="yard-green"
        >
          <div className="w-full h-full bg-slate-950/90 rounded-2xl p-2 grid grid-cols-2 gap-2 shadow-inner border border-emerald-500/30">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={`green-pad-${idx}`}
                className={`rounded-full border-2 shadow-inner flex items-center justify-center ${theme.yardPadBgs.green}`}
              />
            ))}
          </div>
        </div>

        {/* Yellow Home Yard (Bottom-Right) */}
        <div
          className={`absolute bottom-0 right-0 w-[40%] h-[40%] p-2 sm:p-3 flex items-center justify-center border-l-2 border-t-2 border-slate-900 ${theme.yardBgs.yellow}`}
          id="yard-yellow"
        >
          <div className="w-full h-full bg-slate-950/90 rounded-2xl p-2 grid grid-cols-2 gap-2 shadow-inner border border-amber-500/30">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={`yellow-pad-${idx}`}
                className={`rounded-full border-2 shadow-inner flex items-center justify-center ${theme.yardPadBgs.yellow}`}
              />
            ))}
          </div>
        </div>

        {/* Blue Home Yard (Bottom-Left) */}
        <div
          className={`absolute bottom-0 left-0 w-[40%] h-[40%] p-2 sm:p-3 flex items-center justify-center border-r-2 border-t-2 border-slate-900 ${theme.yardBgs.blue}`}
          id="yard-blue"
        >
          <div className="w-full h-full bg-slate-950/90 rounded-2xl p-2 grid grid-cols-2 gap-2 shadow-inner border border-blue-500/30">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={`blue-pad-${idx}`}
                className={`rounded-full border-2 shadow-inner flex items-center justify-center ${theme.yardPadBgs.blue}`}
              />
            ))}
          </div>
        </div>

        {/* === 52 COMMON TRACK CELLS === */}
        {TRACK_COORDINATES.map((coord, idx) => {
          const isSafe = SAFE_TRACK_INDICES.includes(idx);
          const isRedStart = idx === 0;
          const isGreenStart = idx === 13;
          const isYellowStart = idx === 26;
          const isBlueStart = idx === 39;

          let cellBg = `${theme.trackCellBg} ${theme.trackCellBorder}`;
          if (isRedStart) cellBg = theme.startCellBgs.red;
          else if (isGreenStart) cellBg = theme.startCellBgs.green;
          else if (isYellowStart) cellBg = theme.startCellBgs.yellow;
          else if (isBlueStart) cellBg = theme.startCellBgs.blue;

          return (
            <div
              key={`track-cell-${idx}`}
              className={`absolute flex items-center justify-center border font-bold transition-colors ${cellBg}`}
              style={{
                left: `${coord.x * CELL_SIZE}%`,
                top: `${coord.y * CELL_SIZE}%`,
                width: `${CELL_SIZE}%`,
                height: `${CELL_SIZE}%`,
              }}
            >
              {isSafe && !isRedStart && !isGreenStart && !isYellowStart && !isBlueStart && (
                <span className={`text-xs sm:text-sm drop-shadow ${theme.safeCellColor}`}>
                  {theme.safeCellSymbol}
                </span>
              )}
              {isRedStart && <span className="text-white text-[10px] sm:text-xs">▶</span>}
              {isGreenStart && <span className="text-white text-[10px] sm:text-xs">▼</span>}
              {isYellowStart && <span className="text-white text-[10px] sm:text-xs">◀</span>}
              {isBlueStart && <span className="text-white text-[10px] sm:text-xs">▲</span>}
            </div>
          );
        })}

        {/* === HOME PATHS (5 colored steps per color) === */}
        {HOME_PATHS.red.map((coord, idx) => (
          <div
            key={`red-home-cell-${idx}`}
            className={`absolute flex items-center justify-center border ${theme.homePathBgs.red}`}
            style={{
              left: `${coord.x * CELL_SIZE}%`,
              top: `${coord.y * CELL_SIZE}%`,
              width: `${CELL_SIZE}%`,
              height: `${CELL_SIZE}%`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/70 shadow" />
          </div>
        ))}

        {HOME_PATHS.green.map((coord, idx) => (
          <div
            key={`green-home-cell-${idx}`}
            className={`absolute flex items-center justify-center border ${theme.homePathBgs.green}`}
            style={{
              left: `${coord.x * CELL_SIZE}%`,
              top: `${coord.y * CELL_SIZE}%`,
              width: `${CELL_SIZE}%`,
              height: `${CELL_SIZE}%`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/70 shadow" />
          </div>
        ))}

        {HOME_PATHS.yellow.map((coord, idx) => (
          <div
            key={`yellow-home-cell-${idx}`}
            className={`absolute flex items-center justify-center border ${theme.homePathBgs.yellow}`}
            style={{
              left: `${coord.x * CELL_SIZE}%`,
              top: `${coord.y * CELL_SIZE}%`,
              width: `${CELL_SIZE}%`,
              height: `${CELL_SIZE}%`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/70 shadow" />
          </div>
        ))}

        {HOME_PATHS.blue.map((coord, idx) => (
          <div
            key={`blue-home-cell-${idx}`}
            className={`absolute flex items-center justify-center border ${theme.homePathBgs.blue}`}
            style={{
              left: `${coord.x * CELL_SIZE}%`,
              top: `${coord.y * CELL_SIZE}%`,
              width: `${CELL_SIZE}%`,
              height: `${CELL_SIZE}%`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/70 shadow" />
          </div>
        ))}

        {/* === CENTER HOME TRIANGLE (3x3 cells: x: 6..8, y: 6..8) === */}
        <div
          className="absolute border-2 border-neutral-800 bg-neutral-900 flex items-center justify-center overflow-hidden"
          style={{
            left: `${6 * CELL_SIZE}%`,
            top: `${6 * CELL_SIZE}%`,
            width: `${3 * CELL_SIZE}%`,
            height: `${3 * CELL_SIZE}%`,
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Red Left Triangle */}
            <polygon
              points="0,0 50,50 0,100"
              fill={theme.centerTriangleColors.red}
              stroke={theme.centerTriangleColors.stroke}
              strokeWidth="1.5"
            />
            {/* Green Top Triangle */}
            <polygon
              points="0,0 50,50 100,0"
              fill={theme.centerTriangleColors.green}
              stroke={theme.centerTriangleColors.stroke}
              strokeWidth="1.5"
            />
            {/* Yellow Right Triangle */}
            <polygon
              points="100,0 50,50 100,100"
              fill={theme.centerTriangleColors.yellow}
              stroke={theme.centerTriangleColors.stroke}
              strokeWidth="1.5"
            />
            {/* Blue Bottom Triangle */}
            <polygon
              points="0,100 50,50 100,100"
              fill={theme.centerTriangleColors.blue}
              stroke={theme.centerTriangleColors.stroke}
              strokeWidth="1.5"
            />
            {/* Center Emblem Circle */}
            <circle
              cx="50"
              cy="50"
              r="16"
              fill={theme.centerTriangleColors.centerCircleFill}
              stroke={theme.centerTriangleColors.centerCircleStroke}
              strokeWidth="2"
            />
            <text
              x="50"
              y="55"
              fontSize="13"
              textAnchor="middle"
              fill={theme.centerTriangleColors.centerCircleStroke}
              className="select-none"
            >
              {theme.centerTriangleColors.centerIcon}
            </text>
          </svg>
        </div>

        {/* === TOKENS RENDER LAYER === */}
        {Array.from(cellGroups.entries()).map(([key, group]) => {
          return group.map((item, idx) => {
            const coord = getTokenBoardCoordinate(item.token);
            const style = getCoordStyle(coord, idx, group.length);
            const palette = COLOR_PALETTE[item.player.color];

            return (
              <button
                key={`token-${item.player.color}-${item.token.id}`}
                id={`token-${item.player.color}-${item.token.id}`}
                onClick={() => {
                  if (item.isValidMove) {
                    onTokenClick(item.token.id);
                  }
                }}
                disabled={!item.isValidMove}
                className={`absolute z-20 rounded-full transition-all duration-300 flex items-center justify-center ${
                  item.isValidMove
                    ? 'cursor-pointer scale-110 ring-4 ring-white animate-bounce shadow-xl'
                    : 'cursor-default'
                }`}
                style={{
                  ...style,
                  width: `${CELL_SIZE * 0.84}%`,
                  height: `${CELL_SIZE * 0.84}%`,
                  boxShadow: item.isValidMove
                    ? `0 0 16px ${palette.glow}, 0 4px 6px -1px rgba(0, 0, 0, 0.4)`
                    : '0 2px 4px rgba(0, 0, 0, 0.3)',
                }}
                title={`${item.player.name} Token ${item.token.id + 1} (${item.token.state})`}
              >
                {/* Dynamic Token Skin View */}
                <TokenView
                  color={item.player.color}
                  skinId={tokenSkin}
                  isValidMove={item.isValidMove}
                />

                {/* Multi-token count badge if stacked */}
                {group.length > 1 && idx === 0 && (
                  <span className="absolute -top-1 -right-1 bg-neutral-900 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white z-30 shadow">
                    {group.length}
                  </span>
                )}
              </button>
            );
          });
        })}
      </div>
    </div>
  );
};
