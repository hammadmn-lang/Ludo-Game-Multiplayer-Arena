import React, { useState } from 'react';
import {
  Shield,
  Wifi,
  Cookie,
  Eye,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Trash2,
  BarChart2,
  ExternalLink,
  Mail,
  Copy,
  Check,
} from 'lucide-react';

interface PrivacyPolicyViewProps {
  onBack: () => void;
  onNavigateToDeleteAccount: () => void;
  onNavigateToDataSafety: () => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({
  onBack,
  onNavigateToDeleteAccount,
  onNavigateToDataSafety,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'ads' | 'collection' | 'rights' | 'coppa'>('all');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + '/privacy.html');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fadeIn pb-24">
      {/* Top Bar with Back Button and Quick Links */}
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
            title="Copy Public URL for Google Play Console"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied URL!' : 'Copy Play Store URL'}</span>
          </button>

          <button
            onClick={onNavigateToDeleteAccount}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 transition cursor-pointer text-xs font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Delete Account &amp; Data</span>
          </button>

          <button
            onClick={onNavigateToDataSafety}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition cursor-pointer text-xs font-semibold"
          >
            <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Data Safety</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-2xl space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Updated October 2026 • Production
          </span>
          <span className="text-[10px] font-mono text-slate-400">Package: com.ludoarena.app</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Shield className="w-7 h-7 text-indigo-400" />
          <span>Official Privacy Policy</span>
        </h1>
        <p className="text-sm text-slate-400">
          Ludo Game &amp; Multiplayer Arena is committed to user privacy, cryptographic data security, and compliance with Google Play Store Developer Policies.
        </p>
      </div>

      {/* Navigation Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 ${
            activeTab === 'all' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Complete Policy
        </button>
        <button
          onClick={() => setActiveTab('ads')}
          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'ads' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
          }`}
        >
          <Wifi className="w-3.5 h-3.5" />
          <span>Google Ads Policy</span>
        </button>
        <button
          onClick={() => setActiveTab('collection')}
          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 ${
            activeTab === 'collection' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Information Collected
        </button>
        <button
          onClick={() => setActiveTab('rights')}
          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 ${
            activeTab === 'rights' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Account Deletion &amp; Erasure
        </button>
        <button
          onClick={() => setActiveTab('coppa')}
          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 ${
            activeTab === 'coppa' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Children's Privacy (COPPA)
        </button>
      </div>

      {/* Google Ads Delivery Card */}
      {(activeTab === 'all' || activeTab === 'ads') && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-indigo-950/30 border-2 border-amber-500/40 shadow-xl space-y-3">
          <div className="flex items-center gap-2.5 text-amber-300 font-black text-base">
            <Wifi className="w-5 h-5 text-amber-400 animate-pulse" />
            <span>Google Advertising &amp; Active Internet Delivery Disclosure</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">
            <strong className="text-white">Active Internet Ad Delivery: </strong>
            Whenever your device connects to an active internet connection, <span className="text-amber-300 font-semibold">Ludo Game &amp; Multiplayer Arena displays advertisements served by Google (including Google AdSense, Google AdMob, and the Google Ad Network)</span>. When offline, ad serving is completely paused and zero network ad requests are made.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Cookie className="w-4 h-4 text-indigo-400" />
                <span>Cookies &amp; Ad Identifiers</span>
              </div>
              <p className="text-slate-400 text-xs">
                Google and third-party advertising partners utilize cookies or mobile advertising IDs to serve ads based on prior app visits or other websites.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Opt-Out Controls</span>
              </div>
              <p className="text-slate-400 text-xs">
                You can opt out of personalized Google advertising anytime by visiting{' '}
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 underline hover:text-indigo-300 font-semibold"
                >
                  Google Ads Settings
                </a>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Information Collection */}
      {(activeTab === 'all' || activeTab === 'collection') && (
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            <span>1. Information We Collect &amp; Data Minimization</span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            We practice data minimization. You can play Ludo Arena completely anonymously in Guest Mode without entering personal data.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-300">
            <li>
              <strong>Account Information (Optional):</strong> If you register, we collect a username, optional email address, optional country/region flag, and a securely salted PBKDF2 hash of your password. We never store plain text passwords.
            </li>
            <li>
              <strong>Local Device Storage (LocalStorage &amp; IndexedDB):</strong> Theme settings, dice skins, audio preferences, and offline match save states are saved locally on your device.
            </li>
            <li>
              <strong>Multiplayer Gameplay Telemetry:</strong> Real-time dice rolls, token positions, and match results are transmitted via secure WebSockets to synchronize live online games between players.
            </li>
            <li>
              <strong>No Sensitive Data:</strong> We never collect banking details, credit card numbers, or GPS location coordinates.
            </li>
          </ul>
        </div>
      )}

      {/* Account Deletion & Rights */}
      {(activeTab === 'all' || activeTab === 'rights') && (
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-400" />
              <span>2. Account Deletion &amp; Data Erasure (Right to be Forgotten)</span>
            </h2>
            <button
              onClick={onNavigateToDeleteAccount}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer"
            >
              Open Deletion Tool
            </button>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            In compliance with Google Play Store User Data Policy and GDPR Article 17, users have the unconditional right to delete their account and associated personal data.
          </p>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs sm:text-sm space-y-2 text-slate-300">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Instant In-App Deletion:</strong> Accessible from Career / Profile tab under "Account &amp; Data Security".</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Web URL Resource:</strong> Accessible externally via <code className="text-indigo-400">/delete-account.html</code> for non-app users.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Data Purged:</strong> Credentials, match history, leaderboard Elo, trophies, contact links, and local device saves are permanently destroyed.</span>
            </div>
          </div>
        </div>
      )}

      {/* Children's Privacy */}
      {(activeTab === 'all' || activeTab === 'coppa') && (
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            <span>3. Children's Online Privacy Protection (COPPA &amp; GDPR-K)</span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Our game is built for general, family-friendly audiences. We do not knowingly collect personal information from children under 13 years old. In the event we discover that a child under 13 has provided personal details without verified parental consent, we will immediately delete that information from our servers.
          </p>
        </div>
      )}

      {/* Developer Contact */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Mail className="w-4 h-4 text-indigo-400" />
          <span>Developer &amp; Privacy Contact</span>
        </h3>
        <p className="text-xs text-slate-400">
          For any data inquiries, rights requests, or feedback, email us directly at{' '}
          <a href="mailto:hammadmn@gmail.com" className="text-indigo-400 underline font-semibold">
            hammadmn@gmail.com
          </a>.
        </p>
        <p className="text-[11px] font-mono text-slate-500 pt-1">
          Package ID: com.ludoarena.app • Production Web &amp; Android TWA Release
        </p>
      </div>
    </div>
  );
};
