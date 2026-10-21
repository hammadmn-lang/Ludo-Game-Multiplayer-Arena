import { PlayerColor } from '../types/ludo';

export interface GridCoord {
  x: number;
  y: number;
}

// 52 track coordinates on the 15x15 grid
export const TRACK_COORDINATES: GridCoord[] = [
  // Red Arm Top (Left to Right) - Indices 0..4
  { x: 1, y: 6 }, // 0: RED START (Safe)
  { x: 2, y: 6 }, // 1
  { x: 3, y: 6 }, // 2
  { x: 4, y: 6 }, // 3
  { x: 5, y: 6 }, // 4

  // Green Arm Left (Bottom to Top) - Indices 5..10
  { x: 6, y: 5 }, // 5
  { x: 6, y: 4 }, // 6
  { x: 6, y: 3 }, // 7
  { x: 6, y: 2 }, // 8: SAFE STAR
  { x: 6, y: 1 }, // 9
  { x: 6, y: 0 }, // 10

  // Top Edge Center - Index 11
  { x: 7, y: 0 }, // 11

  // Green Arm Right (Top to Bottom) - Indices 12..17
  { x: 8, y: 0 }, // 12
  { x: 8, y: 1 }, // 13: GREEN START (Safe)
  { x: 8, y: 2 }, // 14
  { x: 8, y: 3 }, // 15
  { x: 8, y: 4 }, // 16
  { x: 8, y: 5 }, // 17

  // Yellow Arm Top (Left to Right) - Indices 18..23
  { x: 9, y: 6 }, // 18
  { x: 10, y: 6 }, // 19
  { x: 11, y: 6 }, // 20
  { x: 12, y: 6 }, // 21: SAFE STAR
  { x: 13, y: 6 }, // 22
  { x: 14, y: 6 }, // 23

  // Right Edge Center - Index 24
  { x: 14, y: 7 }, // 24

  // Yellow Arm Bottom (Right to Left) - Indices 25..30
  { x: 14, y: 8 }, // 25
  { x: 13, y: 8 }, // 26: YELLOW START (Safe)
  { x: 12, y: 8 }, // 27
  { x: 11, y: 8 }, // 28
  { x: 10, y: 8 }, // 29
  { x: 9, y: 8 }, // 30

  // Blue Arm Right (Top to Bottom) - Indices 31..36
  { x: 8, y: 9 }, // 31
  { x: 8, y: 10 }, // 32
  { x: 8, y: 11 }, // 33
  { x: 8, y: 12 }, // 34: SAFE STAR
  { x: 8, y: 13 }, // 35
  { x: 8, y: 14 }, // 36

  // Bottom Edge Center - Index 37
  { x: 7, y: 14 }, // 37

  // Blue Arm Left (Bottom to Top) - Indices 38..43
  { x: 6, y: 14 }, // 38
  { x: 6, y: 13 }, // 39: BLUE START (Safe)
  { x: 6, y: 12 }, // 40
  { x: 6, y: 11 }, // 41
  { x: 6, y: 10 }, // 42
  { x: 6, y: 9 }, // 43

  // Red Arm Bottom (Right to Left) - Indices 44..49
  { x: 5, y: 8 }, // 44
  { x: 4, y: 8 }, // 45
  { x: 3, y: 8 }, // 46
  { x: 2, y: 8 }, // 47: SAFE STAR
  { x: 1, y: 8 }, // 48
  { x: 0, y: 8 }, // 49

  // Left Edge Center - Indices 50..51
  { x: 0, y: 7 }, // 50
  { x: 0, y: 6 }, // 51
];

// Home Paths for each color (5 colored safe steps leading to triangle goal)
export const HOME_PATHS: Record<PlayerColor, GridCoord[]> = {
  red: [
    { x: 1, y: 7 },
    { x: 2, y: 7 },
    { x: 3, y: 7 },
    { x: 4, y: 7 },
    { x: 5, y: 7 },
  ],
  green: [
    { x: 7, y: 1 },
    { x: 7, y: 2 },
    { x: 7, y: 3 },
    { x: 7, y: 4 },
    { x: 7, y: 5 },
  ],
  yellow: [
    { x: 13, y: 7 },
    { x: 12, y: 7 },
    { x: 11, y: 7 },
    { x: 10, y: 7 },
    { x: 9, y: 7 },
  ],
  blue: [
    { x: 7, y: 13 },
    { x: 7, y: 12 },
    { x: 7, y: 11 },
    { x: 7, y: 10 },
    { x: 7, y: 9 },
  ],
};

