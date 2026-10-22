import React, { useState } from 'react';
import { GameMode, AIDifficulty, PlayerColor, UserProfile, SavedGame } from '../types/ludo';
import { COLOR_PALETTE, getRankTier, QUICK_EMOJIS, QUICK_PHRASES } from '../utils/ludoConstants';
import {
  Bot,
  Users,
  Globe,
  Play,
  Plus,
  KeyRound,
  Loader2,
  Sparkles,
  Shield,
  UserPlus,
  Trophy,
  Zap,
  TrendingUp,
  MessageSquare,
  History,
  Send,
  RotateCcw,
  Phone,
  Search,
  CheckCircle,
  Palette,
} from 'lucide-react';
import { ThemeSettings } from '../types/theme';

interface LobbyViewProps {
  user: UserProfile | null;
  savedGame?: SavedGame | null;
  onResumeSavedGame?: () => void;
  onClearSavedGame?: () => void;
  onOpenContacts?: () => void;
  onOpenThemes?: () => void;
  onOpenPrivacyPolicy?: () => void;
  onOpenDeleteAccount?: () => void;
  onOpenDataSafety?: () => void;
  onOpenScreenshots?: () => void;
  themeSettings?: ThemeSettings;
  onStartVsComputer: (
    playersCount: number,
    userColor: PlayerColor,
    difficulty: AIDifficulty
  ) => void;
  onStartLocalMultiplayer: (
    players: { name: string; color: PlayerColor; avatar: string }[]
  ) => void;
  onStartQuickMatch: (playersCount: number) => void;
  onCreateOnlineRoom: (playersCount: number) => void;
  onJoinOnlineRoom: (roomCode: string) => void;
  isMatchmaking: boolean;
  onCancelMatchmaking: () => void;
  onOpenAuth: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  user,
  savedGame,
  onResumeSavedGame,
  onClearSavedGame,
  onOpenContacts,
  onOpenThemes,
  onOpenPrivacyPolicy,
  onOpenDeleteAccount,
  onOpenDataSafety,
  onOpenScreenshots,
  themeSettings,
  onStartVsComputer,
  onStartLocalMultiplayer,
  onStartQuickMatch,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  isMatchmaking,
  onCancelMatchmaking,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<GameMode>('online_multiplayer');

  // VS Computer setup states
  const [vsPlayerCount, setVsPlayerCount] = useState<number>(4);
  const [vsUserColor, setVsUserColor] = useState<PlayerColor>('red');
  const [vsDifficulty, setVsDifficulty] = useState<AIDifficulty>('medium');

  // Local Pass & Play setup states
  const [localPlayerCount, setLocalPlayerCount] = useState<number>(4);
  const [localPlayers, setLocalPlayers] = useState([
    { name: user?.username || 'Player 1', color: 'red' as PlayerColor, avatar: user?.avatar || '🦁' },
    { name: 'Player 2', color: 'green' as PlayerColor, avatar: '🐯' },
    { name: 'Player 3', color: 'yellow' as PlayerColor, avatar: '🐉' },
    { name: 'Player 4', color: 'blue' as PlayerColor, avatar: '🦅' },
  ]);

  // Online Room setup states
  const [onlinePlayerCount, setOnlinePlayerCount] = useState<number>(4);
  const [joinCode, setJoinCode] = useState<string>('');
  const [showRoomModal, setShowRoomModal] = useState<boolean>(false);

  // Mock live lobby chat messages for atmospheric banter
  const [lobbyChat, setLobbyChat] = useState<{ id: string; user: string; text: string; isMe?: boolean }[]>([
    { id: '1', user: 'Alex_Pro', text: 'GG everyone! That red token block was insane.' },
    { id: '2', user: 'KnightRider', text: 'Who wants to queue for a 4-player Grandmaster room?', isMe: true },
    { id: '3', user: 'Elena_99', text: 'Adding you now! Ready for rematch.' },
  ]);
  const [chatInput, setChatInput] = useState('');

