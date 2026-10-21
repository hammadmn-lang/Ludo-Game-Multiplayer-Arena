import React, { useEffect, useState } from 'react';
import { useNetworkStatus } from '../utils/useNetworkStatus';
import { Wifi, WifiOff, ShieldCheck, Sparkles, X, Info, ExternalLink, Play, Gift } from 'lucide-react';

interface GoogleAdsBannerProps {
  onOpenPrivacyPolicy?: () => void;
  publisherId?: string;
  adSlotId?: string;
  position?: 'bottom' | 'inline';
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export const GoogleAdsBanner: React.FC<GoogleAdsBannerProps> = ({
  onOpenPrivacyPolicy,
  publisherId = 'ca-pub-9847120394812345',
  adSlotId = '8492019284',
  position = 'bottom',
}) => {
  const { isOnline } = useNetworkStatus();
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [adDismissed, setAdDismissed] = useState(false);
  const [showRewardedModal, setShowRewardedModal] = useState(false);
  const [rewardedCountdown, setRewardedCountdown] = useState(5);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [adImpressionCount, setAdImpressionCount] = useState(1);

  // Initialize Google Ads SDK whenever internet connectivity is active
  useEffect(() => {
    if (!isOnline) {
      setIsScriptLoaded(false);
      return;
    }

    // Load Google AdSense script dynamically when internet is active
    const scriptId = 'google-adsense-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
      script.async = true;
      script.crossOrigin = 'anonymous';

      script.onload = () => {
        setIsScriptLoaded(true);
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch {
          // Handled gracefully in test/dev environment
        }
      };

      script.onerror = () => {
        // Fallback for adblockers / offline network states
        setIsScriptLoaded(false);
      };

      document.head.appendChild(script);
    } else {
      setIsScriptLoaded(true);
    }

    // Increment ad impressions
    setAdImpressionCount((prev) => prev + 1);
  }, [isOnline, publisherId]);

  // Handle rewarded video ad timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showRewardedModal && rewardedCountdown > 0) {
      timer = setTimeout(() => {
        setRewardedCountdown((c) => c - 1);
      }, 1000);
    } else if (showRewardedModal && rewardedCountdown === 0) {
      setRewardClaimed(true);
    }
    return () => clearTimeout(timer);
  }, [showRewardedModal, rewardedCountdown]);

  const handleStartRewardedAd = () => {
    setShowRewardedModal(true);
    setRewardedCountdown(5);
    setRewardClaimed(false);
  };

  const handleCloseRewardedAd = () => {
    setShowRewardedModal(false);
  };

  if (adDismissed) {
    return (
      <button
        onClick={() => setAdDismissed(false)}
        className="fixed bottom-2 right-2 z-30 px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[10px] text-slate-400 hover:text-indigo-400 transition flex items-center gap-1 backdrop-blur"
        title="Show Google Ads banner"
      >
        <Sparkles className="w-3 h-3 text-amber-400" />
        <span>Ads Active</span>
      </button>
    );
  }

  return (
    <>
      <div
        className={`w-full transition-all duration-300 ${
          position === 'bottom'
            ? 'sticky bottom-0 z-30 border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-md px-3 py-2 shadow-2xl'
            : 'rounded-2xl border border-slate-800 bg-slate-900/60 p-3 my-3'
        }`}
        id="google-ads-container"
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Ad Label & Google Network Status */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              <span className="text-amber-400 font-extrabold">Ad</span>
              <span className="text-slate-500">•</span>
              <span>Google Ads</span>
            </div>

            {/* Live Online/Offline Network Status indicator */}
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                isOnline
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
              title={
                isOnline
                  ? 'Internet connected: Google Ads network initialized'
                  : 'Internet disconnected: Ads automatically paused'
              }
            >
              {isOnline ? (
                <>
                  <Wifi className="w-2.5 h-2.5 animate-pulse" />
                  <span className="hidden xs:inline">Online • Ads Active</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-2.5 h-2.5" />
                  <span>Offline • Ads Paused</span>
                </>
              )}
            </div>
          </div>

          {/* Ad Creative Area */}
          <div className="flex-1 w-full max-w-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-xl px-3 py-1.5 flex items-center justify-between gap-2 overflow-hidden shadow-inner">
            {isOnline ? (
              <>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-sm shrink-0">
                    🎲
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">
                        Google Play Games: Battle Champions 2026
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 shrink-0">
                        Sponsored
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      Play millions of Android games seamlessly across PC, tablet, and mobile!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleStartRewardedAd}
                    className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-[11px] shadow-sm flex items-center gap-1 cursor-pointer transition active:scale-95"
                    title="Watch short ad to get reward"
                  >
                    <Gift className="w-3 h-3 text-slate-950" />
                    <span className="hidden sm:inline">Bonus Coins</span>
                  </button>

                  <a
                    href="https://play.google.com/store/apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition shadow flex items-center gap-1 cursor-pointer"
                  >
                    <span>Install</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </>
            ) : (
              <div className="py-1 text-center w-full text-slate-400 text-xs flex items-center justify-center gap-2">
                <WifiOff className="w-3.5 h-3.5 text-slate-500" />
                <span>You are currently offline. Google Ads will automatically resume once internet reconnects.</span>
              </div>
            )}
          </div>

          {/* Ad Controls & Privacy Links */}
          <div className="flex items-center gap-2 shrink-0 text-[11px] text-slate-400">
            {onOpenPrivacyPolicy && (
              <button
                onClick={onOpenPrivacyPolicy}
                className="hover:text-indigo-300 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                title="View Google Ads section in Privacy Policy"
              >
                <ShieldCheck className="w-3 h-3 text-indigo-400" />
                <span>Ad Policy</span>
              </button>
            )}

            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-200 transition"
              title="Google AdChoices & Privacy Settings"
            >
              <Info className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => setAdDismissed(true)}
              className="p-1 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800 transition cursor-pointer"
              title="Minimize Ad"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Rewarded Ad Interactive Modal Simulation */}
      {showRewardedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-amber-400 uppercase tracking-wider border border-slate-700">
                  Google AdMob • Rewarded
                </div>
                <span className="text-xs text-slate-400">Sponsored Video</span>
              </div>
              {rewardedCountdown === 0 ? (
                <button
                  onClick={handleCloseRewardedAd}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  ✕ Close &amp; Claim
                </button>
              ) : (
                <div className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  Reward in {rewardedCountdown}s
                </div>
              )}
            </div>

            {/* Video preview player mockup */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-6 text-center group">
              <div className="w-16 h-16 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-3xl mb-3 animate-pulse">
                🎲
              </div>
              <h3 className="font-black text-lg text-white mb-1">
                Ludo Arena Season 12 Pass
              </h3>
              <p className="text-xs text-slate-300 max-w-xs">
                Unlock 8 exclusive board skins, animated diamond dice, and custom crown token avatars!
              </p>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-800">
                <span>Google Partner Ad</span>
                <span className="font-mono text-emerald-400">Ad Slot #{adSlotId}</span>
              </div>
            </div>

            {/* Reward status */}
            {rewardClaimed ? (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-emerald-300 font-black text-sm">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Reward Claimed: +50 Arena Coins &amp; Free Reroll!</span>
                </div>
                <p className="text-[11px] text-emerald-200/80">
                  Thank you for supporting Ludo Arena with Google Ads.
                </p>
                <button
                  onClick={handleCloseRewardedAd}
                  className="mt-2 w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg"
                >
                  Collect Reward
                </button>
              </div>
            ) : (
              <div className="text-center text-xs text-slate-400">
                Watch full 5-second ad to receive in-game reward.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
