import React, { useState } from 'react';
import { GameMode, AIDifficulty, PlayerColor, UserProfile, SavedGame } from '../types/ludo';
import { COLOR_PALETTE, getRankTier } from '../utils/ludoConstants';
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
  Share2,
  Copy,
  Trash2,
  UserCheck,
  Check,
  Smartphone,
  ArrowRight,
  LogIn,
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
  onChallengePlayer?: (player: { id: string; username: string; avatar: string; eloRating: number }) => void;
  isMatchmaking: boolean;
  onCancelMatchmaking: () => void;
  onOpenAuth: (defaultToRegister?: boolean) => void;
}

const AVAILABLE_AVATARS = ['🦁', '🐯', '🐉', '🦅', '👑', '🎯', '⚡', '🦊', '🤖', '🌟', '🦄', '🥋', '🔥', '🎲'];

// Online players available for direct challenge
const ONLINE_CHALLENGE_USERS = [
  { id: 'user_grandmaster', username: 'KingLudo_99', avatar: '👑', eloRating: 2150, country: 'United States 🇺🇸', isOnline: true },
  { id: 'user_diamond', username: 'PawnStriker', avatar: '🎯', eloRating: 1780, country: 'India 🇮🇳', isOnline: true },
  { id: 'user_alex', username: 'Alex_Champion', avatar: '⚡', eloRating: 1620, country: 'Canada 🇨🇦', isOnline: true },
  { id: 'user_samira', username: 'Samira_Pro', avatar: '🌸', eloRating: 1580, country: 'UAE 🇦🇪', isOnline: true },
  { id: 'user_shadow', username: 'ShadowKnight', avatar: '🐉', eloRating: 1450, country: 'Pakistan 🇵🇰', isOnline: true },
];

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
  onChallengePlayer,
  isMatchmaking,
  onCancelMatchmaking,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<GameMode>('online_multiplayer');

  // VS Computer setup states
  const [vsPlayerCount, setVsPlayerCount] = useState<number>(4);
  const [vsUserColor, setVsUserColor] = useState<PlayerColor>('red');
  const [vsDifficulty, setVsDifficulty] = useState<AIDifficulty>('medium');

  // Local Pass & Play Roster (Dynamic Add Player)
  const [localRoster, setLocalRoster] = useState<Array<{ id: string; name: string; color: PlayerColor; avatar: string }>>([
    { id: 'p1', name: user?.username || 'Player 1', color: 'red', avatar: user?.avatar || '🦁' },
    { id: 'p2', name: 'Friend 1', color: 'green', avatar: '🐯' },
  ]);

  // Online Room setup states
  const [onlinePlayerCount, setOnlinePlayerCount] = useState<number>(4);
  const [joinCode, setJoinCode] = useState<string>('');
  const [showRoomModal, setShowRoomModal] = useState<boolean>(false);
  const [copiedAppInvite, setCopiedAppInvite] = useState(false);
  const [onlineTabSubMode, setOnlineTabSubMode] = useState<'quick' | 'challenge' | 'invite'>('quick');

  // Mock live lobby chat messages
  const [lobbyChat, setLobbyChat] = useState<{ id: string; user: string; text: string; isMe?: boolean }[]>([
    { id: '1', user: 'Alex_Champion', text: 'Who is ready for a 4-player Championship?' },
    { id: '2', user: 'KingLudo_99', text: 'Challenge me directly if you dare! 👑' },
    { id: '3', user: 'PawnStriker', text: 'Sent game invite to contacts.' },
  ]);
  const [chatInput, setChatInput] = useState('');

  const colorsList: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
  const userTier = user ? getRankTier(user.stats.eloRating) : null;

  const winRate =
    user && user.stats.totalMatches > 0
      ? ((user.stats.wins / user.stats.totalMatches) * 100).toFixed(1)
      : '64.2';

  // Add player to local roster
  const handleAddLocalPlayer = () => {
    if (localRoster.length >= 4) return;
    const nextIdx = localRoster.length;
    const nextColor = colorsList[nextIdx] || 'blue';
    const nextAvatar = AVAILABLE_AVATARS[nextIdx + 2] || '🦊';
    setLocalRoster([
      ...localRoster,
      {
        id: `local_p_${Date.now()}`,
        name: `Friend ${nextIdx}`,
        color: nextColor,
        avatar: nextAvatar,
      },
    ]);
  };

  // Remove player from local roster
  const handleRemoveLocalPlayer = (id: string) => {
    if (localRoster.length <= 2) return;
    setLocalRoster(localRoster.filter((p) => p.id !== id));
  };

  // Update specific player in local roster
  const handleUpdateLocalPlayer = (idx: number, updates: Partial<{ name: string; color: PlayerColor; avatar: string }>) => {
    const updated = [...localRoster];
    updated[idx] = { ...updated[idx], ...updates };
    setLocalRoster(updated);
  };

  // Start Pass & Play
  const handleStartLocalMatch = () => {
    const playersToStart = localRoster.map((p) => ({
      name: p.name.trim() || 'Player',
      color: p.color,
      avatar: p.avatar,
    }));
    onStartLocalMultiplayer(playersToStart);
  };

  // Send App Invite via Share API / WhatsApp / SMS
  const handleSendAppInvite = async () => {
    const inviteText = `🎲 Join me for a game of Ludo King on Ludo Arena! Play online on your phone here: ${window.location.origin}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Play Ludo Multiplayer Arena',
          text: inviteText,
          url: window.location.origin,
        });
        return;
      } catch {
        // User cancelled or unsupported
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(inviteText);
      setCopiedAppInvite(true);
      setTimeout(() => setCopiedAppInvite(false), 3000);
    } catch {
      // Fallback
    }
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
      
      {/* ================= MOBILE ACCOUNT REGISTRATION & SIGN-IN PROMPT BANNER ================= */}
      {!user && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border-2 border-indigo-500/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-2xl text-indigo-400 shrink-0 shadow-lg shadow-indigo-500/20">
              👑
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  Player Account
                </span>
                <span className="text-xs text-slate-400">Unlock Ranked Leaderboards</span>
              </div>
              <h3 className="font-black text-white text-sm sm:text-base mt-0.5">
                Create Player Account or Sign In
              </h3>
              <p className="text-xs text-slate-300">
                Register to track your Elo rating, challenge friends, and climb the global rankings!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
            <button
              onClick={() => onOpenAuth(true)}
              id="btn-lobby-register"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Register Account</span>
            </button>
            <button
              onClick={() => onOpenAuth(false)}
              id="btn-lobby-signin"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      )}

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
        
        {/* ================= BENTO CELL 1: LIFETIME STATS & CONTACTS (Col-Span 3) ================= */}
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
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-white">{winRate}%</div>
              <span className="text-xs font-semibold text-emerald-400 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +2.4%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Win Rate across competitive matches</p>

            {/* Quick Contacts search trigger button */}
            {onOpenContacts && (
              <button
                onClick={onOpenContacts}
                className="w-full mt-3 px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-bold transition flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Contacts & Online Friends</span>
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

          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* ================= BENTO CELL 2: CENTRAL ARENA & MATCH HUB (Col-Span 6) ================= */}
        <div className="md:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 flex flex-col justify-between relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 shadow-2xl overflow-hidden min-h-[460px]">
          
          {/* Top Mode Segmented Pill */}
          <div className="w-full flex items-center justify-between gap-1.5 z-10 mb-3">
            <div className="flex p-1 bg-slate-950/80 border border-slate-800 rounded-2xl w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('online_multiplayer')}
                id="bento-tab-online"
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'online_multiplayer'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Online Arena</span>
              </button>

              <button
                onClick={() => setActiveTab('local_multiplayer')}
                id="bento-tab-local"
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'local_multiplayer'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Pass & Play</span>
              </button>

              <button
                onClick={() => setActiveTab('vs_computer')}
                id="bento-tab-vs-ai"
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'vs_computer'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>VS AI</span>
              </button>
            </div>
          </div>

          {/* ================= TAB 1: ONLINE MULTIPLAYER ARENA ================= */}
          {activeTab === 'online_multiplayer' && (
            <div className="w-full z-10 flex flex-col items-center">
              
              {/* Online Sub-Tabs: Quick Match vs Challenge Users vs Invite Contacts */}
              <div className="flex gap-1 p-1 bg-slate-950/90 rounded-2xl border border-slate-800 mb-3 w-full">
                <button
                  type="button"
                  onClick={() => setOnlineTabSubMode('quick')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
                    onlineTabSubMode === 'quick' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Quick Match</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOnlineTabSubMode('challenge')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
                    onlineTabSubMode === 'challenge' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Challenge Online User</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOnlineTabSubMode('invite')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
                    onlineTabSubMode === 'invite' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Share2 className="w-3 h-3 text-cyan-400" />
                  <span>Invite Contact</span>
                </button>
              </div>

              {/* Sub-view A: Quick Match */}
              {onlineTabSubMode === 'quick' && (
                <div className="flex flex-col items-center justify-center w-full py-2">
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
                        className="px-4 py-1.5 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition cursor-pointer"
                      >
                        Cancel Queue
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Stylized Ludo 4-Quadrant Preview */}
                      <div className="grid grid-cols-2 grid-rows-2 w-40 h-40 sm:w-48 sm:h-48 gap-2 p-2 bg-slate-800/90 rounded-2xl relative shadow-2xl border border-slate-700/60 my-2">
                        <div className="bg-red-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.35)]">
                          <span className="text-white font-black text-sm">R</span>
                        </div>
                        <div className="bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.35)]">
                          <span className="text-white font-black text-sm">G</span>
                        </div>
                        <div className="bg-blue-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.35)]">
                          <span className="text-white font-black text-sm">B</span>
                        </div>
                        <div className="bg-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.35)]">
                          <span className="text-white font-black text-sm">Y</span>
                        </div>
                        <div className="absolute inset-0 m-auto w-8 h-8 bg-slate-950 rotate-45 border-2 border-slate-700 rounded-lg flex items-center justify-center" />
                      </div>

                      {/* Player Count Selector */}
                      <div className="flex gap-2 my-2">
                        {[2, 4].map((cnt) => (
                          <button
                            key={`quick-p-${cnt}`}
                            onClick={() => setOnlinePlayerCount(cnt)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
                              onlinePlayerCount === cnt
                                ? 'bg-indigo-600 text-white border-indigo-500'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {cnt === 2 ? '1v1 Duel (2P)' : '4-Player Arena (4P)'}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => onStartQuickMatch(onlinePlayerCount)}
                        id="btn-bento-quick-match"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full font-black text-sm shadow-xl shadow-indigo-500/30 active:scale-95 transition-all cursor-pointer flex items-center gap-2 mt-1"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>QUICK MATCH ({onlinePlayerCount}P)</span>
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Sub-view B: Challenge Specific Online User */}
              {onlineTabSubMode === 'challenge' && (
                <div className="w-full space-y-2 py-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Select Online Player to Challenge
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      5 Champions Active
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                    {ONLINE_CHALLENGE_USERS.map((challenger) => (
                      <div
                        key={challenger.id}
                        className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 transition flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-lg relative">
                            {challenger.avatar}
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-white">{challenger.username}</span>
                              <span className="text-[10px] font-mono text-amber-400 font-bold">
                                {challenger.eloRating} Elo
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">{challenger.country}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (onChallengePlayer) {
                              onChallengePlayer(challenger);
                            } else {
                              onCreateOnlineRoom(2);
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow flex items-center gap-1 cursor-pointer active:scale-95 transition"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>Challenge</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-view C: Send App Invite to Contact & Ask to Join */}
              {onlineTabSubMode === 'invite' && (
                <div className="w-full space-y-3 py-1">
                  <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-2">
                    <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                      <Smartphone className="w-4 h-4 text-indigo-400" />
                      <span>Send App Invite to Contact</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Invite friends from your phonebook or WhatsApp! Once they open the app, you will be notified and can immediately ask them to join your match.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <button
                        onClick={handleSendAppInvite}
                        className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
                      >
                        {copiedAppInvite ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Invite Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Share App Invite (WhatsApp / SMS)</span>
                          </>
                        )}
                      </button>

                      {onOpenContacts && (
                        <button
                          onClick={onOpenContacts}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Contacts List</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Private Room Code Tile */}
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-xs text-white">Have a Room Code?</h5>
                      <p className="text-[10px] text-slate-400">Join a friend&apos;s private arena</p>
                    </div>
                    <button
                      onClick={() => setShowRoomModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
                    >
                      Enter Code
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: LOCAL MULTIPLAYER (PASS & PLAY - ADD PLAYER) ================= */}
          {activeTab === 'local_multiplayer' && (
            <div className="w-full space-y-3 z-10" id="bento-local-panel">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm text-white">Play on Same Device (Pass & Play)</h4>
                  <p className="text-[11px] text-slate-400">
                    Add friends by name and pass this phone to take turns!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddLocalPlayer}
                  disabled={localRoster.length >= 4}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs shadow flex items-center gap-1 cursor-pointer transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Player</span>
                </button>
              </div>

              {/* Dynamic Players Roster Builder */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                {localRoster.map((player, idx) => {
                  const palette = COLOR_PALETTE[player.color];
                  return (
                    <div
                      key={player.id}
                      className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2 shadow-sm"
                    >
                      {/* Avatar Picker Pill */}
                      <button
                        type="button"
                        onClick={() => {
                          const nextAvIdx = (AVAILABLE_AVATARS.indexOf(player.avatar) + 1) % AVAILABLE_AVATARS.length;
                          handleUpdateLocalPlayer(idx, { avatar: AVAILABLE_AVATARS[nextAvIdx] });
                        }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-sm border-2 transition cursor-pointer hover:scale-105 shrink-0"
                        style={{ borderColor: palette.primary, backgroundColor: `${palette.primary}20` }}
                        title="Click to change avatar"
                      >
                        {player.avatar}
                      </button>

                      {/* Name Input */}
                      <div className="flex-1">
                        <input
                          type="text"
                          value={player.name}
                          onChange={(e) => handleUpdateLocalPlayer(idx, { name: e.target.value })}
                          placeholder={`Player ${idx + 1} Name`}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
                          maxLength={15}
                        />
                      </div>

                      {/* Color Selector */}
                      <div className="flex items-center gap-1 shrink-0">
                        {colorsList.map((c) => {
                          const pCol = COLOR_PALETTE[c];
                          const isSel = player.color === c;
                          return (
                            <button
                              key={`col-${player.id}-${c}`}
                              type="button"
                              onClick={() => handleUpdateLocalPlayer(idx, { color: c })}
                              className={`w-5 h-5 rounded-full border transition cursor-pointer flex items-center justify-center ${
                                isSel ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: pCol.primary }}
                            >
                              {isSel && <span className="text-[9px] text-white font-bold">✓</span>}
                            </button>
                          );
                        })}
                      </div>

                      {/* Delete player button (only if > 2 players) */}
                      {localRoster.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLocalPlayer(player.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                          title="Remove player"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Start Local Match CTA */}
              <button
                type="button"
                onClick={handleStartLocalMatch}
                id="btn-bento-start-local"
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-indigo-500/25 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>START PASS & PLAY ({localRoster.length} PLAYERS)</span>
              </button>
            </div>
          )}

          {/* ================= TAB 3: VS COMPUTER AI ================= */}
          {activeTab === 'vs_computer' && (
            <div className="w-full space-y-3.5 py-1 z-10" id="bento-vs-ai-panel">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Player Count
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[2, 3, 4].map((count) => (
                    <button
                      key={`bento-vsc-${count}`}
                      onClick={() => setVsPlayerCount(count)}
                      className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        vsPlayerCount === count
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700'
                      }`}
                    >
                      {count} Players {count === 2 ? '(1v1)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Your Token Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colorsList.map((color) => {
                    const palette = COLOR_PALETTE[color];
                    const isSelected = vsUserColor === color;
                    return (
                      <button
                        key={`bento-color-${color}`}
                        onClick={() => setVsUserColor(color)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                          isSelected
                            ? 'border-white bg-slate-800 shadow-lg'
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

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  AI Difficulty
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((diff) => (
                    <button
                      key={`bento-diff-${diff}`}
                      onClick={() => setVsDifficulty(diff)}
                      className={`py-1.5 rounded-xl border text-[11px] font-bold capitalize transition cursor-pointer ${
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
                onClick={() => onStartVsComputer(vsPlayerCount, vsUserColor, vsDifficulty)}
                id="btn-bento-start-ai"
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-indigo-500/25 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>LAUNCH MATCH VS AI</span>
              </button>
            </div>
          )}

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* ================= BENTO CELL 3: LOBBY CHAT (Col-Span 3) ================= */}
        <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-xl min-h-[380px]">
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

          <div className="flex-1 p-3.5 space-y-3 overflow-y-auto max-h-[260px] text-xs custom-scrollbar">
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
                className="hover:scale-125 transition-transform cursor-pointer"
              >
                {em}
              </button>
            ))}
          </div>

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
              className="p-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* ================= BENTO BOTTOM ROW: 4 FEATURE TILES (Col-Span 12) ================= */}
        <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Tile 1: Pass & Play */}
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
              <p className="text-[10px] text-slate-400">Add player name on 1 phone</p>
            </div>
          </div>

          {/* Tile 2: Challenge Online User */}
          <div
            onClick={() => {
              setActiveTab('online_multiplayer');
              setOnlineTabSubMode('challenge');
            }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center gap-3.5 hover:border-amber-500/50 hover:bg-slate-850 transition-all cursor-pointer group shadow-lg"
          >
            <div className="w-11 h-11 bg-amber-500/20 rounded-2xl flex items-center justify-center text-xl text-amber-400 group-hover:scale-110 transition-transform shrink-0">
              ⚡
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100 group-hover:text-amber-300 transition-colors">
                Challenge Online Player
              </h4>
              <p className="text-[10px] text-slate-400">Select active champion</p>
            </div>
          </div>

          {/* Tile 3: Invite Contacts */}
          <div
            onClick={() => {
              setActiveTab('online_multiplayer');
              setOnlineTabSubMode('invite');
            }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center gap-3.5 hover:border-cyan-500/50 hover:bg-slate-850 transition-all cursor-pointer group shadow-lg"
          >
            <div className="w-11 h-11 bg-cyan-500/20 rounded-2xl flex items-center justify-center text-xl text-cyan-400 group-hover:scale-110 transition-transform shrink-0">
              📲
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors">
                Send App Invite
              </h4>
              <p className="text-[10px] text-slate-400">WhatsApp / SMS invite link</p>
            </div>
          </div>

          {/* Tile 4: Themes Studio */}
          <div
            onClick={onOpenThemes}
            className="bg-gradient-to-tr from-indigo-950/40 via-slate-900 to-amber-950/40 border border-amber-500/40 rounded-3xl p-4 flex items-center gap-3.5 hover:border-amber-400 hover:bg-slate-850 transition-all cursor-pointer group shadow-lg"
          >
            <div className="w-11 h-11 bg-amber-500/20 rounded-2xl flex items-center justify-center text-xl text-amber-400 group-hover:scale-110 transition-transform shrink-0">
              🎨
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-200 group-hover:text-amber-100 transition-colors">
                Themes & Skins
              </h4>
              <p className="text-[10px] text-slate-400">
                {themeSettings?.boardTheme ? `Theme: ${themeSettings.boardTheme}` : 'Customize boards & dice'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Private Room Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative text-center">
            <button
              onClick={() => setShowRoomModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl"
            >
              <Trash2 className="w-4 h-4 hidden" />
              <span>✕</span>
            </button>

            <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <KeyRound className="w-6 h-6" />
            </div>

            <h3 className="font-black text-white text-base mb-1">Enter Room Code</h3>
            <p className="text-xs text-slate-400 mb-4">Enter 6-digit code from your friend to join</p>

            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g. LUDO99"
              maxLength={8}
              className="w-full text-center tracking-widest font-mono text-lg py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-white uppercase mb-3 focus:outline-none focus:border-indigo-500"
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onCreateOnlineRoom(2);
                  setShowRoomModal(false);
                }}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
              >
                Create Room
              </button>
              <button
                onClick={() => {
                  if (joinCode.trim()) {
                    onJoinOnlineRoom(joinCode.trim());
                    setShowRoomModal(false);
                  }
                }}
                disabled={!joinCode.trim()}
                className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition shadow"
              >
                Join Match
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-8 pt-6 pb-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
          <span className="font-semibold text-slate-300">
            © 2026 Ludo Game &amp; Multiplayer Arena. All rights reserved.
          </span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="text-[11px] text-slate-500">
            Offline Pass &amp; Play • Online Multiplayer
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3">
          {onOpenScreenshots && (
            <button onClick={onOpenScreenshots} className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer">
              Screenshots
            </button>
          )}
          <span className="text-slate-700">•</span>
          {onOpenPrivacyPolicy && (
            <button onClick={onOpenPrivacyPolicy} className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer">
              Privacy Policy
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};
