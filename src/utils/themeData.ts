import { PlayerColor } from '../types/ludo';
import {
  BoardThemeId,
  BoardThemeDef,
  TokenSkinId,
  TokenSkinDef,
  DiceSkinId,
  DiceSkinDef,
  ThemeSettings,
} from '../types/theme';

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  boardTheme: 'classic',
  tokenSkin: 'classic',
  diceSkin: 'classic',
};

export const BOARD_THEMES: BoardThemeDef[] = [
  {
    id: 'classic',
    name: 'Classic Arena',
    tagline: 'Championship Standard',
    description: 'The iconic international tournament board with crisp geometry, deep slate accents, and standard color quadrants.',
    previewColors: ['#ef4444', '#10b981', '#f59e0b', '#3b82f6'],
    boardOuterClass: 'bg-slate-900 border-slate-800 shadow-2xl',
    boardBaseClass: 'bg-slate-950 border-slate-800 shadow-inner',
    yardBgs: {
      red: 'bg-red-600',
      green: 'bg-emerald-600',
      yellow: 'bg-amber-500',
      blue: 'bg-blue-600',
    },
    yardPadBgs: {
      red: 'bg-red-500/20 border-red-500/60',
      green: 'bg-emerald-500/20 border-emerald-500/60',
      yellow: 'bg-amber-500/20 border-amber-500/60',
      blue: 'bg-blue-500/20 border-blue-500/60',
    },
    trackCellBg: 'bg-slate-900/90 text-slate-400',
    trackCellBorder: 'border-slate-800/80',
    trackCellTextColor: 'text-slate-400',
    safeCellSymbol: '⭐',
    safeCellColor: 'text-amber-400',
    startCellBgs: {
      red: 'bg-red-500 text-white font-black',
      green: 'bg-emerald-500 text-white font-black',
      yellow: 'bg-amber-500 text-white font-black',
      blue: 'bg-blue-500 text-white font-black',
    },
    homePathBgs: {
      red: 'bg-red-500 border-red-600',
      green: 'bg-emerald-500 border-emerald-600',
      yellow: 'bg-amber-500 border-amber-600',
      blue: 'bg-blue-500 border-blue-600',
    },
    centerTriangleColors: {
      red: '#ef4444',
      green: '#10b981',
      yellow: '#f59e0b',
      blue: '#3b82f6',
      stroke: '#0f172a',
      centerCircleFill: '#18181b',
      centerCircleStroke: '#fbbf24',
      centerIcon: '👑',
    },
  },
  {
    id: 'wooden',
    name: 'Royal Teak & Mahogany',
    tagline: 'Handcrafted Heritage',
    description: 'Polished antique rosewood grain with brass metal inlays, warm amber track stones, and royal carved seals.',
    previewColors: ['#991b1b', '#065f46', '#b45309', '#1e3a8a'],
    boardOuterClass: 'bg-[#2a170d] border-amber-900/60 shadow-[0_20px_50px_rgba(42,23,13,0.6)] ring-1 ring-amber-700/30',
    boardBaseClass: 'bg-[#1a0e08] border-amber-900/70 shadow-inner',
    yardBgs: {
      red: 'bg-gradient-to-br from-red-900 to-red-950 border-amber-900/40',
      green: 'bg-gradient-to-br from-emerald-900 to-emerald-950 border-amber-900/40',
      yellow: 'bg-gradient-to-br from-amber-800 to-amber-950 border-amber-900/40',
      blue: 'bg-gradient-to-br from-blue-900 to-blue-950 border-amber-900/40',
    },
    yardPadBgs: {
      red: 'bg-red-950/80 border-amber-700/50 shadow-inner',
      green: 'bg-emerald-950/80 border-amber-700/50 shadow-inner',
      yellow: 'bg-amber-950/80 border-amber-700/50 shadow-inner',
      blue: 'bg-blue-950/80 border-amber-700/50 shadow-inner',
    },
    trackCellBg: 'bg-[#2b1910] text-amber-200/80',
    trackCellBorder: 'border-[#3f2518]',
    trackCellTextColor: 'text-amber-200/80',
    safeCellSymbol: '⚜️',
    safeCellColor: 'text-amber-300 drop-shadow',
    startCellBgs: {
      red: 'bg-red-800 text-amber-100 font-black border border-amber-600/40',
      green: 'bg-emerald-800 text-amber-100 font-black border border-amber-600/40',
      yellow: 'bg-amber-700 text-amber-100 font-black border border-amber-600/40',
      blue: 'bg-blue-800 text-amber-100 font-black border border-amber-600/40',
    },
    homePathBgs: {
      red: 'bg-red-800/90 border-red-900 shadow-inner',
      green: 'bg-emerald-800/90 border-emerald-900 shadow-inner',
      yellow: 'bg-amber-700/90 border-amber-800 shadow-inner',
      blue: 'bg-blue-800/90 border-blue-900 shadow-inner',
    },
    centerTriangleColors: {
      red: '#991b1b',
      green: '#065f46',
      yellow: '#b45309',
      blue: '#1e3a8a',
      stroke: '#451a03',
      centerCircleFill: '#271207',
      centerCircleStroke: '#d97706',
      centerIcon: '🛡️',
    },
  },
  {
    id: 'cyberpunk',
    name: 'Cyber Neon 2099',
    tagline: 'High-Tech Synthwave',
    description: 'Dark obsidian cyber grid with illuminating laser tracks, radioactive neon glows, and a quantum reactor nexus core.',
    previewColors: ['#f43f5e', '#10b981', '#eab308', '#06b6d4'],
    boardOuterClass: 'bg-[#080d1a] border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/30',
    boardBaseClass: 'bg-[#040813] border-cyan-500/50 shadow-[inset_0_0_20px_rgba(6,182,212,0.15)]',
    yardBgs: {
      red: 'bg-gradient-to-br from-rose-600/90 to-rose-950 border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]',
      green: 'bg-gradient-to-br from-emerald-500/90 to-emerald-950 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      yellow: 'bg-gradient-to-br from-yellow-500/90 to-amber-950 border border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.3)]',
      blue: 'bg-gradient-to-br from-cyan-500/90 to-blue-950 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]',
    },
    yardPadBgs: {
      red: 'bg-black/80 border-rose-500/60 shadow-[0_0_8px_rgba(244,63,94,0.4)]',
      green: 'bg-black/80 border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.4)]',
      yellow: 'bg-black/80 border-yellow-500/60 shadow-[0_0_8px_rgba(234,179,8,0.4)]',
      blue: 'bg-black/80 border-cyan-500/60 shadow-[0_0_8px_rgba(6,182,212,0.4)]',
    },
    trackCellBg: 'bg-[#0b1329] text-cyan-300',
    trackCellBorder: 'border-cyan-900/60',
    trackCellTextColor: 'text-cyan-300',
    safeCellSymbol: '⚡',
    safeCellColor: 'text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]',
    startCellBgs: {
      red: 'bg-rose-600 text-white font-black shadow-[0_0_10px_rgba(244,63,94,0.6)]',
      green: 'bg-emerald-500 text-white font-black shadow-[0_0_10px_rgba(16,185,129,0.6)]',
      yellow: 'bg-yellow-500 text-black font-black shadow-[0_0_10px_rgba(234,179,8,0.6)]',
      blue: 'bg-cyan-500 text-black font-black shadow-[0_0_10px_rgba(6,182,212,0.6)]',
    },
    homePathBgs: {
      red: 'bg-rose-500/90 border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.4)]',
      green: 'bg-emerald-500/90 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]',
      yellow: 'bg-yellow-500/90 border-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.4)]',
      blue: 'bg-cyan-500/90 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]',
    },
    centerTriangleColors: {
      red: '#f43f5e',
      green: '#10b981',
      yellow: '#eab308',
      blue: '#06b6d4',
      stroke: '#030712',
      centerCircleFill: '#050c1e',
      centerCircleStroke: '#22d3ee',
      centerIcon: '🌀',
    },
  },
  {
    id: 'marble',
    name: 'Imperial Gold & Marble',
    tagline: 'Palatial Luxury',
    description: 'Polished dark marble stone accented with gold foil borders, royal gemstone sanctuaries, and a high-monarch crown.',
    previewColors: ['#b91c1c', '#047857', '#d97706', '#1d4ed8'],
    boardOuterClass: 'bg-stone-900 border-amber-500/50 shadow-[0_20px_50px_rgba(217,119,6,0.25)] ring-1 ring-amber-400/40',
    boardBaseClass: 'bg-stone-950 border-amber-500/40 shadow-inner',
    yardBgs: {
      red: 'bg-gradient-to-br from-red-800 to-stone-950 border-2 border-amber-500/40',
      green: 'bg-gradient-to-br from-emerald-800 to-stone-950 border-2 border-amber-500/40',
      yellow: 'bg-gradient-to-br from-amber-700 to-stone-950 border-2 border-amber-500/40',
      blue: 'bg-gradient-to-br from-blue-800 to-stone-950 border-2 border-amber-500/40',
    },
    yardPadBgs: {
      red: 'bg-stone-900/90 border-amber-400/60 shadow-[inset_0_0_10px_rgba(251,191,36,0.3)]',
      green: 'bg-stone-900/90 border-amber-400/60 shadow-[inset_0_0_10px_rgba(251,191,36,0.3)]',
      yellow: 'bg-stone-900/90 border-amber-400/60 shadow-[inset_0_0_10px_rgba(251,191,36,0.3)]',
      blue: 'bg-stone-900/90 border-amber-400/60 shadow-[inset_0_0_10px_rgba(251,191,36,0.3)]',
    },
    trackCellBg: 'bg-[#1c1917] text-amber-200/90',
    trackCellBorder: 'border-amber-900/40',
    trackCellTextColor: 'text-amber-200',
    safeCellSymbol: '💎',
    safeCellColor: 'text-amber-300 drop-shadow',
    startCellBgs: {
      red: 'bg-gradient-to-r from-red-700 to-red-600 text-white font-black border border-amber-400/50',
      green: 'bg-gradient-to-r from-emerald-700 to-emerald-600 text-white font-black border border-amber-400/50',
      yellow: 'bg-gradient-to-r from-amber-600 to-amber-500 text-white font-black border border-amber-400/50',
      blue: 'bg-gradient-to-r from-blue-700 to-blue-600 text-white font-black border border-amber-400/50',
    },
    homePathBgs: {
      red: 'bg-red-700 border-amber-600/40',
      green: 'bg-emerald-700 border-amber-600/40',
      yellow: 'bg-amber-600 border-amber-600/40',
      blue: 'bg-blue-700 border-amber-600/40',
    },
    centerTriangleColors: {
      red: '#b91c1c',
      green: '#047857',
      yellow: '#d97706',
      blue: '#1d4ed8',
      stroke: '#78350f',
      centerCircleFill: '#1c1917',
      centerCircleStroke: '#f59e0b',
      centerIcon: '👑',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Cosmic Void',
    tagline: 'Deep Space Galaxy',
    description: 'Deep violet nebula expanse with celestial constellation track tiles, starlight markers, and an astronomical supernova portal.',
    previewColors: ['#be185d', '#0d9488', '#f59e0b', '#7c3aed'],
    boardOuterClass: 'bg-[#120826] border-purple-800/50 shadow-[0_20px_50px_rgba(124,58,237,0.3)] ring-1 ring-purple-600/30',
    boardBaseClass: 'bg-[#0a0319] border-purple-800/40 shadow-inner',
    yardBgs: {
      red: 'bg-gradient-to-br from-pink-800 to-purple-950 border border-pink-500/30 shadow-[0_0_15px_rgba(190,24,93,0.3)]',
      green: 'bg-gradient-to-br from-teal-800 to-purple-950 border border-teal-500/30 shadow-[0_0_15px_rgba(13,148,136,0.3)]',
      yellow: 'bg-gradient-to-br from-amber-700 to-purple-950 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
      blue: 'bg-gradient-to-br from-indigo-800 to-purple-950 border border-indigo-500/30 shadow-[0_0_15px_rgba(124,58,237,0.3)]',
    },
    yardPadBgs: {
      red: 'bg-purple-950/90 border-pink-500/50 shadow-inner',
      green: 'bg-purple-950/90 border-teal-500/50 shadow-inner',
      yellow: 'bg-purple-950/90 border-amber-500/50 shadow-inner',
      blue: 'bg-purple-950/90 border-indigo-500/50 shadow-inner',
    },
    trackCellBg: 'bg-[#170a30] text-purple-200',
    trackCellBorder: 'border-purple-900/60',
    trackCellTextColor: 'text-purple-200',
    safeCellSymbol: '✨',
    safeCellColor: 'text-pink-300 drop-shadow-[0_0_5px_rgba(244,114,182,0.8)]',
    startCellBgs: {
      red: 'bg-pink-600 text-white font-black shadow-[0_0_10px_rgba(219,39,119,0.5)]',
      green: 'bg-teal-600 text-white font-black shadow-[0_0_10px_rgba(13,148,136,0.5)]',
      yellow: 'bg-amber-500 text-white font-black shadow-[0_0_10px_rgba(245,158,11,0.5)]',
      blue: 'bg-purple-600 text-white font-black shadow-[0_0_10px_rgba(147,51,234,0.5)]',
    },
    homePathBgs: {
      red: 'bg-pink-600 border-pink-700',
      green: 'bg-teal-600 border-teal-700',
      yellow: 'bg-amber-600 border-amber-700',
      blue: 'bg-purple-600 border-purple-700',
    },
    centerTriangleColors: {
      red: '#be185d',
      green: '#0d9488',
      yellow: '#f59e0b',
      blue: '#7c3aed',
      stroke: '#2e1065',
      centerCircleFill: '#14052e',
      centerCircleStroke: '#c084fc',
      centerIcon: '🌌',
    },
  },
];

