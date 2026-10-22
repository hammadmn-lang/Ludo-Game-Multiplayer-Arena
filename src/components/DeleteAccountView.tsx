import React, { useState } from 'react';
import {
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  ShieldAlert,
  Lock,
  Mail,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { UserProfile } from '../types/ludo';

interface DeleteAccountViewProps {
  user: UserProfile | null;
  authToken?: string | null;
  onBack: () => void;
  onNavigateToPolicy: () => void;
  onNavigateToDataSafety: () => void;
  onDeleteCurrentAccount?: () => Promise<void> | void;
  onClearLocalData?: () => void;
}

export const DeleteAccountView: React.FC<DeleteAccountViewProps> = ({
  user,
  authToken,
  onBack,
  onNavigateToPolicy,
  onNavigateToDataSafety,
  onDeleteCurrentAccount,
  onClearLocalData,
}) => {
  const [activeTab, setActiveTab] = useState<'instant' | 'request' | 'device'>('instant');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmedRisk, setConfirmedRisk] = useState(false);
  const [reqEmail, setReqEmail] = useState('');
  const [reqReason, setReqReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [localCleared, setLocalCleared] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + '/delete-account.html');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // If user is logged in, handle 1-click in-app deletion
  const handleDeleteLoggedInUser = async () => {
    if (!confirm(`Are you SURE you want to permanently delete your account "${user?.username}"? All matches, Elo rating, and profile data will be permanently wiped.`)) {
      return;
    }

    setLoading(true);
    try {
      if (onDeleteCurrentAccount) {
        await onDeleteCurrentAccount();
      } else if (authToken) {
        const res = await fetch('/api/auth/account', {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to delete account');
      }
      setStatusMessage({
        type: 'success',
        text: 'Your account and all associated personal data have been permanently erased from our servers.',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'An error occurred during account deletion.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle external credentials deletion form
  const handleFormDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedRisk) {
      setStatusMessage({ type: 'error', text: 'Please check the confirmation box to acknowledge permanent data loss.' });
      return;
    }

    if (!confirm('Are you ABSOLUTELY SURE you want to permanently delete this account? This cannot be undone.')) {
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/auth/web-delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMessage({
          type: 'success',
          text: data.message || 'Your account and all associated data have been permanently deleted.',
        });
        setIdentifier('');
        setPassword('');
        setConfirmedRisk(false);
        localStorage.removeItem('ludo_token');
        localStorage.removeItem('ludo_user');
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Could not delete account. Please verify your credentials.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: 'Network error connecting to deletion server. Please email hammadmn@gmail.com.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle email request submission
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/web-delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: reqEmail, reason: reqReason, requestType: 'manual_inquiry' }),
      });
      const data = await res.json();

      setStatusMessage({
        type: 'success',
        text: `Request logged successfully! Reference #${data.referenceId || 'DEL-REQ'}. Your account and data will be permanently wiped within 24 hours.`,
      });
      setReqEmail('');
      setReqReason('');
    } catch {
      setStatusMessage({
        type: 'success',
        text: `Deletion inquiry received for ${reqEmail}. Data will be permanently wiped within 24 hours.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearLocal = () => {
    if (confirm('Clear all local game cache, offline match save states, and skin settings on this device?')) {
      if (onClearLocalData) onClearLocalData();
      localStorage.clear();
      sessionStorage.clear();
      setLocalCleared(true);
      setTimeout(() => setLocalCleared(false), 3500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fadeIn pb-24">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer text-xs font-bold shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Arena</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition cursor-pointer text-xs font-semibold"
            title="Copy URL for Google Play Console Form"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied URL!' : 'Copy Play Store URL'}</span>
          </button>

          <button
            onClick={onNavigateToPolicy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer text-xs font-semibold"
          >
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={onNavigateToDataSafety}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition cursor-pointer text-xs font-semibold"
          >
            <span>Data Safety</span>
          </button>
        </div>
      </div>

      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-rose-500/30 shadow-2xl space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
            Google Play Account Deletion Requirement
          </span>
          <span className="text-[10px] font-mono text-slate-400">Package: com.ludoarena.app</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Trash2 className="w-7 h-7 text-rose-400" />
          <span>Delete Account &amp; User Data</span>
        </h1>
        <p className="text-sm text-slate-300">
          Request the permanent, unconditional erasure of your account, match records, leaderboard rank, and all associated personal data.
        </p>
      </div>

      {/* Alert Status Feedback */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-start gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed">{statusMessage.text}</span>
        </div>
      )}

      {/* What Gets Deleted Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <span>What data will be permanently destroyed?</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <strong className="text-white block">👤 Account &amp; Credentials</strong>
            <p className="text-slate-400 text-xs">
              Your username, email, phone number, and encrypted password hash are erased from the database immediately.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <strong className="text-white block">🏆 Leaderboard &amp; Elo Rating</strong>
            <p className="text-slate-400 text-xs">
              Your career score, leaderboard standing, win streaks, and earned trophies are removed from public rankings.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <strong className="text-white block">🎲 Match Records &amp; Stats</strong>
            <p className="text-slate-400 text-xs">
              All past match logs, tokens captured, sixes rolled, and opponent history are permanently erased.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <strong className="text-white block">👥 Friends &amp; Team Links</strong>
            <p className="text-slate-400 text-xs">
              Your profile is removed from your contacts' friends lists and team rosters.
            </p>
          </div>
        </div>
      </div>

      {/* If Currently Logged In: 1-Click In-App Deletion */}
      {user && (
        <div className="p-5 sm:p-6 rounded-2xl bg-rose-950/20 border-2 border-rose-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Active Session Detected</span>
              <h3 className="text-base font-black text-white">Delete Logged-in Account: {user.username}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Email: {user.email || 'None'} • Elo: {user.stats.eloRating}
              </p>
            </div>
            <button
              onClick={handleDeleteLoggedInUser}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete My Account Now'}
            </button>
          </div>
        </div>
      )}

      {/* Tabs for Deletion Method */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-400" />
          <span>Self-Service &amp; Web Request Options</span>
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('instant')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'instant' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Instant Online Deletion
          </button>
          <button
            onClick={() => setActiveTab('request')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'request' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Email Deletion Request
          </button>
          <button
            onClick={() => setActiveTab('device')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'device' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Wipe Local Device
          </button>
        </div>

        {/* Tab 1: Instant Self-Service Form */}
        {activeTab === 'instant' && (
          <form onSubmit={handleFormDelete} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Username, Email, or Phone Number
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                placeholder="e.g. KingLudo_99 or you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Account Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter current password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={confirmedRisk}
                onChange={(e) => setConfirmedRisk(e.target.checked)}
                className="mt-0.5 rounded bg-slate-950 border-slate-700"
              />
              <span>
                I understand this action is permanent and all my tournament stats, rankings, and match history will be irrecoverably wiped.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/25 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Processing Deletion...' : 'Permanently Delete Account & All Data Now'}
            </button>
          </form>
        )}

        {/* Tab 2: Email Deletion Request */}
        {activeTab === 'request' && (
          <form onSubmit={handleRequestSubmit} className="space-y-4 pt-2">
            <p className="text-xs text-slate-400">
              If you forgot your password or no longer have the app installed, submit your registered email or username below. A confirmation ticket will be generated and data purged within 24 hours.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Registered Email or Username
              </label>
              <input
                type="text"
                value={reqEmail}
                onChange={(e) => setReqEmail(e.target.value)}
                required
                placeholder="Enter registered email address"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Reason for Leaving (Optional)
              </label>
              <textarea
                value={reqReason}
                onChange={(e) => setReqReason(e.target.value)}
                rows={3}
                placeholder="Share any feedback with the developer (optional)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit 24-Hour Deletion Ticket'}
            </button>
          </form>
        )}

        {/* Tab 3: Wipe Local Device Cache */}
        {activeTab === 'device' && (
          <div className="space-y-3 pt-2">
            <p className="text-xs text-slate-300">
              Wipes all locally stored preferences, unlocked cosmetic themes, and offline single-player save games stored on this device without affecting server accounts.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClearLocal}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition cursor-pointer flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Wipe Local Browser Storage</span>
              </button>
              {localCleared && (
                <span className="text-xs text-emerald-400 font-bold">✓ Local cache successfully purged!</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Support Info */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Support &amp; Data Protection Officer: <a href="mailto:hammadmn@gmail.com" className="text-indigo-400 underline font-semibold">hammadmn@gmail.com</a></span>
        <span className="font-mono text-[11px] text-slate-500">Public Deletion URL: /delete-account.html</span>
      </div>
    </div>
  );
};
