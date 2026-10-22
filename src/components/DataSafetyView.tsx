import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Trash2,
  Shield,
  Eye,
  Copy,
  Check,
  Globe,
  Database,
  Smartphone,
  ExternalLink,
  Award,
} from 'lucide-react';

interface DataSafetyViewProps {
  onBack: () => void;
  onNavigateToPolicy: () => void;
  onNavigateToDeleteAccount: () => void;
}

export const DataSafetyView: React.FC<DataSafetyViewProps> = ({
  onBack,
  onNavigateToPolicy,
  onNavigateToDeleteAccount,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + '/data-safety.html');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
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
            title="Copy Public URL for Google Play Console"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied URL!' : 'Copy Play Store URL'}</span>
          </button>

          <button
            onClick={onNavigateToPolicy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer text-xs font-semibold"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={onNavigateToDeleteAccount}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 transition cursor-pointer text-xs font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Delete Account &amp; Data</span>
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 shadow-2xl space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            Google Play Console Data Safety Certified
          </span>
          <span className="text-[10px] font-mono text-slate-400">Package: com.ludoarena.app</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <ShieldCheck className="w-7 h-7 text-cyan-400" />
          <span>Data Safety &amp; Collection Disclosure</span>
        </h1>
        <p className="text-sm text-slate-300">
          Transparent accounting of all data types, transport encryption protocols, retention limits, and third-party advertising practices.
        </p>
      </div>

      {/* Quick Play Console Answers Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold block">Data Collection</span>
          <div className="text-emerald-400 font-black text-base flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Yes (Opt-In)</span>
          </div>
          <p className="text-[11px] text-slate-400">Guest play collects zero data.</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold block">Data In Transit</span>
          <div className="text-emerald-400 font-black text-base flex items-center gap-1.5">
            <Lock className="w-4 h-4" />
            <span>Encrypted (TLS/WSS)</span>
          </div>
          <p className="text-[11px] text-slate-400">All network traffic encrypted.</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold block">Account Deletion</span>
          <div className="text-emerald-400 font-black text-base flex items-center gap-1.5">
            <Trash2 className="w-4 h-4" />
            <span>Self-Service URL</span>
          </div>
          <p className="text-[11px] text-slate-400">In-app &amp; external web deletion.</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold block">Data Sold</span>
          <div className="text-indigo-400 font-black text-base flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            <span>Never Sold</span>
          </div>
          <p className="text-[11px] text-slate-400">Zero data selling or brokers.</p>
        </div>
      </div>

      {/* Data Safety Questionnaire Answers Table */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <span>Google Play Console Questionnaire Reference Table</span>
          </h2>
          <span className="text-[11px] font-bold text-slate-400">Play Console Ready</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3 font-bold">Category</th>
                <th className="py-2.5 px-3 font-bold">Data Type</th>
                <th className="py-2.5 px-3 font-bold">Collected?</th>
                <th className="py-2.5 px-3 font-bold">Shared?</th>
                <th className="py-2.5 px-3 font-bold">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Personal Info</td>
                <td className="py-3 px-3">Username / Nickname</td>
                <td className="py-3 px-3 text-emerald-400 font-bold">Collected (Opt-in)</td>
                <td className="py-3 px-3 text-slate-400">No</td>
                <td className="py-3 px-3 text-slate-300">App functionality &amp; Leaderboard display</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Personal Info</td>
                <td className="py-3 px-3">Email Address</td>
                <td className="py-3 px-3 text-amber-400 font-bold">Optional</td>
                <td className="py-3 px-3 text-slate-400">No</td>
                <td className="py-3 px-3 text-slate-300">Account login &amp; password recovery</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Personal Info</td>
                <td className="py-3 px-3">Phone Number</td>
                <td className="py-3 px-3 text-amber-400 font-bold">Optional</td>
                <td className="py-3 px-3 text-slate-400">No</td>
                <td className="py-3 px-3 text-slate-300">Friend matching and online alert checks</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-white">App Activity</td>
                <td className="py-3 px-3">Game stats, dice rolls, wins</td>
                <td className="py-3 px-3 text-emerald-400 font-bold">Collected</td>
                <td className="py-3 px-3 text-slate-400">No</td>
                <td className="py-3 px-3 text-slate-300">Elo calculation, leaderboards, match history</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Device / Other IDs</td>
                <td className="py-3 px-3">Ad ID (GAID / IDFA)</td>
                <td className="py-3 px-3 text-emerald-400 font-bold">Online Only</td>
                <td className="py-3 px-3 text-indigo-400 font-bold">Google Ads</td>
                <td className="py-3 px-3 text-slate-300">Google AdMob / AdSense monetization</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Financial Info</td>
                <td className="py-3 px-3">Credit card, bank details</td>
                <td className="py-3 px-3 text-rose-400 font-bold">Never</td>
                <td className="py-3 px-3 text-slate-400">No</td>
                <td className="py-3 px-3 text-slate-400">Not collected (100% Free App)</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Location</td>
                <td className="py-3 px-3">Precise GPS coordinates</td>
                <td className="py-3 px-3 text-rose-400 font-bold">Never</td>
                <td className="py-3 px-3 text-slate-400">No</td>
                <td className="py-3 px-3 text-slate-400">Not collected</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Practices Summary */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-400" />
          <span>Security Practices &amp; Deletion Guarantees</span>
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-300">
          <li>
            <strong>Data Encrypted in Transit:</strong> All HTTP requests use TLS 1.3 encryption (HTTPS). Live multiplayer moves use secure WebSockets (WSS).
          </li>
          <li>
            <strong>Salted PBKDF2 Password Storage:</strong> Passwords are protected using 10,000 iterations of PBKDF2 with SHA-512 and unique cryptographic salts.
          </li>
          <li>
            <strong>Data Deletion Link:</strong> Users can request complete account deletion directly in the app or via the public web URL at <code className="text-indigo-400">/delete-account.html</code>.
          </li>
          <li>
            <strong>Zero Telemetry in Offline Mode:</strong> When offline, no telemetry or advertising pings are transmitted.
          </li>
        </ul>
      </div>

      {/* Footer */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Google Play Store Compliance Checklist • Updated October 2026</span>
        <span className="font-mono text-[11px] text-slate-500">Official URL: /data-safety.html</span>
      </div>
    </div>
  );
};
