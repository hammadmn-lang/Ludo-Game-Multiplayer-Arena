import React, { useState } from 'react';
import { Smartphone, Download, ExternalLink, ChevronLeft, ChevronRight, Check, X, Sparkles, Layers, Image as ImageIcon } from 'lucide-react';

interface ScreenshotsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ScreenshotItem {
  id: string;
  title: string;
  category: string;
  orientation: 'portrait' | 'landscape';
  resolution: string;
  src: string;
  description: string;
  badge: string;
}

export const ScreenshotsModal: React.FC<ScreenshotsModalProps> = ({ isOpen, onClose }) => {
  const screenshots: ScreenshotItem[] = [
    {
      id: 'screenshot-1',
      title: 'Real-time Multiplayer & Smart AI',
      category: 'In-Game Action',
      orientation: 'portrait',
      resolution: '1080 × 1920 px (9:16)',
      src: '/screenshots/phone-screenshot-1.jpg',
      description: 'Dynamic 3D dice physics with blur effects, 4-corner player avatars, turn timers, and in-game emoji chat.',
      badge: 'Play Store Primary',
    },
    {
      id: 'screenshot-2',
      title: 'Live 4-Player Championship Arena',
      category: 'Gameplay',
      orientation: 'portrait',
      resolution: '1080 × 1920 px (9:16)',
      src: '/screenshots/phone-screenshot-3-gameplay.svg',
      description: 'Championship board view with active tokens on paths, six-roll celebration, and interactive emoji banter.',
      badge: 'Core Gameplay',
    },
    {
      id: 'screenshot-3',
      title: 'Theme & Skins Customizer Studio',
      category: 'Customization',
      orientation: 'portrait',
      resolution: '1080 × 1920 px (9:16)',
      src: '/screenshots/phone-screenshot-2-themes.svg',
      description: 'Royal Gold, Cyber Neon 2077, Heritage Teak Wood boards with custom ruby crystal dice and aura tokens.',
      badge: 'Feature Showcase',
    },
    {
      id: 'screenshot-4',
      title: 'Global Rankings & Career Stats',
      category: 'Competitive',
      orientation: 'portrait',
      resolution: '1080 × 1920 px (9:16)',
      src: '/screenshots/phone-screenshot-4-rankings.svg',
      description: 'Live podium rankings, Grandmaster tiers, Elo matchmaking standing, and win streak tracking.',
      badge: 'Progression',
    },
    {
      id: 'screenshot-5',
      title: 'Google Play Feature Graphic & Arena',
      category: 'Store Banner',
      orientation: 'landscape',
      resolution: '1920 × 1080 px (16:9)',
      src: '/screenshots/feature-graphic.jpg',
      description: 'Hero presentation banner showcasing modern smartphone gameplay, Google Play badges, and esports arena.',
      badge: 'Store Feature Graphic',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const current = screenshots[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % screenshots.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2.5 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto overscroll-contain pt-4 sm:pt-4">
      <div className="w-[calc(100vw-20px)] max-w-5xl mx-auto my-auto max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Phone Screenshots &amp; Store Assets
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  Google Play &amp; Vercel Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Attached high-resolution smartphone mockups built for Google Play Store, PWABuilder &amp; PWA Manifest
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left/Center: Phone Frame Mockup View */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div className="relative group max-h-[580px] flex items-center justify-center">
              {/* Prev / Next Floating Arrows */}
              <button
                onClick={handlePrev}
                className="absolute left-[-16px] z-20 p-2.5 rounded-full bg-slate-900/90 hover:bg-indigo-600 border border-slate-700 text-white transition shadow-xl cursor-pointer"
                title="Previous screenshot"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-[-16px] z-20 p-2.5 rounded-full bg-slate-900/90 hover:bg-indigo-600 border border-slate-700 text-white transition shadow-xl cursor-pointer"
                title="Next screenshot"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* The Mockup Display */}
              <div
                className={`transition-all duration-300 rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-700/80 bg-slate-950 flex items-center justify-center ${
                  current.orientation === 'portrait'
                    ? 'w-[290px] sm:w-[320px] aspect-[9/16]'
                    : 'w-full max-w-[500px] aspect-[16/9]'
                }`}
              >
                <img
                  src={current.src}
                  alt={current.title}
                  className="w-full h-full object-cover select-none"
                />
              </div>
            </div>

            {/* Thumbnail Dot Switcher */}
            <div className="flex items-center gap-2 mt-4">
              {screenshots.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx ? 'w-8 bg-indigo-500' : 'w-2.5 bg-slate-700 hover:bg-slate-600'
                  }`}
                  title={s.title}
                />
              ))}
            </div>
          </div>

          {/* Right: Asset Details & Download Action Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {current.badge}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {current.resolution}
                </span>
              </div>

              <h3 className="text-lg font-black text-white">
                {current.title}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                {current.description}
              </p>

              <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Aspect Ratio:</span>
                  <span className="text-slate-200 font-semibold">{current.orientation === 'portrait' ? '9:16 (Portrait)' : '16:9 (Landscape)'}</span>
                </div>
                <div className="flex justify-between">
                  <span>File Location:</span>
                  <span className="text-indigo-300 font-mono text-[11px] truncate max-w-[200px]">{current.src}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Attached in Manifest
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href={current.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Full Res</span>
                </a>
                <a
                  href={current.src}
                  download={current.src.split('/').pop()}
                  className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-indigo-500/25 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              </div>
            </div>

            {/* Quick List of All 5 Screenshots */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                All Attached Screenshots ({screenshots.length})
              </span>
              <div className="grid grid-cols-5 gap-2">
                {screenshots.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative rounded-xl overflow-hidden aspect-[9/16] border-2 transition cursor-pointer group ${
                      currentIndex === idx ? 'border-indigo-500 scale-105 shadow-md shadow-indigo-500/20' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={s.src} alt={s.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[9px] text-white font-bold py-0.5 text-center truncate">
                      #{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Compliant with Google Play Store graphic asset guidelines and W3C Web App Manifest standard.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