export const TOKEN_SKINS: TokenSkinDef[] = [
  {
    id: 'classic',
    name: 'Classic Pawn',
    tagline: 'Standard Tournament Disc',
    description: 'Precision double-beveled aerodynamic tournament pawn with concentric high-gloss core.',
    previewIcon: '🔘',
  },
  {
    id: 'crown',
    name: 'Imperial Crown & Gems',
    tagline: 'Monarch Relic',
    description: 'Gold-inlaid royal crown crest topped with sparkling multifaceted gemstone centers.',
    previewIcon: '👑',
  },
  {
    id: 'cyber',
    name: 'Quantum Cyber Core',
    tagline: 'Futuristic Reactor Node',
    description: 'High-tech hexagonal reactor cell radiating kinetic pulsing plasma rings.',
    previewIcon: '💠',
  },
  {
    id: 'mascot',
    name: 'Championship Totems',
    tagline: 'Mythical Beasts',
    description: 'Fierce guardian totems: 🦁 Red Lion, 🐉 Green Dragon, 🦅 Yellow Griffin, and 🐺 Blue Wolf.',
    previewIcon: '🦁',
    mascotIcons: {
      red: '🦁',
      green: '🐉',
      yellow: '🦅',
      blue: '🐺',
    },
  },
  {
    id: 'gold_ingot',
    name: 'Gilded Medallion',
    tagline: 'Heavy Bullion Coin',
    description: 'Solid heavy bullion minted medallion with embossed star crest and high-relief rim.',
    previewIcon: '🥇',
  },
];

