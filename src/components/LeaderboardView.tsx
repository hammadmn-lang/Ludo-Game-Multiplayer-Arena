import React, { useEffect, useState } from 'react';
import { getRankTier } from '../utils/ludoConstants';
import { Trophy, Award, Flame, Target, Users, RefreshCw } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  username: string;
  avatar: string;
  country?: string;
  team?: {
    id: string;
    name: string;
    tag: string;
    avatar: string;
    role: string;
  };
  eloRating: number;
  wins: number;
  totalMatches: number;
  winRate: number;
  winStreak: number;
  tokensCaptured: number;
}

export const LeaderboardView: React.FC = () => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.leaderboard) {
        setLeaders(data.leaderboard);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fadeIn" id="leaderboard-view">
      {/* Header Bento Box */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Global Player Rankings</h2>
            <p className="text-xs text-slate-400">
              Rankings updated in real-time based on competitive Elo ratings.
            </p>
          </div>
        </div>

        <button
          onClick={fetchLeaderboard}
          disabled={isLoading}
          className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          title="Refresh Leaderboard"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Leaderboard Table Bento Card */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
              <th className="py-3 px-3 font-bold">Rank</th>
              <th className="py-3 px-3 font-bold">Player</th>
              <th className="py-3 px-3 font-bold">Division</th>
              <th className="py-3 px-3 font-bold text-center">Elo</th>
              <th className="py-3 px-3 font-bold text-center">Win Rate</th>
              <th className="py-3 px-3 font-bold text-right">Captured</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {leaders.map((player, idx) => {
              const tier = getRankTier(player.eloRating);
              const isTop1 = idx === 0;
              const isTop2 = idx === 1;
              const isTop3 = idx === 2;

              return (
                <tr
                  key={player.id}
                  className={`hover:bg-slate-800/40 transition ${
                    isTop1 ? 'bg-amber-500/5' : ''
                  }`}
                >
                  <td className="py-3.5 px-3">
                    {isTop1 ? (
                      <span className="text-lg">🥇</span>
                    ) : isTop2 ? (
                      <span className="text-lg">🥈</span>
                    ) : isTop3 ? (
                      <span className="text-lg">🥉</span>
                    ) : (
                      <span className="font-bold text-slate-500 text-xs pl-1">
                        #{idx + 1}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{player.avatar}</span>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-white text-sm">{player.username}</span>
                          {player.team && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold border border-indigo-500/30 flex items-center gap-1" title={`Team: ${player.team.name}`}>
                              <span>{player.team.avatar || '🛡️'}</span>
                              <span>[{player.team.tag}]</span>
                            </span>
                          )}
                          {player.country && (
                            <span className="text-[11px] text-slate-400 font-normal">
                              {player.country}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {player.wins}W / {player.totalMatches - player.wins}L
                          {player.winStreak > 1 && (
                            <span className="ml-2 text-amber-400 font-semibold">
                              🔥 {player.winStreak} streak
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border inline-flex items-center gap-1"
                      style={{
                        backgroundColor: `${tier.color}15`,
                        color: tier.color,
                        borderColor: `${tier.color}40`,
                      }}
                    >
                      <span>{tier.badge}</span>
                      <span>{tier.name}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center font-black text-white">
                    {player.eloRating}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className="font-bold text-emerald-400">{player.winRate}%</span>
                  </td>

                  <td className="py-3.5 px-3 text-right font-bold text-slate-300">
                    {player.tokensCaptured} 🎯
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
