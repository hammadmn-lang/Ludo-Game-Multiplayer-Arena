import React, { useState } from 'react';
import { PlayerColor } from '../types/ludo';
import { COLOR_PALETTE } from '../utils/ludoConstants';
import { Users, Copy, Check, Play, LogOut, ShieldCheck } from 'lucide-react';

interface WaitingRoomProps {
  roomCode: string;
  isHost: boolean;
  players: {
    id: string;
    username: string;
    avatar: string;
    color: PlayerColor;
    eloRating: number;
  }[];
  maxPlayers: number;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({
  roomCode,
  isHost,
  players,
  maxPlayers,
  onStartGame,
  onLeaveRoom,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const canStart = isHost && players.length >= 2;

  return (
    <div className="max-w-xl mx-auto p-6 sm:p-7 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-6 animate-fadeIn">
      {/* Room Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Game Room
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <h2 className="text-2xl font-black font-mono text-amber-400 tracking-wider">
              {roomCode}
            </h2>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Copy Room Code"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400">Players Joined</span>
          <div className="text-lg font-black text-white">
            {players.length} / {maxPlayers}
          </div>
        </div>
      </div>

      {/* Players List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {players.map((p, idx) => {
          const palette = COLOR_PALETTE[p.color];
          return (
            <div
              key={`wr-player-${p.id}`}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60"
            >
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg border shadow-inner"
                style={{
                  backgroundColor: palette.light,
                  borderColor: palette.primary,
                }}
              >
                <span>{p.avatar}</span>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white">{p.username}</span>
                  {idx === 0 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40">
                      HOST
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="capitalize font-semibold" style={{ color: palette.primary }}>
                    {p.color}
                  </span>
                  <span>•</span>
                  <span>{p.eloRating} Elo</span>
                </div>
              </div>

              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          );
        })}

        {/* Empty slots placeholders */}
        {Array.from({ length: maxPlayers - players.length }).map((_, idx) => (
          <div
            key={`empty-slot-${idx}`}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-slate-500"
          >
            <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-sm">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs italic">Waiting for opponent...</span>
          </div>
        ))}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onLeaveRoom}
          className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4" />
          <span>Leave Room</span>
        </button>

        {isHost ? (
          <button
            onClick={onStartGame}
            disabled={!canStart}
            id="btn-start-room-game"
            className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider shadow-xl transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{players.length < 2 ? 'Waiting for 2+ Players...' : 'START ARENA MATCH'}</span>
          </button>
        ) : (
          <div className="flex-1 py-3 px-4 rounded-2xl bg-slate-800/80 text-center text-slate-400 text-xs font-semibold border border-slate-700">
            Waiting for host to start match...
          </div>
        )}
      </div>
    </div>
  );
};
