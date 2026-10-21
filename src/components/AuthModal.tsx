import React, { useState } from 'react';
import { UserProfile } from '../types/ludo';
import { Lock, User, ShieldCheck, X, Mail, Phone, Globe, Users, Trophy } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile, token: string) => void;
}

const AVATAR_OPTIONS = ['👑', '🎲', '🎯', '⚡', '🦁', '🐯', '🐉', '🦅', '🦊', '🤖', '🧙', '🌟', '🦄', '🥋'];

const COUNTRY_OPTIONS = [
  { code: 'US', label: 'United States 🇺🇸' },
  { code: 'IN', label: 'India 🇮🇳' },
  { code: 'GB', label: 'United Kingdom 🇬🇧' },
  { code: 'CA', label: 'Canada 🇨🇦' },
  { code: 'DE', label: 'Germany 🇩🇪' },
  { code: 'FR', label: 'France 🇫🇷' },
  { code: 'BR', label: 'Brazil 🇧🇷' },
  { code: 'NG', label: 'Nigeria 🇳🇬' },
  { code: 'PK', label: 'Pakistan 🇵🇰' },
  { code: 'BD', label: 'Bangladesh 🇧🇩' },
  { code: 'AU', label: 'Australia 🇦🇺' },
  { code: 'GLOBAL', label: 'Global 🌐' },
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('Global 🌐');
  const [location, setLocation] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamTag, setTeamTag] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('👑');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin
      ? { username, password }
      : {
          username,
          password,
          email: email.trim(),
          phoneNumber: phoneNumber.trim(),
          country,
          location: location.trim() || 'Online',
          avatar: selectedAvatar,
          teamName: teamName.trim() || undefined,
          teamTag: teamTag.trim() || undefined,
        };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onSuccess(data.user, data.token);
      onClose();
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 mx-auto mb-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-white">
            {isLogin ? 'Player Sign In' : 'Create Player Account & Team'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isLogin
              ? 'Sign in with your username, email, or phone number to access ranked matches & teams.'
              : 'Register your official profile, join or create online teams, and compete on global leaderboards.'}
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl mb-5 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              isLogin ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              !isLogin ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register & Build Team
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium text-center">
              {error}
            </div>
          )}

          {/* Avatar Selector for registration */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Choose Player Avatar
              </label>
              <div className="grid grid-cols-7 gap-1.5 p-2 bg-slate-950 rounded-2xl border border-slate-800">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={`av-pick-${av}`}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`text-xl p-1 rounded-xl transition ${
                      selectedAvatar === av
                        ? 'bg-indigo-600 scale-110 shadow'
                        : 'hover:bg-slate-800'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Username / Identifier */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              {isLogin ? 'Username, Email, or Phone' : 'Player Handle / Username'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isLogin ? 'Enter username, email, or phone...' : 'e.g. MasterDice99'}
                className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                minLength={3}
              />
            </div>
          </div>

          {/* Email (Registration) */}
          {!isLogin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="player@example.com"
                    className="w-full pl-10 pr-3 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-10 pr-3 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Country & Location (Registration) */}
          {!isLogin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Country / Region
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {COUNTRY_OPTIONS.map((c) => (
                      <option key={c.code} value={c.label}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  City / State
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. New York / Online"
                  className="w-full px-3 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Online Team Creation (Optional during Registration) */}
          {!isLogin && (
            <div className="p-3 bg-slate-950/60 rounded-2xl border border-indigo-950/60">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 mb-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Build Online Team / Squad (Optional)</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Team Name (e.g. Apex Titans)"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={teamTag}
                    onChange={(e) => setTeamTag(e.target.value.toUpperCase())}
                    placeholder="Tag (e.g. APEX)"
                    maxLength={5}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-center uppercase"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Password (Protected with Salt Hash)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                minLength={6}
              />
            </div>
          </div>

          {/* Ranking Rule Notice */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Real Elo ranking active: Victory awards +22–32 pts. Forfeiting causes a heavy penalty (-35–45 pts), while disconnects suffer reduced penalty (-10–14 pts).
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            id="btn-auth-submit"
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl transition active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : isLogin ? (
              <span>Sign In to Account</span>
            ) : (
              <span>Create Account & Start Playing</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
