import React, { useState } from 'react';
import { Shield, Lock, Eye, Globe, ExternalLink, X, FileText, CheckCircle2, AlertTriangle, Wifi, Cookie } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'all' | 'google-ads' | 'copyright' | 'data' | 'offline'>('all');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-slate-950/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Privacy Policy &amp; Copyrights
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Updated October 2026
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                © 2026 Ludo Game &amp; Multiplayer Arena. All rights reserved worldwide.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Category Filter Pills */}
        <div className="px-5 sm:px-6 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          <button
            onClick={() => setActiveSection('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
              activeSection === 'all'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Full Policy
          </button>
          <button
            onClick={() => setActiveSection('google-ads')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeSection === 'google-ads'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Google Ads Disclosure</span>
          </button>
          <button
            onClick={() => setActiveSection('copyright')}
            className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
              activeSection === 'copyright'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Copyrights &amp; Trademarks
          </button>
          <button
            onClick={() => setActiveSection('data')}
            className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
              activeSection === 'data'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Data &amp; Storage
          </button>
          <button
            onClick={() => setActiveSection('offline')}
            className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
              activeSection === 'offline'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Offline Capabilities
          </button>
        </div>

        {/* Policy Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-slate-300 text-sm leading-relaxed">
          {/* Highlight Callout: Google Ads Internet Active Statement */}
          {(activeSection === 'all' || activeSection === 'google-ads') && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border-2 border-amber-500/40 shadow-xl space-y-3">
              <div className="flex items-center gap-2.5 text-amber-300 font-black text-base">
                <Wifi className="w-5 h-5 text-amber-400 animate-pulse" />
                <span>Google Advertising &amp; Internet-Active Ads Policy</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200">
                <strong className="text-white">Active Internet Ad Delivery: </strong>
                Once your device connects to an active internet connection, <span className="text-amber-300 font-semibold">Ludo Game &amp; Multiplayer Arena will automatically display advertisements provided by Google (including Google AdSense, Google AdMob, and the Google Ad Network)</span>. When offline, advertisements are paused and no ad network requests are transmitted.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Cookie className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Cookies &amp; Ad Identifiers</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Google and third-party advertising vendors utilize cookies or mobile advertising IDs (IDFA/GAID) to serve ads based on your prior visits to this website or other internet sites.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>User Privacy &amp; Ad Choices</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    You may opt out of personalized Google advertising at any time by visiting{' '}
                    <a
                      href="https://adssettings.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 underline hover:text-indigo-300 font-semibold"
                    >
                      Google Ads Settings
                    </a>{' '}
                    or www.aboutads.info.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Copyright & Ownership Notice */}
          {(activeSection === 'all' || activeSection === 'copyright') && (
            <section className="space-y-3">
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                1. Copyrights, Trademarks &amp; Intellectual Property
              </h3>
              <p>
                <strong>© 2026 Ludo Game &amp; Multiplayer Arena. All Rights Reserved.</strong> All code, design layouts, graphical board skins, theme styling, audio assets, animations, and proprietary matchmaking algorithms are the intellectual property of the application creators and developers.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-300">
                <li>
                  <strong>Board Game Heritage:</strong> The traditional game of Ludo is in the public domain. However, the custom digital illustrations, SVG vector graphics, 3D theme aesthetics, sound synthesizer routines, user interface, and multiplayer implementation are copyrighted works.
                </li>
                <li>
                  <strong>Trademarks:</strong> &ldquo;Ludo Game &amp; Multiplayer Arena&rdquo; and the associated emblem logos are proprietary marks. Google Play, Android, Google AdSense, and AdMob are trademarks of Google LLC.
                </li>
                <li>
                  <strong>Unauthorized Distribution:</strong> Re-hosting, decompiling, scraping, or redistributing the source assets without explicit written authorization is strictly prohibited.
                </li>
              </ul>
            </section>
          )}

          {/* Section 2: Data Collection & Storage */}
          {(activeSection === 'all' || activeSection === 'data') && (
            <section className="space-y-3">
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                2. Information Collection &amp; Data Storage
              </h3>
              <p>
                We prioritize user privacy and data minimization. You can play Ludo Arena completely anonymously as a guest without creating an account.
              </p>
              <div className="space-y-2 text-xs sm:text-sm text-slate-300">
                <p>
                  <strong>• Local Browser Storage (LocalStorage):</strong> We store your chosen theme preferences (board skins, dice designs), audio volume/mute settings, active game save states (so you can resume in-progress matches), and guest career stats directly on your device.
                </p>
                <p>
                  <strong>• Account Information:</strong> If you register an account, we securely store your chosen username, avatar emoji, encrypted password hash (PBKDF2 with SHA-512 and salt), country/region flag, and career Elo leaderboard rating. We do not sell your personal data.
                </p>
                <p>
                  <strong>• Multiplayer Telemetry:</strong> In online matches, real-time dice rolls, token coordinates, and in-game quick chat messages are synchronized over WebSocket connections to enable multiplayer gameplay.
                </p>
              </div>
            </section>
          )}

          {/* Section 3: Google Ads In-Depth */}
          {(activeSection === 'all' || activeSection === 'google-ads') && (
            <section className="space-y-3">
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                3. Google Ads, Third-Party Advertising &amp; Monetization
              </h3>
              <p>
                To provide free access to full game modes, AI bots, and online multiplayer servers, this application integrates Google advertising services:
              </p>
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Conditional Activation:</strong> Ad units (including banner displays and optional rewarded video spots) only initialize when the browser/app confirms an active network connection (<code className="text-indigo-300">navigator.onLine === true</code>).
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Third-Party Vendor Privacy:</strong> Google uses cookies to serve ads based on prior browsing. Read Google's Partner Privacy Policy at{' '}
                    <a
                      href="https://policies.google.com/technologies/partner-sites"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 underline hover:text-indigo-300 font-semibold"
                    >
                      policies.google.com/technologies/partner-sites
                    </a>.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Rewarded Video Rewards:</strong> Players may choose to watch an optional short ad in exchange for in-game cosmetics, bonus coins, or dice rerolls. No monetary gambling or real-money transactions are involved.
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* Section 4: Offline Mode & Progressive Web App */}
          {(activeSection === 'all' || activeSection === 'offline') && (
            <section className="space-y-3">
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                4. Offline Operation &amp; Service Workers
              </h3>
              <p>
                Ludo Arena implements a Progressive Web App (PWA) Service Worker architecture:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-300">
                <li>
                  <strong>100% Offline Playability:</strong> You can play 1–4 Player Local Pass &amp; Play or VS Computer AI anywhere, on airplanes, trains, or during network disruptions, without an internet connection.
                </li>
                <li>
                  <strong>Zero Network Telemetry in Offline Mode:</strong> When offline, all advertising, matchmaking pings, and telemetry are paused to preserve your battery and data bandwidth.
                </li>
              </ul>
            </section>
          )}

          {/* Section 5: Children's Privacy (COPPA) */}
          {activeSection === 'all' && (
            <section className="space-y-3">
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                5. Children&rsquo;s Online Privacy Protection (COPPA &amp; GDPR-K)
              </h3>
              <p className="text-xs sm:text-sm">
                Our application is designed for family-friendly, general audiences. We do not knowingly solicit or collect personally identifiable information from children under the age of 13. When child usage is detected, contextual non-personalized ads are served in accordance with Google Play Family Policy requirements.
              </p>
            </section>
          )}

          {/* Section 6: Chat Controls, Blocking Users & Right to Erasure (Delete Account and Data) */}
          {activeSection === 'all' && (
            <section className="space-y-3">
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                6. Chat Controls, Blocking &amp; Data Erasure (Right to be Forgotten)
              </h3>
              <div className="space-y-2 text-xs sm:text-sm text-slate-300">
                <p>
                  <strong>Option to Stop Chat &amp; Block Users:</strong> Every player has complete control over their communication. You may stop or disable in-game chat at any time with a single click, which mutes all player messages and reactions. You also have the right to block any user from chat immediately. Once blocked, messages and reactions from that player are permanently hidden and suppressed from your screen.
                </p>
                <p>
                  <strong>Delete User Account &amp; Delete Data:</strong> In compliance with GDPR Article 17, CCPA, and Google Play Data Safety policies, users have the unconditional right to delete their account and all personal data. Clicking &ldquo;Delete Account &amp; Data&rdquo; in your Profile or Settings immediately and permanently purges your credentials (username, email, phone number, password hash), tournament match history, statistics, Elo rankings, team rosters, and local device cache.
                </p>
              </div>
            </section>
          )}

          {/* Section 7: Device Contacts & Friend Playing Notifications */}
          {activeSection === 'all' && (
            <section className="space-y-3">
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                7. Device Contacts Access &amp; Playing Friend Notifications
              </h3>
              <div className="space-y-2 text-xs sm:text-sm text-slate-300">
                <p>
                  <strong>Strictly Opt-In Contact Checking:</strong> We will only access your device contact list if you explicitly grant permission through the on-screen prompt.
                </p>
                <p>
                  <strong>Checking Who Plays:</strong> If accepted, contact phone numbers or emails are checked against registered players solely to detect if someone in your contacts plays Ludo. When a contact is detected playing or goes online, the app notifies you so you can challenge or join them.
                </p>
                <p>
                  <strong>No Spam or Third-Party Sharing:</strong> Your address book is never uploaded to third parties, never sold, and never used to send unsolicited SMS or spam messages.
                </p>
              </div>
            </section>
          )}

          {/* Section 8: Contact & Rights */}
          {activeSection === 'all' && (
            <section className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-xs sm:text-sm">
                Questions or Data Inquiries?
              </h4>
              <p className="text-xs text-slate-400">
                If you have questions regarding this Privacy Policy, your rights under GDPR/CCPA, or copyright notices, please reach out via our developer contact or submit inquiries through the official Google Play Console store listing page.
              </p>
              <div className="pt-2 text-xs text-indigo-400 font-mono">
                Official Package: com.ludoarena.app • Vercel &amp; Google Play Production Release
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 text-center sm:text-left">
            <span>© 2026 Ludo Game &amp; Multiplayer Arena. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition cursor-pointer"
            >
              I Understand &amp; Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
