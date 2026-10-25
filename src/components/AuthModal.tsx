import React, { useState } from 'react';
import { UserProfile } from '../types/ludo';
import { Lock, User, ShieldCheck, X, Mail, Phone, Globe, Users, Trophy, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { loginUser, registerUser } from '../utils/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile, token: string) => void;
  defaultToRegister?: boolean;
}

const AVATAR_OPTIONS = ['👑', '🎲', '🎯', '⚡', '🦁', '🐯', '🐉', '🦅', '🦊', '🤖', '🌟', '🦄', '🥋', '🔥'];

const COUNTRY_OPTIONS = [
  { code: 'GLOBAL', label: 'Global 🌐' },
  { code: 'US', label: 'United States 🇺🇸' },
  { code: 'PK', label: 'Pakistan 🇵🇰' },
  { code: 'IN', label: 'India 🇮🇳' },
  { code: 'GB', label: 'United Kingdom 🇬🇧' },
  { code: 'CA', label: 'Canada 🇨🇦' },
  { code: 'AE', label: 'UAE 🇦🇪' },
  { code: 'SA', label: 'Saudi Arabia 🇸🇦' },
  { code: 'DE', label: 'Germany 🇩🇪' },
  { code: 'FR', label: 'France 🇫🇷' },
  { code: 'BD', label: 'Bangladesh 🇧🇩' },
  { code: 'AU', label: 'Australia 🇦🇺' },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultToRegister = false,
}) => {
  const [isLogin, setIsLogin] = useState(!defaultToRegister);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('Global 🌐');
  const [location, setLocation] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('👑');
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessToast(null);

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError('Please enter a username or player handle');
      return;
    }
    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // Sign In
        const result = await loginUser(cleanUsername, password);
        if (!result.success) {
          setError(result.error || 'Invalid credentials. Please verify username and password.');
        } else if (result.user && result.token) {
          setSuccessToast(`Welcome back, ${result.user.username}!`);
          setTimeout(() => {
            onSuccess(result.user!, result.token!);
            onClose();
          }, 400);
        }
      } else {
        // Register User & IMMEDIATELY sign them in
        const result = await registerUser({
          username: cleanUsername,
          password,
          email: email.trim() || undefined,
          phoneNumber: phoneNumber.trim() || undefined,
          country,
          location: location.trim() || 'Online',
          avatar: selectedAvatar,
        });

        if (!result.success) {
          setError(result.error || 'Registration failed. Try a different username.');
        } else if (result.user && result.token) {
          // Immediately log the user in upon registration!
          setSuccessToast(`Account created! Welcome, ${result.user.username}!`);
          setTimeout(() => {
            onSuccess(result.user!, result.token!);
            onClose();
          }, 500);
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Quick One-Tap Demo Login
  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await loginUser('KingLudo_99', 'password123');
      if (res.success && res.user && res.token) {
        onSuccess(res.user, res.token);
        onClose();
      } else {
        setError('Could not log into demo account.');
      }
    } catch {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto overscroll-contain pt-4 sm:pt-4">
      <div className="w-[calc(100vw-20px)] max-w-md mx-auto my-auto bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative max-h-[88vh] flex flex-col overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-4 shrink-0">
          <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white">
            {isLogin ? 'Player Sign In' : 'Create Player Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {isLogin
              ? 'Log in to track your Elo rating, friend rooms, and match history.'
              : 'Register your player name to start challenging friends & climbing rankings.'}
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl mb-4 border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
              !isLogin ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Register Account</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
              isLogin ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        </div>

        {/* Success Alert */}
        {successToast && (
          <div className="mb-3 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-3 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium text-center shrink-0">
            {error}
          </div>
        )}

        {/* Form Body - Scrollable on mobile */}
        <form onSubmit={handleSubmit} className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
          
          {/* Avatar Selector (Registration Only) */}
          {!isLogin && (
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Choose Your Avatar
              </label>
              <div className="grid grid-cols-7 gap-1.5 p-2 bg-slate-950 rounded-2xl border border-slate-800">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={`av-pick-${av}`}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`text-lg p-1 rounded-xl transition cursor-pointer flex items-center justify-center ${
                      selectedAvatar === av
                        ? 'bg-indigo-600 scale-110 shadow-lg'
                        : 'hover:bg-slate-800'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Player Username */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
              {isLogin ? 'Username, Email, or Phone' : 'Player Name / Username *'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isLogin ? 'e.g. MasterDice or email' : 'e.g. Hammad_King'}
                className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                minLength={2}
                maxLength={25}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
              Password * (Min 4 chars)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                minLength={4}
              />
            </div>
          </div>

          {/* Registration Optional Fields */}
          {!isLogin && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Email (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="player@example.com"
                      className="w-full pl-9 pr-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Phone (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 555-0100"
                      className="w-full pl-9 pr-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Country / Region
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full pl-9 pr-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {COUNTRY_OPTIONS.map((c) => (
                      <option key={c.code} value={c.label}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Ranking Rule Notice */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[10px] text-slate-400">
            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Elo rating system: Win games to earn 1200+ Elo and reach Grandmaster!</span>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            id="btn-auth-submit"
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm shadow-xl transition active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <span>Please wait...</span>
            ) : isLogin ? (
              <>
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Create Account & Start Playing</span>
                <Sparkles className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Quick Demo Login */}
        <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Testing or demo?</span>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={isLoading}
            className="text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
          >
            One-Tap Demo Login
          </button>
        </div>
      </div>
    </div>
  );
};