// Home Center / Goal coordinates
export const GOAL_COORDINATES: Record<PlayerColor, GridCoord> = {
  red: { x: 6, y: 7 },
  green: { x: 7, y: 6 },
  yellow: { x: 8, y: 7 },
  blue: { x: 7, y: 8 },
};

// Yard / Base coordinates for 4 tokens per color
export const YARD_POSITIONS: Record<PlayerColor, GridCoord[]> = {
  red: [
    { x: 2, y: 2 },
    { x: 3.5, y: 2 },
    { x: 2, y: 3.5 },
    { x: 3.5, y: 3.5 },
  ],
  green: [
    { x: 11, y: 2 },
    { x: 12.5, y: 2 },
    { x: 11, y: 3.5 },
    { x: 12.5, y: 3.5 },
  ],
  yellow: [
    { x: 11, y: 11 },
    { x: 12.5, y: 11 },
    { x: 11, y: 12.5 },
    { x: 12.5, y: 12.5 },
  ],
  blue: [
    { x: 2, y: 11 },
    { x: 3.5, y: 11 },
    { x: 2, y: 12.5 },
    { x: 3.5, y: 12.5 },
  ],
};

export const COLOR_OFFSETS: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

// Safe track indices on the 52-cell track
export const SAFE_TRACK_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

export const COLOR_PALETTE = {
  red: {
    primary: '#ef4444',
    secondary: '#b91c1c',
    light: '#fee2e2',
    bg: '#fef2f2',
    border: '#dc2626',
    glow: 'rgba(239, 68, 68, 0.4)',
    text: 'text-red-600',
    bgClass: 'bg-red-500',
    borderClass: 'border-red-500',
    tokenFill: '#e11d48',
  },
  green: {
    primary: '#10b981',
    secondary: '#047857',
    light: '#d1fae5',
    bg: '#ecfdf5',
    border: '#059669',
    glow: 'rgba(16, 185, 129, 0.4)',
    text: 'text-emerald-600',
    bgClass: 'bg-emerald-500',
    borderClass: 'border-emerald-500',
    tokenFill: '#059669',
  },
  yellow: {
    primary: '#f59e0b',
    secondary: '#d97706',
    light: '#fef3c7',
    bg: '#fffbeb',
    border: '#d97706',
    glow: 'rgba(245, 158, 11, 0.4)',
    text: 'text-amber-600',
    bgClass: 'bg-amber-500',
    borderClass: 'border-amber-500',
    tokenFill: '#d97706',
  },
  blue: {
    primary: '#3b82f6',
    secondary: '#1d4ed8',
    light: '#dbeafe',
    bg: '#eff6ff',
    border: '#2563eb',
    glow: 'rgba(59, 130, 246, 0.4)',
    text: 'text-blue-600',
    bgClass: 'bg-blue-500',
    borderClass: 'border-blue-500',
    tokenFill: '#2563eb',
  },
};

export const QUICK_EMOJIS = ['🎲', '🔥', '🏆', '😄', '😂', '😱', '👍', '👏', '💔', '🎯', '⚡', '👑'];

export const QUICK_PHRASES = [
  'Good Luck!',
  'Well Played!',
  'Nice Roll!',
  'Oops! Sorry!',
  'Please Hurry Up ⏳',
  'Almost Home! 🏆',
  'Watch Out! 🎯',
  'Rematch after this?',
];

export const RANK_TIERS = [
  { name: 'Bronze', minElo: 0, maxElo: 1099, color: '#cd7f32', badge: '🥉' },
  { name: 'Silver', minElo: 1100, maxElo: 1299, color: '#94a3b8', badge: '🥈' },
  { name: 'Gold', minElo: 1300, maxElo: 1499, color: '#f59e0b', badge: '🥇' },
  { name: 'Platinum', minElo: 1500, maxElo: 1699, color: '#06b6d4', badge: '💎' },
  { name: 'Diamond', minElo: 1700, maxElo: 1899, color: '#8b5cf6', badge: '💠' },
  { name: 'Master', minElo: 1900, maxElo: 2099, color: '#ec4899', badge: '👑' },
  { name: 'Grandmaster', minElo: 2100, maxElo: 9999, color: '#f43f5e', badge: '🌟' },
];

export function getRankTier(elo: number) {
  return RANK_TIERS.find((tier) => elo >= tier.minElo && elo <= tier.maxElo) || RANK_TIERS[0];
}
