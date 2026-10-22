import React from 'react';
import { UserProfile } from '../types/ludo';
import { getRankTier } from '../utils/ludoConstants';
import {
  Trophy,
  Volume2,
  VolumeX,
  Bell,
  BellRing,
  BookOpen,
  User,
  LogIn,
  Home,
  Crown,
  Sparkles,
  Users,
  Gamepad2,
  Palette,
  Smartphone,
  ShieldCheck,
  Trash2,
  Database,
  ShieldAlert,
} from 'lucide-react';

interface HeaderNavProps {
  currentScreen: 'lobby' | 'game' | 'waiting_room' | 'leaderboard' | 'profile' | 'privacy' | 'delete-account' | 'data-safety';
  onNavigate: (screen: 'lobby' | 'game' | 'leaderboard' | 'profile' | 'privacy' | 'delete-account' | 'data-safety') => void;
  user: UserProfile | null;
  hasActiveGame?: boolean;
  onReturnToGame?: () => void;
  onOpenContacts?: () => void;
  onOpenThemes?: () => void;
  onOpenScreenshots?: () => void;
  onOpenPrivacyPolicy?: () => void;
  onOpenDeleteAccount?: () => void;
  onOpenDataSafety?: () => void;
  onOpenAuth: () => void;
  onOpenRules: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  hasNotificationPermission: boolean;
  onRequestNotifications: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentScreen,
  onNavigate,
  user,
  hasActiveGame = false,
  onReturnToGame,
  onOpenContacts,
  onOpenThemes,
  onOpenScreenshots,
  onOpenPrivacyPolicy,
  onOpenDeleteAccount,
  onOpenDataSafety,
  onOpenAuth,
  onOpenRules,
  isMuted,
  onToggleMute,
  hasNotificationPermission,
  onRequestNotifications,
}) => {
  const tier = user ? getRankTier(user.stats.eloRating) : null;

  return (
    <header className="w-full bg-slate-900/60 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <button
          onClick={() => onNavigate('lobby')}
          className="flex items-center gap-3 text-left cursor-pointer group"
          id="btn-nav-home"
        >
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-500 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
            🎲
          </div>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg text-white tracking-tight leading-none flex items-center gap-1">
              LUDO<span className="text-indigo-400 font-black">PREMIER</span>
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Championship Arena
              </span>
            </div>
          </div>
        </button>

        {/* Center Nav Screen Switcher (Bento Tab Pill) */}
        <div className="flex items-center gap-2">
          {hasActiveGame && currentScreen !== 'game' && (
            <button
              onClick={() => onReturnToGame ? onReturnToGame() : onNavigate('game')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-bold text-xs flex items-center gap-1.5 animate-pulse cursor-pointer shadow-lg shadow-amber-500/20"
              title="Return to your active game in progress"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Resume Game</span>
            </button>
          )}

          <nav className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 shadow-inner">
            <button
              onClick={() => onNavigate('lobby')}
              id="nav-tab-play"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentScreen === 'lobby' || currentScreen === 'game' || currentScreen === 'waiting_room'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Play</span>
            </button>

            <button
              onClick={() => onNavigate('leaderboard')}
              id="nav-tab-rankings"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentScreen === 'leaderboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Leaderboard</span>
            </button>

            <button
              onClick={() => onNavigate('profile')}
              id="nav-tab-stats"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentScreen === 'profile'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Career</span>
            </button>
          </nav>
        </div>

        {/* Right Tools & User Profile */}
        <div className="flex items-center gap-2">
          {/* Contacts / Friends Button */}
          {onOpenContacts && (
            <button
              onClick={onOpenContacts}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition cursor-pointer relative"
              title="Player Contacts & Online Friends"
              id="btn-nav-contacts"
            >
              <Users className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse" />
            </button>
          )}

          {/* Themes & Skins Studio Button */}
          {onOpenThemes && (
            <button
              onClick={onOpenThemes}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition cursor-pointer relative"
              title="Themes & Skins Studio"
              id="btn-open-themes"
            >
              <Palette className="w-4 h-4 text-amber-400" />
            </button>
          )}

          {/* Phone Screenshots & Store Assets Button */}
          {onOpenScreenshots && (
            <button
              onClick={onOpenScreenshots}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition cursor-pointer relative"
              title="Phone Screenshots & Store Preview"
              id="btn-open-screenshots"
            >
              <Smartphone className="w-4 h-4 text-indigo-400" />
            </button>
          )}

          {/* Privacy Policy Button */}
          {onOpenPrivacyPolicy && (
            <button
              onClick={onOpenPrivacyPolicy}
              className={`p-2.5 rounded-xl border transition cursor-pointer relative ${
                currentScreen === 'privacy'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
              }`}
              title="Privacy Policy & Terms"
              id="btn-open-privacy"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </button>
          )}

          {/* Data Safety Disclosure Button */}
          {onOpenDataSafety && (
            <button
              onClick={onOpenDataSafety}
              className={`p-2.5 rounded-xl border transition cursor-pointer relative ${
                currentScreen === 'data-safety'
                  ? 'bg-cyan-600 text-white border-cyan-500 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-800'
              }`}
              title="Google Play Data Safety Disclosure"
              id="btn-open-data-safety"
            >
              <Database className="w-4 h-4 text-cyan-400" />
            </button>
          )}

          {/* Delete Account & Data Button */}
          {onOpenDeleteAccount && (
            <button
              onClick={onOpenDeleteAccount}
              className={`p-2.5 rounded-xl border transition cursor-pointer relative ${
                currentScreen === 'delete-account'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-800'
              }`}
              title="Delete Account & Purge Data (Google Play Requirement)"
              id="btn-open-delete-account"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
            </button>
          )}

          {/* Rules button */}
          <button
            onClick={onOpenRules}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
            title="How to Play / Championship Rules"
            id="btn-open-rules"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
            title={isMuted ? 'Unmute Game Sounds' : 'Mute Sounds'}
            id="btn-toggle-sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Turn Push Notifications */}
          <button
            onClick={onRequestNotifications}
            className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 transition cursor-pointer ${
              hasNotificationPermission
                ? 'text-emerald-400 border-emerald-500/30 hover:bg-slate-800'
                : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800'
            }`}
            title={
              hasNotificationPermission
                ? 'Turn Notifications Enabled'
                : 'Enable Turn Push Notifications'
            }
            id="btn-toggle-notif"
          >
            {hasNotificationPermission ? (
              <BellRing className="w-4 h-4" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
          </button>

          {/* User Sign In / Profile Badge */}
          {user ? (
            <button
              onClick={() => onNavigate('profile')}
              id="btn-user-profile-badge"
              className="flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-2xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 transition cursor-pointer group shadow-sm"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 p-0.5 transition-transform group-hover:scale-105"
                style={{ borderColor: tier?.color || '#6366f1' }}
              >
                <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center">
                  <span>{user.avatar}</span>
                </div>
              </div>
              <div className="text-left hidden xs:block">
                <span className="block font-bold text-xs text-slate-100 max-w-[90px] truncate leading-tight">
                  {user.username}
                </span>
                <span
                  className="block text-[10px] font-mono font-semibold"
                  style={{ color: tier?.color || '#818cf8' }}
                >
                  {user.stats.eloRating} Elo
                </span>
              </div>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              id="btn-nav-signin"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition active:scale-95 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