export const DICE_SKINS: DiceSkinDef[] = [
  {
    id: 'classic',
    name: 'Ivory & Ruby',
    tagline: 'Timeless Standard',
    description: 'Weighted ivory porcelain cube with deep crimson-accented pips and crisp edges.',
    previewIcon: '🎲',
    cubeClass: 'bg-white text-neutral-800 border-2 border-neutral-300 shadow-xl',
    pipColorPrimary: '#171717',
    pipColorAccent: '#dc2626',
    pipColorEmerald: '#059669',
  },
  {
    id: 'vegas_gold',
    name: 'Vegas High-Roller Gold',
    tagline: '24K Metallic Sheen',
    description: 'Mirrored brushed gold cube with blood-ruby gemstone embedded pips and golden luster.',
    previewIcon: '🪙',
    cubeClass: 'bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 text-amber-950 border-2 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]',
    pipColorPrimary: '#991b1b',
    pipColorAccent: '#b91c1c',
    pipColorEmerald: '#78350f',
    pipShadow: '0 1px 2px rgba(0,0,0,0.5)',
  },
  {
    id: 'cyber_obsidian',
    name: 'Obsidian Neon',
    tagline: 'Stealth & Laser Pip',
    description: 'Matte dark carbon chassis with illuminating electric cyan and toxic lime laser dots.',
    previewIcon: '⚡',
    cubeClass: 'bg-[#090d16] text-cyan-400 border-2 border-cyan-500/70 shadow-[0_0_20px_rgba(6,182,212,0.6)]',
    pipColorPrimary: '#06b6d4',
    pipColorAccent: '#f43f5e',
    pipColorEmerald: '#10b981',
    pipShadow: '0 0 8px rgba(6,182,212,0.9)',
  },
  {
    id: 'amethyst_gem',
    name: 'Royal Amethyst Gem',
    tagline: 'Crystalline Jewel',
    description: 'Deep faceted violet mineral dice with bright golden-inlaid pips and mystic sparkle.',
    previewIcon: '🔮',
    cubeClass: 'bg-gradient-to-br from-purple-700 via-purple-900 to-indigo-950 text-amber-300 border-2 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)]',
    pipColorPrimary: '#fbbf24',
    pipColorAccent: '#f43f5e',
    pipColorEmerald: '#fde047',
    pipShadow: '0 0 6px rgba(251,191,36,0.8)',
  },
];

const STORAGE_KEY = 'ludo_theme_settings';

export function getSavedThemeSettings(): ThemeSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_THEME_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      boardTheme: parsed.boardTheme || 'classic',
      tokenSkin: parsed.tokenSkin || 'classic',
      diceSkin: parsed.diceSkin || 'classic',
    };
  } catch {
    return DEFAULT_THEME_SETTINGS;
  }
}

export function saveThemeSettings(settings: ThemeSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage errors
  }
}

export function getBoardTheme(id?: BoardThemeId | string): BoardThemeDef {
  return BOARD_THEMES.find((t) => t.id === id) || BOARD_THEMES[0];
}

export function getTokenSkin(id?: TokenSkinId | string): TokenSkinDef {
  return TOKEN_SKINS.find((t) => t.id === id) || TOKEN_SKINS[0];
}

export function getDiceSkin(id?: DiceSkinId | string): DiceSkinDef {
  return DICE_SKINS.find((d) => d.id === id) || DICE_SKINS[0];
}
