import { PlayerColor } from './ludo';

export type BoardThemeId = 'classic' | 'wooden' | 'cyberpunk' | 'marble' | 'midnight';
export type TokenSkinId = 'classic' | 'crown' | 'cyber' | 'mascot' | 'gold_ingot';
export type DiceSkinId = 'classic' | 'vegas_gold' | 'cyber_obsidian' | 'amethyst_gem';

export interface ThemeSettings {
  boardTheme: BoardThemeId;
  tokenSkin: TokenSkinId;
  diceSkin: DiceSkinId;
}

export interface BoardThemeDef {
  id: BoardThemeId;
  name: string;
  tagline: string;
  description: string;
  previewColors: string[];
  boardOuterClass: string;
  boardBaseClass: string;
  yardBgs: Record<PlayerColor, string>;
  yardPadBgs: Record<PlayerColor, string>;
  trackCellBg: string;
  trackCellBorder: string;
  trackCellTextColor: string;
  safeCellSymbol: string;
  safeCellColor: string;
  startCellBgs: Record<PlayerColor, string>;
  homePathBgs: Record<PlayerColor, string>;
  centerTriangleColors: {
    red: string;
    green: string;
    yellow: string;
    blue: string;
    stroke: string;
    centerCircleFill: string;
    centerCircleStroke: string;
    centerIcon: string;
  };
}

export interface TokenSkinDef {
  id: TokenSkinId;
  name: string;
  tagline: string;
  description: string;
  previewIcon: string;
  mascotIcons?: Record<PlayerColor, string>;
  ringBorderClass?: string;
  centerBadgeClass?: string;
}

export interface DiceSkinDef {
  id: DiceSkinId;
  name: string;
  tagline: string;
  description: string;
  previewIcon: string;
  cubeClass: string;
  pipColorPrimary: string;
  pipColorAccent: string;
  pipColorEmerald: string;
  pipShadow?: string;
}
