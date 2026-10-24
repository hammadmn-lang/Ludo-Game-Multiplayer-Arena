import React, { useState } from 'react';
import { UserProfile, TeamInfo } from '../types/ludo';
import { getRankTier, RANK_TIERS, COLOR_PALETTE } from '../utils/ludoConstants';
import {
  Trophy,
  Award,
  Zap,
  Target,
  Flame,
  Clock,
  Shield,
  CheckCircle2,
  Calendar,
  History,
  Globe,
  MapPin,
  Phone,
  Mail,
  Edit3,
  Users,
  Check,
  X,
  UserX,
  VolumeX,
  PlusCircle,
  LogOut,
  AlertTriangle,
  WifiOff,
  Palette,
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import { ThemeSettings } from '../types/theme';
import { getBoardTheme, getTokenSkin, getDiceSkin } from '../utils/themeData';

interface ProfileViewProps {
  user: UserProfile | null;
  authToken?: string | null;
  onOpenAuth: () => void;
  onUpdateUser?: (updated: UserProfile) => void;
  onOpenContacts?: () => void;
  onOpenThemes?: () => void;
  themeSettings?: ThemeSettings;
  onDeleteAccount?: () => Promise<void> | void;
  onClearLocalData?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  authToken,
  onOpenAuth,
  onUpdateUser,
  onOpenContacts,
  onOpenThemes,
  themeSettings,
  onDeleteAccount,
  onClearLocalData,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || '🦁');
  const [editCountry, setEditCountry] = useState(user?.country || 'United States 🇺🇸');
  const [editLocation, setEditLocation] = useState(user?.location || 'New York, NY');
  const [editPhone, setEditPhone] = useState(user?.phoneNumber || '+1 (555) 019-2834');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Team management state
  const [isManagingTeam, setIsManagingTeam] = useState(false);
  const [teamAction, setTeamAction] = useState<'create' | 'join'>('create');
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamTag, setNewTeamTag] = useState('');
  const [teamError, setTeamError] = useState<string | null>(null);
  const [isTeamLoading, setIsTeamLoading] = useState(false);

  // Data & Account Deletion state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [clearDataMessage, setClearDataMessage] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (onDeleteAccount) {
        await onDeleteAccount();
      }
    } catch (err) {
      console.error('Account deletion error:', err);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleClearLocal = () => {
    if (onClearLocalData) {
      onClearLocalData();
      setClearDataMessage('Local storage cache, offline saves, and settings cleared.');
      setTimeout(() => setClearDataMessage(null), 3500);
    }
  };

  const availableAvatars = ['🦁', '🐯', '🐉', '🦅', '👑', '🌟', '⚡', '🎯', '🔥', '🎲', '🌸', '🦊', '🐺', '🚀'];

  const popularCountries = [
    'United States 🇺🇸',
    'United Kingdom 🇬🇧',
    'India 🇮🇳',
    'Pakistan 🇵🇰',
    'Canada 🇨🇦',
    'United Arab Emirates 🇦🇪',
    'Australia 🇦🇺',
    'Germany 🇩🇪',
    'Saudi Arabia 🇸🇦',
    'Bangladesh 🇧🇩',
    'Global 🌐',
  ];

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl">
          🎲
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Guest Player Profile</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          Sign in or create an account with email and phone to record ranking history, build online teams, and climb the real Elo ladder.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl transition active:scale-95 cursor-pointer"
        >
          Sign In or Register
        </button>
      </div>
    );
  }

  const currentTier = getRankTier(user.stats.eloRating);
  const nextTierIndex = RANK_TIERS.findIndex((t) => t.name === currentTier.name) + 1;
  const nextTier = nextTierIndex < RANK_TIERS.length ? RANK_TIERS[nextTierIndex] : null;

  // Calculate progress % to next rank
  let tierProgress = 100;
  if (nextTier) {
    const range = nextTier.minElo - currentTier.minElo;
    const currentProgress = user.stats.eloRating - currentTier.minElo;
    tierProgress = Math.min(100, Math.max(0, Math.round((currentProgress / range) * 100)));
  }

  const winRate =
    user.stats.totalMatches > 0
      ? Math.round((user.stats.wins / user.stats.totalMatches) * 100)
      : 0;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;

    setIsSaving(true);
    try {
      let updatedUser: UserProfile | null = null;
      try {
        const res = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            username: editUsername,
            email: editEmail,
            avatar: editAvatar,
            country: editCountry,
            location: editLocation,
            phoneNumber: editPhone,
          }),
        });
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (data.user) updatedUser = data.user;
        }
      } catch {}

      if (!updatedUser && user) {
        updatedUser = {
          ...user,
          username: editUsername.trim() || user.username,
          email: editEmail.trim() || user.email,
          avatar: editAvatar || user.avatar,
          country: editCountry || user.country,
          location: editLocation.trim() || user.location,
          phoneNumber: editPhone.trim() || user.phoneNumber,
        };
      }

      if (updatedUser) {
        if (onUpdateUser) onUpdateUser(updatedUser);
        localStorage.setItem('ludo_user', JSON.stringify(updatedUser));
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          setIsEditing(false);
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTeamAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;
    setTeamError(null);
    setIsTeamLoading(true);

    try {
      const res = await fetch('/api/teams/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          action: teamAction,
          name: newTeamName,
          tag: newTeamTag,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update team');
      }

      if (data.user && onUpdateUser) {
        onUpdateUser(data.user);
      }
      setIsManagingTeam(false);
      setNewTeamName('');
      setNewTeamTag('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setTeamError(err.message);
      } else {
        setTeamError('Error updating team');
      }
    } finally {
      setIsTeamLoading(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!authToken) return;
    if (!confirm('Are you sure you want to leave your team?')) return;
    setIsTeamLoading(true);

    try {
      const res = await fetch('/api/teams/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ action: 'leave' }),
      });

      const data = await res.json();
      if (data.user && onUpdateUser) {
        onUpdateUser(data.user);
      }
    } catch (err) {
      console.error('Error leaving team:', err);
    } finally {
      setIsTeamLoading(false);
    }
  };

  const handleUnblockUser = async (targetId: string) => {
    if (!authToken) return;
    try {
      const res = await fetch('/api/users/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ targetUserId: targetId }),
      });
      const data = await res.json();
      if (data.success && onUpdateUser && user) {
        onUpdateUser({ ...user, blockedUsers: data.blockedUsers });
      }
    } catch (err) {
      console.error('Error unblocking user:', err);
    }
  };

  const handleUnmuteUser = async (targetId: string) => {
    if (!authToken) return;
    try {
      const res = await fetch('/api/users/mute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ targetUserId: targetId }),
      });
      const data = await res.json();
      if (data.success && onUpdateUser && user) {
        onUpdateUser({ ...user, mutedUsers: data.mutedUsers });
      }
    } catch (err) {
      console.error('Error unmuting user:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fadeIn" id="player-profile-view">
      {/* Profile Header Banner Bento Card */}
      <div className="relative p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Glow */}
        <div
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: currentTier.color }}
        />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl border-2 shrink-0"
            style={{
              backgroundColor: '#0f172a',
              borderColor: currentTier.color,
            }}
          >
            <span>{user.avatar}</span>
          </div>

          <div className="flex-1 text-center sm:text-left w-full">
            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 mb-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-white">{user.username}</h1>
                <span
                  className="px-3 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 border"
                  style={{
                    backgroundColor: `${currentTier.color}20`,
                    color: currentTier.color,
                    borderColor: `${currentTier.color}40`,
                  }}
                >
                  <span>{currentTier.badge}</span>
                  <span>{currentTier.name} Division</span>
                </span>

                {user.team && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center gap-1">
                    <span>{user.team.avatar || '🛡️'}</span>
                    <span>[{user.team.tag}] {user.team.name}</span>
                    <span className="text-[10px] text-indigo-400 capitalize">({user.team.role})</span>
                  </span>
                )}
              </div>

              {/* Action Buttons: Edit Profile & Contacts */}
              <div className="flex items-center gap-2">
                {onOpenContacts && (
                  <button
                    onClick={onOpenContacts}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Contacts ({user.contacts?.length || 0})</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setEditUsername(user.username);
                    setEditEmail(user.email || '');
                    setEditAvatar(user.avatar);
                    setEditCountry(user.country || 'United States 🇺🇸');
                    setEditLocation(user.location || 'New York, NY');
                    setEditPhone(user.phoneNumber || '');
                    setIsEditing(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-xs font-bold text-indigo-300 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>

            {/* Email, Phone, Country, Location Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 my-2.5">
              {user.email && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>{user.email}</span>
                </span>
              )}

              {user.phoneNumber && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300 font-mono">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>{user.phoneNumber}</span>
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>{user.country || 'Global 🌐'}</span>
              </span>

              {user.location && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{user.location}</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>

            {/* Elo Rating Progress Bar */}
            <div className="space-y-2 max-w-md">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white font-black flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  {user.stats.eloRating} Elo Rating
                </span>
                {nextTier && (
                  <span className="text-slate-400">
                    Next: {nextTier.badge} {nextTier.name} ({nextTier.minElo} Elo)
                  </span>
                )}
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{
                    width: `${tierProgress}%`,
                    backgroundColor: currentTier.color,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Online Team Management Bento Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base text-white">Online Team & Clan</h3>
          </div>
          {user.team ? (
            <button
              onClick={handleLeaveTeam}
              disabled={isTeamLoading}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-bold text-rose-300 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Leave Team</span>
            </button>
          ) : (
            <button
              onClick={() => setIsManagingTeam(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Build / Join Team</span>
            </button>
          )}
        </div>

        {user.team ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800/80">
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-bold">Team Name</div>
              <div className="text-base font-black text-white flex items-center gap-1.5 mt-0.5">
                <span>{user.team.avatar || '🛡️'}</span>
                <span>{user.team.name}</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-bold">Team Tag / Code</div>
              <div className="text-base font-mono font-bold text-indigo-400 mt-0.5">[{user.team.tag}]</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-bold">Role & Squad Size</div>
              <div className="text-sm font-semibold text-slate-200 mt-0.5 capitalize">
                {user.team.role} • {user.team.memberCount || 1} Member(s)
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            You are not part of an online team yet. Create a new team with a custom tag or join friends using their squad tag to build a dominating clan!
          </p>
        )}
      </div>

      {/* Team Modal Dialog */}
      {isManagingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base text-white">
                  {teamAction === 'create' ? 'Create Online Team' : 'Join Existing Team'}
                </h3>
              </div>
              <button
                onClick={() => setIsManagingTeam(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Toggle Create / Join */}
            <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setTeamAction('create');
                  setTeamError(null);
                }}
                className={`py-1.5 rounded-lg transition ${
                  teamAction === 'create' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Create New Team
              </button>
              <button
                type="button"
                onClick={() => {
                  setTeamAction('join');
                  setTeamError(null);
                }}
                className={`py-1.5 rounded-lg transition ${
                  teamAction === 'join' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Join with Tag/Name
              </button>
            </div>

            {teamError && (
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs text-center font-medium">
                {teamError}
              </div>
            )}

            <form onSubmit={handleTeamAction} className="space-y-3.5">
              {teamAction === 'create' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Team / Clan Name</label>
                    <input
                      type="text"
                      required
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="e.g. Royal Knights"
                      minLength={3}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Team Tag (Max 5 letters)</label>
                    <input
                      type="text"
                      required
                      value={newTeamTag}
                      onChange={(e) => setNewTeamTag(e.target.value.toUpperCase())}
                      placeholder="e.g. ROYL"
                      maxLength={5}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 uppercase font-mono"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Enter Team Tag or Clan Name</label>
                  <input
                    type="text"
                    required
                    value={newTeamTag}
                    onChange={(e) => setNewTeamTag(e.target.value.toUpperCase())}
                    placeholder="e.g. APEX or Apex Titans"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 uppercase font-mono"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManagingTeam(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTeamLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg transition cursor-pointer disabled:opacity-50"
                >
                  {isTeamLoading ? 'Saving...' : teamAction === 'create' ? 'Create Team' : 'Join Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal Dialog */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base text-white">Edit Profile Details</h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Avatar Emoji</label>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-slate-950 rounded-2xl border border-slate-800">
                  {availableAvatars.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setEditAvatar(av)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl cursor-pointer transition ${
                        editAvatar === av
                          ? 'bg-indigo-600 border-2 border-indigo-400 shadow'
                          : 'bg-slate-900 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Player Username</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                  minLength={3}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="player@example.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Country / Region</label>
                <select
                  value={editCountry}
                  onChange={(e) => setEditCountry(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {popularCountries.map((c) => (
                    <option key={c} value={c} className="bg-slate-900 text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">City / Location</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="e.g. New York, London, Toronto, Dubai"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Phone Number (For Contacts & Friend Search)
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g. +1 555-0199 or +92 300 1234567"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Saved!</span>
                    </>
                  ) : isSaving ? (
                    <span>Saving...</span>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Moderation Lists: Blocked & Muted Users */}
      {((user.blockedUsers && user.blockedUsers.length > 0) || (user.mutedUsers && user.mutedUsers.length > 0)) && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <span>Chat Moderation & Privacy</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user.blockedUsers && user.blockedUsers.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 mb-2">
                  <UserX className="w-4 h-4" />
                  <span>Blocked Players ({user.blockedUsers.length})</span>
                </div>
                <div className="space-y-1.5">
                  {user.blockedUsers.map((bId) => (
                    <div key={bId} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-900">
                      <span className="font-mono text-slate-300">{bId}</span>
                      <button
                        onClick={() => handleUnblockUser(bId)}
                        className="text-xs text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {user.mutedUsers && user.mutedUsers.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-2">
                  <VolumeX className="w-4 h-4" />
                  <span>Muted Players ({user.mutedUsers.length})</span>
                </div>
                <div className="space-y-1.5">
                  {user.mutedUsers.map((mId) => (
                    <div key={mId} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-900">
                      <span className="font-mono text-slate-300">{mId}</span>
                      <button
                        onClick={() => handleUnmuteUser(mId)}
                        className="text-xs text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
                      >
                        Unmute
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Arena Loadout & Customization Card */}
      {themeSettings && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-base text-white">Championship Arena Loadout</h3>
            </div>
            {onOpenThemes && (
              <button
                onClick={onOpenThemes}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold text-amber-300 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Customize Themes</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Board Theme</span>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  {getBoardTheme(themeSettings.boardTheme).name}
                </h4>
                <p className="text-[11px] text-amber-400">
                  {getBoardTheme(themeSettings.boardTheme).tagline}
                </p>
              </div>
              <div className="text-xl">
                {getBoardTheme(themeSettings.boardTheme).safeCellSymbol}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Token Skin</span>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  {getTokenSkin(themeSettings.tokenSkin).name}
                </h4>
                <p className="text-[11px] text-indigo-400">
                  {getTokenSkin(themeSettings.tokenSkin).tagline}
                </p>
              </div>
              <div className="text-xl">
                {getTokenSkin(themeSettings.tokenSkin).previewIcon}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Dice Skin</span>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  {getDiceSkin(themeSettings.diceSkin).name}
                </h4>
                <p className="text-[11px] text-emerald-400">
                  {getDiceSkin(themeSettings.diceSkin).tagline}
                </p>
              </div>
              <div className="text-xl">
                {getDiceSkin(themeSettings.diceSkin).previewIcon}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Career Statistics Bento Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1.5 font-bold uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Victories</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{user.stats.wins}</div>
          <span className="text-[11px] text-slate-500">{user.stats.totalMatches} matches</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1.5 font-bold uppercase tracking-wider">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Win Rate</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">{winRate}%</div>
          <span className="text-[11px] text-slate-500">{user.stats.losses} defeats</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1.5 font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Win Streak</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-orange-400">{user.stats.winStreak}</div>
          <span className="text-[11px] text-slate-500">Best: {user.stats.bestWinStreak} in a row</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1.5 font-bold uppercase tracking-wider">
            <Shield className="w-4 h-4 text-blue-400" />
            <span>Captured</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-400">{user.stats.tokensCaptured}</div>
          <span className="text-[11px] text-slate-500">{user.stats.tokensLost} tokens lost</span>
        </div>
      </div>

      {/* Historical Match Records Bento Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">Historical Match Record</h3>
          </div>
          <span className="text-xs text-slate-400">
            Showing last {user.matches.length} matches
          </span>
        </div>

        {user.matches.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">
            <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>No matches recorded yet. Jump into a game to start logging history!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {user.matches.map((m) => {
              const isWin = m.rank === 1;
              const isForfeit = m.status === 'forfeited';
              const isDisconnect = m.status === 'disconnected';

              const modeLabel =
                m.mode === 'vs_computer'
                  ? '🤖 VS Computer'
                  : m.mode === 'local_multiplayer'
                  ? '👥 Local Pass & Play'
                  : '🌐 Online Matchmaking';

              return (
                <div key={m.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isWin
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : isForfeit
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                          : isDisconnect
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                          : m.rank === 2
                          ? 'bg-slate-800 text-slate-300 border border-slate-700'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isWin ? '1st' : isForfeit ? 'Abandon' : isDisconnect ? 'Disc' : `${m.rank}th`}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{modeLabel}</span>
                        <span className="text-[11px] text-slate-400 capitalize">
                          ({m.playerColor} player)
                        </span>

                        {isForfeit && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Forfeited (-35+ penalty)
                          </span>
                        )}

                        {isDisconnect && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1">
                            <WifiOff className="w-3 h-3" />
                            Disconnected (Reduced penalty)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(m.date).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{m.playersCount} Players</span>
                        <span>•</span>
                        <span>{m.tokensCaptured || 0} captures</span>
                        {m.notes && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400 italic">{m.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex items-center sm:flex-col justify-between sm:justify-center">
                    <span
                      className={`text-xs font-bold flex items-center gap-0.5 ${
                        m.eloChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {m.eloChange >= 0 ? `+${m.eloChange}` : m.eloChange} Elo
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {Math.floor(m.durationSeconds / 60)}m {m.durationSeconds % 60}s
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Account & Data Management / Danger Zone (GDPR & Google Play Privacy Compliance) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Account & Data Management</h3>
              <p className="text-[11px] text-slate-400">
                Manage your stored personal data, wipe device storage, or permanently delete your player account.
              </p>
            </div>
          </div>
        </div>

        {clearDataMessage && (
          <div className="p-3 mb-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between">
            <span>{clearDataMessage}</span>
            <button onClick={() => setClearDataMessage(null)} className="text-emerald-400 text-xs">
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Option A: Wipe Local Game Storage */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                <span>Wipe Local Device Storage</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Clears saved offline games, custom theme cache, and local preferences without deleting your online registered account.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearLocal}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition border border-slate-700 cursor-pointer self-start"
            >
              Clear Device Cache
            </button>
          </div>

          {/* Option B: Permanently Delete User & Delete Data */}
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 flex flex-col justify-between gap-3">
            <div>
              <h4 className="font-bold text-xs text-rose-300 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete Account & Erase All Data</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Permanently erases your user account, email, phone number, match records, Elo ranking, and removes you from all friend lists.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              id="btn-open-delete-account"
              className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-md shadow-rose-600/30 cursor-pointer self-start active:scale-95 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account & Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete User & Data Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/50 rounded-3xl p-6 shadow-2xl relative text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-white mb-2">
              Permanently Delete User & All Data?
            </h3>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              This action is <span className="text-rose-400 font-bold">immediate and irreversible</span>. In accordance with GDPR Article 17 and Google Play User Data policies, all records will be deleted:
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-left text-[11px] text-slate-300 space-y-1.5 mb-5 font-medium">
              <div className="flex items-center gap-2 text-rose-300">
                <span>• Profile credentials (username, email, phone number, password hash)</span>
              </div>
              <div className="flex items-center gap-2 text-rose-300">
                <span>• Elo rating ({user.stats.eloRating}), win statistics, and rank history</span>
              </div>
              <div className="flex items-center gap-2 text-rose-300">
                <span>• All {user.matches.length} completed match logs and tournament history</span>
              </div>
              <div className="flex items-center gap-2 text-rose-300">
                <span>• Team roster membership and player friend contacts list</span>
              </div>
              <div className="flex items-center gap-2 text-rose-300">
                <span>• All local device cache and offline active games</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                id="btn-confirm-delete-account"
                className="py-2.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/40 transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
                  <span>Erasing Data...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete All Data</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