  const colorsList: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
  const userTier = user ? getRankTier(user.stats.eloRating) : null;

  const winRate =
    user && user.stats.totalMatches > 0
      ? ((user.stats.wins / user.stats.totalMatches) * 100).toFixed(1)
      : '64.2';

  const handleStartVsComputer = () => {
    onStartVsComputer(vsPlayerCount, vsUserColor, vsDifficulty);
  };

  const handleStartLocal = () => {
    const activeLocal = localPlayers.slice(0, localPlayerCount);
    onStartLocalMultiplayer(activeLocal);
  };

  const handleSendLobbyChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    setLobbyChat((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        user: user?.username || 'You',
        text: chatInput.trim(),
        isMe: true,
      },
    ]);
    setChatInput('');
  };

  return (
    <div className="w-full space-y-4 animate-fadeIn" id="bento-lobby-container">
      {/* Resume Saved Active Game Banner */}
      {savedGame && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/60 border-2 border-amber-500/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl text-amber-400 shrink-0">
              🎲
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Game in Progress
                </span>
                <span className="text-xs text-slate-400">
                  Saved {new Date(savedGame.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h3 className="font-bold text-white text-sm sm:text-base mt-0.5">
                {savedGame.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onClearSavedGame && (
              <button
                onClick={onClearSavedGame}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                Discard
              </button>
            )}
            {onResumeSavedGame && (
              <button
                onClick={onResumeSavedGame}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Resume Game</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bento Grid Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* ================= BENTO CELL 1: LIFETIME STATS & CONTACTS (Col-Span 3, Row-Span 2) ================= */}
        <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden shadow-xl min-h-[220px]">
          <div className="z-10">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-slate-400 text-xs uppercase font-black tracking-wider">
                Lifetime Stats
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {userTier?.name || 'Gold Tier'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <div className="text-4xl font-black tracking-tight text-white">{winRate}%</div>
              <span className="text-xs font-semibold text-emerald-400 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +2.4%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Win Rate across all competitive arenas</p>

            {/* Quick Contacts search trigger button */}
            {onOpenContacts && (
              <button
                onClick={onOpenContacts}
                className="w-full mt-3 px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-bold transition flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Search Contacts & Phone</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 z-10 mt-2">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Wins</p>
              <p className="font-extrabold text-sm text-slate-100">{user?.stats.wins ?? 284}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Losses</p>
              <p className="font-extrabold text-sm text-slate-100">{user?.stats.losses ?? 158}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Streak</p>
              <p className="font-extrabold text-sm text-amber-400">🔥 {user?.stats.winStreak ?? 4}</p>
            </div>
          </div>

          {/* Ambient Glow Orb */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* ================= BENTO CELL 2: CENTRAL ARENA & MATCH HUB (Col-Span 6, Row-Span 4) ================= */}
        <div className="md:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col items-center justify-between relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 shadow-2xl overflow-hidden min-h-[380px]">
          
          {/* Top Mode Segmented Pill */}
          <div className="w-full flex items-center justify-between gap-2 z-10 mb-3">
            <div className="flex p-1 bg-slate-950/80 border border-slate-800 rounded-2xl">
              <button
                onClick={() => setActiveTab('online_multiplayer')}
                id="bento-tab-online"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'online_multiplayer'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Online Arena</span>
              </button>

              <button
                onClick={() => setActiveTab('vs_computer')}
                id="bento-tab-vs-ai"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'vs_computer'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>VS AI</span>
              </button>

              <button
                onClick={() => setActiveTab('local_multiplayer')}
                id="bento-tab-local"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'local_multiplayer'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Pass & Play</span>
              </button>
            </div>

            {/* Quick Player Count Pill */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-950/60 border border-slate-800 px-2.5 py-1 rounded-xl text-xs text-slate-300">
              <span className="text-indigo-400 font-bold">4P</span> Match
            </div>
          </div>

          {/* Center Stage: Interactive Stylized Mini Ludo Arena Visual */}
          {activeTab === 'online_multiplayer' && (
            <div className="flex flex-col items-center justify-center my-auto z-10 w-full">
              {isMatchmaking ? (
                <div className="py-8 text-center space-y-3">
                  <div className="relative w-16 h-16 mx-auto">
                    <Loader2 className="w-16 h-16 text-indigo-400 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                      🎲
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-white">Finding Opponent...</h4>
                  <p className="text-xs text-slate-400 font-mono">14,208 players queued in global lobby</p>
                  <button
                    onClick={onCancelMatchmaking}
                    className="px-4 py-1.5 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition"
                  >
                    Cancel Queue
                  </button>
                </div>
              ) : (
                <>
                  {/* Stylized Ludo 4-Quadrant Preview Board from Bento Design */}
                  <div className="grid grid-cols-2 grid-rows-2 w-48 h-48 sm:w-56 sm:h-56 gap-2 p-2 bg-slate-800/90 rounded-2xl relative shadow-2xl border border-slate-700/60 my-2">
                    {/* Red Quadrant */}
                    <div className="bg-red-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.35)] transition-transform hover:scale-105">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/25 rounded-full border border-white/40 flex items-center justify-center text-white text-xs font-bold">
                        R
                      </div>
                    </div>
                    {/* Green Quadrant */}
                    <div className="bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-transform hover:scale-105">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/25 rounded-full border border-white/40 flex items-center justify-center text-white text-xs font-bold">
                        G
                      </div>
                    </div>
                    {/* Blue Quadrant */}
                    <div className="bg-blue-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.35)] transition-transform hover:scale-105">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/25 rounded-full border border-white/40 flex items-center justify-center text-white text-xs font-bold">
                        B
                      </div>
                    </div>
                    {/* Yellow Quadrant */}
                    <div className="bg-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-transform hover:scale-105">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/25 rounded-full border border-white/40 flex items-center justify-center text-white text-xs font-bold">
                        Y
                      </div>
                    </div>

                    {/* Center Rotating Diamond Badge */}
                    <div className="absolute inset-0 m-auto w-10 h-10 bg-slate-950 rotate-45 border-2 border-slate-700 rounded-lg flex items-center justify-center overflow-hidden shadow-xl">
                      <div className="w-full h-full relative">
                        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-red-500/40"></div>
                        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-emerald-500/40"></div>
                        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-500/40"></div>
                        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-amber-500/40"></div>
                      </div>
                    </div>
                  </div>

                  {/* Primary CTA: Quick Match Button */}
                  <div className="flex flex-col items-center mt-3 gap-1.5">
                    <button
                      onClick={() => onStartQuickMatch(onlinePlayerCount)}
                      id="btn-bento-quick-match"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 sm:px-10 py-3 rounded-full font-black text-sm sm:text-base shadow-xl shadow-indigo-500/30 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>QUICK MATCH ({onlinePlayerCount}P)</span>
                    </button>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Finding match in &lt; 5s • 14,204 online now
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* VS Computer Config View */}
          {activeTab === 'vs_computer' && (
            <div className="w-full space-y-4 py-2 z-10" id="bento-vs-ai-panel">
              {/* Select Player Count */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Player Count
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[2, 3, 4].map((count) => (
                    <button
                      key={`bento-vsc-${count}`}
                      onClick={() => setVsPlayerCount(count)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        vsPlayerCount === count
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      {count} Players {count === 2 ? '(1v1)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Select */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Your Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colorsList.map((color) => {
                    const palette = COLOR_PALETTE[color];
                    const isSelected = vsUserColor === color;
                    return (
                      <button
                        key={`bento-color-${color}`}
                        onClick={() => setVsUserColor(color)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition ${
                          isSelected
                            ? 'border-white bg-slate-800 scale-102 shadow-lg'
                            : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-full border border-white flex items-center justify-center text-[10px] text-white"
                          style={{ backgroundColor: palette.primary }}
                        >
                          {isSelected ? '✓' : ''}
                        </div>
                        <span className="text-[10px] font-bold capitalize text-slate-300">{color}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  AI Difficulty
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((diff) => (
                    <button
                      key={`bento-diff-${diff}`}
                      onClick={() => setVsDifficulty(diff)}
                      className={`py-1.5 rounded-xl border text-[11px] font-bold capitalize transition ${
                        vsDifficulty === diff
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700'
                      }`}
                    >
                      {diff === 'easy' ? '🟢 Casual' : diff === 'medium' ? '🟡 Strategic' : '🔴 Master'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStartVsComputer}
                id="btn-bento-start-ai"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-lg shadow-indigo-500/25 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>LAUNCH MATCH VS AI</span>
              </button>
            </div>
          )}

          {/* Pass & Play Config View */}
          {activeTab === 'local_multiplayer' && (
            <div className="w-full space-y-3 py-2 z-10" id="bento-local-panel">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Local Players</span>
                <div className="flex gap-1">
                  {[2, 3, 4].map((cnt) => (
                    <button
                      key={`local-cnt-btn-${cnt}`}
                      onClick={() => setLocalPlayerCount(cnt)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                        localPlayerCount === cnt
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {cnt}P
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {localPlayers.slice(0, localPlayerCount).map((p, idx) => {
                  const palette = COLOR_PALETTE[p.color];
                  return (
                    <div
                      key={`bento-lp-${idx}`}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/80 border border-slate-700"
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-white"
                        style={{ backgroundColor: palette.primary }}
                      >
                        {p.avatar}
                      </div>
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => {
                          const updated = [...localPlayers];
                          updated[idx].name = e.target.value;
                          setLocalPlayers(updated);
                        }}
                        className="flex-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
                        maxLength={15}
                      />
                      <span className="text-[10px] font-bold capitalize text-slate-400">{p.color}</span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleStartLocal}
                id="btn-bento-start-local"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-lg shadow-indigo-500/25 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>START PASS & PLAY</span>
              </button>
            </div>
          )}

          {/* Bottom Guest Sign-In Reminder banner */}
          {!user && (
            <div className="w-full mt-2 p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-[11px] z-10">
              <span className="text-indigo-300">Guest mode active. Sign in to save rankings & Elo!</span>
              <button
                onClick={onOpenAuth}
                className="font-bold text-indigo-400 underline hover:text-indigo-300 cursor-pointer ml-2"
              >
                Sign In
              </button>
            </div>
          )}

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* ================= BENTO CELL 3: LOBBY CHAT (Col-Span 3, Row-Span 4) ================= */}
        <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-xl min-h-[380px]">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Lobby Chat
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] text-slate-500 font-mono">LIVE</span>
            </div>
          </div>

          {/* Chat Feed */}
          <div className="flex-1 p-3.5 space-y-3 overflow-y-auto max-h-[260px] text-xs">
            {lobbyChat.map((msg) => (
              <div
                key={`bento-chat-${msg.id}`}
                className={`flex gap-2 ${msg.isMe ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${
                    msg.isMe ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {msg.user.substring(0, 1)}
                </div>
                <div
                  className={`p-2.5 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
                    msg.isMe
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50'
                  }`}
                >
                  <p className="text-[9px] font-bold text-slate-400 mb-0.5">{msg.user}</p>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Reaction Emojis Strip */}
          <div className="px-2 py-1.5 bg-slate-950/40 border-t border-slate-800 flex gap-1 justify-around text-sm">
            {['🔥', '🎲', '👑', '🎯', '😄'].map((em) => (
              <button
                key={`bento-em-${em}`}
                onClick={() => {
                  setLobbyChat((p) => [
                    ...p,
                    { id: String(Date.now()), user: user?.username || 'You', text: em, isMe: true },
                  ]);
                }}
                className="hover:scale-125 transition-transform"
              >
                {em}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendLobbyChat} className="p-2.5 bg-slate-950 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type message..."
              className="flex-1 bg-slate-800 rounded-full px-3.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              maxLength={60}
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="p-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* ================= BENTO CELL 4: MATCH HISTORY (Col-Span 3, Row-Span 4) ================= */}
        <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col shadow-xl min-h-[220px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-400 text-xs uppercase font-black tracking-widest flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span>Match History</span>
            </h3>
            <span className="text-[10px] text-slate-500">Recent</span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {user?.matches && user.matches.length > 0 ? (
              user.matches.slice(0, 3).map((m) => {
                const isWin = m.rank === 1;
                return (
                  <div
                    key={`m-hist-${m.id}`}
                    className={`flex items-center justify-between p-2.5 bg-slate-800/50 rounded-2xl border-l-4 ${
                      isWin ? 'border-emerald-500' : 'border-rose-500 opacity-80'
                    }`}
                  >
                    <div className="text-xs">
                      <p className="font-bold text-slate-200">
                        {m.mode === 'vs_computer' ? 'vs CPU' : 'vs Arena Match'}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {m.tokensCaptured || 0} captures • {m.durationSeconds}s
                      </p>
                    </div>
                    <div
                      className={`font-black text-xs uppercase ${
                        isWin ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isWin ? 'WIN' : 'LOSS'}
                    </div>
                  </div>
                );
              })
            ) : (
              <>
                <div className="flex items-center justify-between p-2.5 bg-slate-800/50 rounded-2xl border-l-4 border-emerald-500">
                  <div className="text-xs">
                    <p className="font-bold text-slate-200">vs CPU (Strategic)</p>
                    <p className="text-[10px] text-slate-500">2m ago • 4 Players</p>
                  </div>
                  <div className="text-emerald-400 font-black text-xs uppercase">WIN</div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-800/50 rounded-2xl border-l-4 border-rose-500 opacity-80">
                  <div className="text-xs">
                    <p className="font-bold text-slate-200">vs Sarah_X</p>
                    <p className="text-[10px] text-slate-500">1h ago • Online</p>
                  </div>
                  <div className="text-rose-400 font-black text-xs uppercase">LOSS</div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-800/50 rounded-2xl border-l-4 border-emerald-500">
                  <div className="text-xs">
                    <p className="font-bold text-slate-200">vs Local Guest</p>
                    <p className="text-[10px] text-slate-500">Yesterday • Pass & Play</p>
                  </div>
                  <div className="text-emerald-400 font-black text-xs uppercase">WIN</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ================= BENTO BOTTOM ROW: 4 QUICK FEATURE / MODE TILES (Col-Span 9) ================= */}
        <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* Tile 1: vs Computer */}
          <div
            onClick={() => setActiveTab('vs_computer')}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center gap-3.5 hover:border-indigo-500/50 hover:bg-slate-850 transition-all cursor-pointer group shadow-lg"
          >
            <div className="w-11 h-11 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-xl text-indigo-400 group-hover:scale-110 transition-transform shrink-0">
              🤖
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors">
                vs Computer
              </h4>
              <p className="text-[10px] text-slate-400">Practice vs smart AI</p>
            </div>
          </div>

          {/* Tile 2: Local Multiplayer */}
          <div
            onClick={() => setActiveTab('local_multiplayer')}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center gap-3.5 hover:border-purple-500/50 hover:bg-slate-850 transition-all cursor-pointer group shadow-lg"
          >
            <div className="w-11 h-11 bg-purple-500/20 rounded-2xl flex items-center justify-center text-xl text-purple-400 group-hover:scale-110 transition-transform shrink-0">
              👥
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100 group-hover:text-purple-300 transition-colors">
                Local Pass & Play
              </h4>
              <p className="text-[10px] text-slate-400">Play on 1 device</p>
            </div>
          </div>

          {/* Tile 3: Private Room */}
          <div
            onClick={() => setShowRoomModal(true)}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center gap-3.5 hover:border-pink-500/50 hover:bg-slate-850 transition-all cursor-pointer group shadow-lg"
          >
            <div className="w-11 h-11 bg-pink-500/20 rounded-2xl flex items-center justify-center text-xl text-pink-400 group-hover:scale-110 transition-transform shrink-0">
              ⚡
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100 group-hover:text-pink-300 transition-colors">
                Private Room
              </h4>
              <p className="text-[10px] text-slate-400">Host or join code</p>
            </div>
          </div>

          {/* Tile 4: Themes & Skins Studio */}
          <div
            onClick={onOpenThemes}
            id="tile-open-theme-studio"
            className="bg-gradient-to-tr from-indigo-950/40 via-slate-900 to-amber-950/40 border border-amber-500/40 rounded-3xl p-4 flex items-center gap-3.5 hover:border-amber-400 hover:bg-slate-850 transition-all cursor-pointer group shadow-lg"
          >
            <div className="w-11 h-11 bg-amber-500/20 rounded-2xl flex items-center justify-center text-xl text-amber-400 group-hover:scale-110 transition-transform shrink-0">
              🎨
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-200 group-hover:text-amber-100 transition-colors flex items-center gap-1.5">
                <span>Themes & Skins</span>
              </h4>
              <p className="text-[10px] text-slate-400">
                {themeSettings?.boardTheme ? `Theme: ${themeSettings.boardTheme}` : 'Customize boards & dice'}
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* App Store & Legal Copyright Footer */}
      <footer className="mt-8 pt-6 pb-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
          <span className="font-semibold text-slate-300">
            © 2026 Ludo Game &amp; Multiplayer Arena. All rights reserved.
          </span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="text-[11px] text-slate-500">
            Vercel &amp; Google Play Production Build
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3">
          {onOpenScreenshots && (
            <button
              onClick={onOpenScreenshots}
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition cursor-pointer"
              id="footer-btn-screenshots"
            >
              <span>Screenshots</span>
            </button>
          )}

          <span className="text-slate-700">•</span>

          {onOpenPrivacyPolicy && (
            <button
              onClick={onOpenPrivacyPolicy}
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition cursor-pointer"
              id="footer-btn-privacy"
            >
              <span>Privacy Policy</span>
            </button>
          )}

          <span className="text-slate-700">•</span>

          {onOpenDataSafety && (
            <button
              onClick={onOpenDataSafety}
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition cursor-pointer"
              id="footer-btn-data-safety"
            >
              <span>Data Safety</span>
            </button>
          )}

          <span className="text-slate-700">•</span>

          {onOpenDeleteAccount && (
            <button
              onClick={onOpenDeleteAccount}
              className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition cursor-pointer"
              id="footer-btn-delete-account"
            >
              <span>Delete Account</span>
            </button>
          )}
        </div>
      </footer>

      {/* Private Room Host/Join Dialog */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Private Game Room</h3>
                  <p className="text-xs text-slate-400">Host a match or join your friend's room</p>
                </div>
              </div>
              <button
                onClick={() => setShowRoomModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Option A: Create Room */}
            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-3">
              <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
                Create Private Room
              </h4>
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  {[2, 3, 4].map((cnt) => (
                    <button
                      key={`room-cnt-${cnt}`}
                      onClick={() => setOnlinePlayerCount(cnt)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition ${
                        onlinePlayerCount === cnt
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {cnt}P
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setShowRoomModal(false);
                    onCreateOnlineRoom(onlinePlayerCount);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
                >
                  Host Room
                </button>
              </div>
            </div>

            {/* Option B: Join with Code */}
            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-3">
              <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
                Join with 6-Digit Code
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="CODE"
                  maxLength={6}
                  className="w-28 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-center font-mono font-bold text-sm tracking-widest focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => {
                    if (joinCode.trim().length >= 4) {
                      setShowRoomModal(false);
                      onJoinOnlineRoom(joinCode.trim());
                    }
                  }}
                  disabled={joinCode.trim().length < 4}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow transition"
                >
                  Join Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
