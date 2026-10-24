import React, { useState } from 'react';
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
  Users,
  Gamepad2,
  Palette,
  Smartphone,
  ShieldCheck,
  Trash2,
  Database,
  Menu,
  X,
  UserPlus,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const tier = user ? getRankTier(user.stats.eloRating) : null;

  return (
    <header className="w-full bg-slate-900/90 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <button
          onClick={() => {
            onNavigate('lobby');
            setIsMobileMenuOpen(false);
          }}
          className="flex items-center gap-2 sm:gap-3 text-left cursor-pointer group shrink-0"
          id="btn-nav-home"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-500 rounded-xl flex items-center justify-center font-black text-lg sm:text-xl text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
            🎲
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-lg text-white tracking-tight leading-none flex items-center gap-1">
              LUDO<span className="text-indigo-400 font-black">PREMIER</span>
            </h1>
            <div className="hidden xs:flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Arena
              </span>
            </div>
          </div>
        </button>

        {/* Center Nav Screen Switcher */}
        <div className="flex items-center gap-1 sm:gap-2">
          {hasActiveGame && currentScreen !== 'game' && (
            <button
              onClick={() => {
                if (onReturnToGame) onReturnToGame();
                else onNavigate('game');
                setIsMobileMenuOpen(false);
              }}
              className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-bold text-xs flex items-center gap-1 animate-pulse cursor-pointer shadow-lg shadow-amber-500/20"
              title="Return to your active game in progress"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Resume</span>
            </button>
          )}

          <nav className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800 shadow-inner">
            <button
              onClick={() => {
                onNavigate('lobby');
                setIsMobileMenuOpen(false);
              }}
              id="nav-tab-play"
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                currentScreen === 'lobby' || currentScreen === 'game' || currentScreen === 'waiting_room'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Play</span>
            </button>

            <button
              onClick={() => {
                onNavigate('leaderboard');
                setIsMobileMenuOpen(false);
              }}
              id="nav-tab-rankings"
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                currentScreen === 'leaderboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ranks</span>
            </button>

            <button
              onClick={() => {
                onNavigate('profile');
                setIsMobileMenuOpen(false);
              }}
              id="nav-tab-stats"
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                currentScreen === 'profile'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Profile</span>
            </button>
          </nav>
        </div>

        {/* Right Tools & User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Desktop-only Quick Icons */}
          <div className="hidden lg:flex items-center gap-1.5">
            {/* Contacts / Friends Button */}
            {onOpenContacts && (
              <button
                onClick={onOpenContacts}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition cursor-pointer relative"
                title="Player Contacts & Online Friends"
                id="btn-nav-contacts"
              >
                <Users className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse" />
              </button>
            )}

            {/* Themes Button */}
            {onOpenThemes && (
              <button
                onClick={onOpenThemes}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition cursor-pointer"
                title="Themes & Skins Studio"
              >
                <Palette className="w-4 h-4 text-amber-400" />
              </button>
            )}

            {/* Sound Mute Toggle */}
            <button
              onClick={onToggleMute}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
              title={isMuted ? 'Unmute Game Sounds' : 'Mute Sounds'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
            </button>

            {/* Notifications Toggle */}
            <button
              onClick={onRequestNotifications}
              className={`p-2 rounded-xl bg-slate-900 border border-slate-800 transition cursor-pointer ${
                hasNotificationPermission ? 'text-emerald-400 border-emerald-500/30' : 'text-slate-400'
              }`}
              title="Turn Push Notifications"
            >
              {hasNotificationPermission ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            </button>

            {/* Rules */}
            <button
              onClick={onOpenRules}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
              title="Championship Rules"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>

          {/* PRIMARY ACCOUNT / SIGN IN BUTTON - ALWAYS VISIBLE ON MOBILE & DESKTOP */}
          {user ? (
            <button
              onClick={() => {
                onNavigate('profile');
                setIsMobileMenuOpen(false);
              }}
              id="btn-user-profile-badge"
              className="flex items-center gap-2 pl-1.5 pr-2.5 sm:pr-3 py-1 sm:py-1.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition cursor-pointer group shadow-sm shrink-0"
            >
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm border-2 transition-transform group-hover:scale-105"
                style={{ borderColor: tier?.color || '#6366f1' }}
              >
                <span>{user.avatar}</span>
              </div>
              <div className="text-left hidden xs:block">
                <span className="block font-bold text-xs text-slate-100 max-w-[80px] sm:max-w-[100px] truncate leading-tight">
                  {user.username}
                </span>
                <span
                  className="block text-[9px] sm:text-[10px] font-mono font-semibold"
                  style={{ color: tier?.color || '#818cf8' }}
                >
                  {user.stats.eloRating} Elo
                </span>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => {
                  onOpenAuth();
                  setIsMobileMenuOpen(false);
                }}
                id="btn-nav-signin"
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition active:scale-95 cursor-pointer shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer lg:hidden shrink-0"
            title="More Options"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-indigo-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER / ACTION SHEET */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/98 border-b border-slate-800 px-4 py-4 space-y-3 animate-fadeIn backdrop-blur-xl">
          {/* If not logged in, extra registration CTA inside mobile drawer */}
          {!user && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border border-indigo-500/40 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-xs">New to Ludo Arena?</h4>
                <p className="text-[10px] text-indigo-200">Register in seconds to rank up!</p>
              </div>
              <button
                onClick={() => {
                  onOpenAuth();
                  setIsMobileMenuOpen(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow cursor-pointer flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs">
            {onOpenContacts && (
              <button
                onClick={() => {
                  onOpenContacts();
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer font-semibold"
              >
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Friends & Contacts</span>
              </button>
            )}

            {onOpenThemes && (
              <button
                onClick={() => {
                  onOpenThemes();
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer font-semibold"
              >
                <Palette className="w-4 h-4 text-amber-400" />
                <span>Themes & Skins</span>
              </button>
            )}

            <button
              onClick={() => {
                onToggleMute();
              }}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer font-semibold"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              <span>{isMuted ? 'Unmute Sound' : 'Mute Sound'}</span>
            </button>

            <button
              onClick={() => {
                onRequestNotifications();
              }}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer font-semibold"
            >
              {hasNotificationPermission ? <BellRing className="w-4 h-4 text-emerald-400" /> : <Bell className="w-4 h-4 text-slate-400" />}
              <span>Turn Notifications</span>
            </button>

            <button
              onClick={() => {
                onOpenRules();
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer font-semibold"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>How to Play / Rules</span>
            </button>

            {onOpenScreenshots && (
              <button
                onClick={() => {
                  onOpenScreenshots();
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer font-semibold"
              >
                <Smartphone className="w-4 h-4 text-indigo-400" />
                <span>Store Screenshots</span>
              </button>
            )}

            {onOpenPrivacyPolicy && (
              <button
                onClick={() => {
                  onOpenPrivacyPolicy();
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer font-semibold"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Privacy Policy</span>
              </button>
            )}

            {onOpenDataSafety && (
              <button
                onClick={() => {
                  onOpenDataSafety();
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer font-semibold"
              >
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Data Safety</span>
              </button>
            )}

            {onOpenDeleteAccount && (
              <button
                onClick={() => {
                  onOpenDeleteAccount();
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-rose-300 hover:bg-slate-800 flex items-center gap-2 cursor-pointer font-semibold col-span-2"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Delete Account & Erase Data</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
