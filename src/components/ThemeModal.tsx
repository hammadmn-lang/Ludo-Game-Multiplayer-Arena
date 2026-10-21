import React, { useState } from 'react';
import {
  BoardThemeId,
  TokenSkinId,
  DiceSkinId,
  ThemeSettings,
} from '../types/theme';
import {
  BOARD_THEMES,
  TOKEN_SKINS,
  DICE_SKINS,
  getBoardTheme,
  getTokenSkin,
  getDiceSkin,
} from '../utils/themeData';
import { TokenView } from './TokenView';
import { X, Check, Palette, Sparkles, Dices, Shield, Eye } from 'lucide-react';
import { PlayerColor } from '../types/ludo';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: ThemeSettings;
  onSaveSettings: (settings: ThemeSettings) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSaveSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'board' | 'token' | 'dice'>('board');
  const [tempSettings, setTempSettings] = useState<ThemeSettings>(currentSettings);
  const [previewDiceValue, setPreviewDiceValue] = useState<number>(6);
  const [isRollingPreview, setIsRollingPreview] = useState(false);

  // Sync temp settings when opening
  React.useEffect(() => {
    if (isOpen) {
      setTempSettings(currentSettings);
    }
  }, [isOpen, currentSettings]);

  if (!isOpen) return null;

  const currentBoardDef = getBoardTheme(tempSettings.boardTheme);
  const currentTokenDef = getTokenSkin(tempSettings.tokenSkin);
  const currentDiceDef = getDiceSkin(tempSettings.diceSkin);

  const handleRollPreviewDice = () => {
    if (isRollingPreview) return;
    setIsRollingPreview(true);
    let rolls = 0;
    const interval = setInterval(() => {
      setPreviewDiceValue(Math.floor(Math.random() * 6) + 1);
      rolls++;
      if (rolls > 7) {
        clearInterval(interval);
        setIsRollingPreview(false);
      }
    }, 60);
  };

  const handleApply = () => {
    onSaveSettings(tempSettings);
    onClose();
  };

  const colors: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn"
      id="theme-modal-overlay"
    >
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
                Themes & Skins Studio
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Customizer
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Personalize your championship board, tokens, and animated dice
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            id="btn-close-themes"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Interactive Preview Bar */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-b border-slate-800/80">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Live Board & Token Preview */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Current Loadout
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs font-bold text-white">
                    {currentBoardDef.name}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs font-bold text-indigo-300">
                    {currentTokenDef.name}
                  </span>
                </div>
              </div>

              {/* 4 Themed Tokens Preview */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
                {colors.map((c) => (
                  <div key={`preview-token-${c}`} className="w-7 h-7 sm:w-8 sm:h-8">
                    <TokenView color={c} skinId={tempSettings.tokenSkin} />
                  </div>
                ))}
              </div>
            </div>

            {/* Live Dice Roller Test */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-slate-400 hidden sm:inline">
                Test Dice:
              </span>
              <button
                onClick={handleRollPreviewDice}
                disabled={isRollingPreview}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
                title="Click to roll and preview dice animation"
              >
                {/* Dice Mini Cube */}
                <div
                  className={`w-9 h-9 p-1 rounded-lg grid grid-cols-3 grid-rows-3 gap-0.5 items-center justify-items-center transition-transform ${
                    isRollingPreview ? 'animate-spin' : 'group-hover:scale-105'
                  } ${currentDiceDef.cubeClass}`}
                >
                  {/* Pip render for preview */}
                  {previewDiceValue === 1 && (
                    <div
                      className="col-start-2 row-start-2 w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: currentDiceDef.pipColorAccent,
                        boxShadow: currentDiceDef.pipShadow,
                      }}
                    />
                  )}
                  {previewDiceValue >= 2 && previewDiceValue !== 3 && previewDiceValue !== 5 && (
                    <>
                      <div
                        className="col-start-1 row-start-1 w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            previewDiceValue === 6
                              ? currentDiceDef.pipColorEmerald
                              : currentDiceDef.pipColorPrimary,
                          boxShadow: currentDiceDef.pipShadow,
                        }}
                      />
                      <div
                        className="col-start-3 row-start-3 w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            previewDiceValue === 6
                              ? currentDiceDef.pipColorEmerald
                              : currentDiceDef.pipColorPrimary,
                          boxShadow: currentDiceDef.pipShadow,
                        }}
                      />
                    </>
                  )}
                  {(previewDiceValue === 3 || previewDiceValue === 5) && (
                    <>
                      <div
                        className="col-start-1 row-start-1 w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: currentDiceDef.pipColorPrimary,
                          boxShadow: currentDiceDef.pipShadow,
                        }}
                      />
                      <div
                        className="col-start-2 row-start-2 w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor: currentDiceDef.pipColorAccent,
                          boxShadow: currentDiceDef.pipShadow,
                        }}
                      />
                      <div
                        className="col-start-3 row-start-3 w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: currentDiceDef.pipColorPrimary,
                          boxShadow: currentDiceDef.pipShadow,
                        }}
                      />
                    </>
                  )}
                  {previewDiceValue >= 4 && (
                    <>
                      <div
                        className="col-start-3 row-start-1 w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            previewDiceValue === 6
                              ? currentDiceDef.pipColorEmerald
                              : currentDiceDef.pipColorPrimary,
                          boxShadow: currentDiceDef.pipShadow,
                        }}
                      />
                      <div
                        className="col-start-1 row-start-3 w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            previewDiceValue === 6
                              ? currentDiceDef.pipColorEmerald
                              : currentDiceDef.pipColorPrimary,
                          boxShadow: currentDiceDef.pipShadow,
                        }}
                      />
                    </>
                  )}
                  {previewDiceValue === 6 && (
                    <>
                      <div
                        className="col-start-1 row-start-2 w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: currentDiceDef.pipColorEmerald,
                          boxShadow: currentDiceDef.pipShadow,
                        }}
                      />
                      <div
                        className="col-start-3 row-start-2 w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: currentDiceDef.pipColorEmerald,
                          boxShadow: currentDiceDef.pipShadow,
                        }}
                      />
                    </>
                  )}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>Roll</span>
                    <span className="text-[10px] text-indigo-400">🎲</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {currentDiceDef.name}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-900/80 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('board')}
            id="tab-theme-board"
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'board'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Board Themes ({BOARD_THEMES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('token')}
            id="tab-theme-tokens"
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'token'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Token Skins ({TOKEN_SKINS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('dice')}
            id="tab-theme-dice"
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'dice'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Dices className="w-4 h-4" />
            <span>Dice Skins ({DICE_SKINS.length})</span>
          </button>
        </div>

        {/* Tab Content List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {/* TAB 1: BOARD THEMES */}
          {activeTab === 'board' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {BOARD_THEMES.map((theme) => {
                const isSelected = tempSettings.boardTheme === theme.id;
                const isCurrentEquipped = currentSettings.boardTheme === theme.id;

                return (
                  <div
                    key={theme.id}
                    onClick={() =>
                      setTempSettings((prev) => ({ ...prev, boardTheme: theme.id }))
                    }
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-950/30 border-indigo-500 shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div>
                      {/* Top Row with color swatches & badge */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          {theme.previewColors.map((color, idx) => (
                            <span
                              key={idx}
                              className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>

                        {isSelected ? (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500 text-white flex items-center gap-1 shadow">
                            <Check className="w-3 h-3" /> Selected
                          </span>
                        ) : isCurrentEquipped ? (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                            Equipped
                          </span>
                        ) : null}
                      </div>

                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        {theme.name}
                      </h4>
                      <p className="text-[11px] text-amber-400 font-semibold mb-1">
                        {theme.tagline}
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {theme.description}
                      </p>
                    </div>

                    {/* Features list */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300">
                      <span>Safe Star: {theme.safeCellSymbol}</span>
                      <span>Center: {theme.centerTriangleColors.centerIcon}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: TOKEN SKINS */}
          {activeTab === 'token' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {TOKEN_SKINS.map((skin) => {
                const isSelected = tempSettings.tokenSkin === skin.id;
                const isCurrentEquipped = currentSettings.tokenSkin === skin.id;

                return (
                  <div
                    key={skin.id}
                    onClick={() =>
                      setTempSettings((prev) => ({ ...prev, tokenSkin: skin.id }))
                    }
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-950/30 border-indigo-500 shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div>
                      {/* Top Row with token previews */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
                          {colors.map((c) => (
                            <div key={`token-row-${c}`} className="w-6 h-6">
                              <TokenView color={c} skinId={skin.id} />
                            </div>
                          ))}
                        </div>

                        {isSelected ? (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500 text-white flex items-center gap-1 shadow">
                            <Check className="w-3 h-3" /> Selected
                          </span>
                        ) : isCurrentEquipped ? (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                            Equipped
                          </span>
                        ) : null}
                      </div>

                      <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                        <span>{skin.previewIcon}</span>
                        <span>{skin.name}</span>
                      </h4>
                      <p className="text-[11px] text-indigo-400 font-semibold mb-1">
                        {skin.tagline}
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {skin.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>4-Color Harmonized</span>
                      <span className="text-indigo-400 font-medium">Equip Instantly</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: DICE SKINS */}
          {activeTab === 'dice' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {DICE_SKINS.map((dice) => {
                const isSelected = tempSettings.diceSkin === dice.id;
                const isCurrentEquipped = currentSettings.diceSkin === dice.id;

                return (
                  <div
                    key={dice.id}
                    onClick={() =>
                      setTempSettings((prev) => ({ ...prev, diceSkin: dice.id }))
                    }
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-950/30 border-indigo-500 shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div>
                      {/* Top Row with Dice visual preview */}
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-9 h-9 p-1 rounded-lg grid grid-cols-3 grid-rows-3 gap-0.5 items-center justify-items-center ${dice.cubeClass}`}
                        >
                          <div
                            className="col-start-1 row-start-1 w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: dice.pipColorEmerald,
                              boxShadow: dice.pipShadow,
                            }}
                          />
                          <div
                            className="col-start-1 row-start-2 w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: dice.pipColorEmerald,
                              boxShadow: dice.pipShadow,
                            }}
                          />
                          <div
                            className="col-start-1 row-start-3 w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: dice.pipColorEmerald,
                              boxShadow: dice.pipShadow,
                            }}
                          />
                          <div
                            className="col-start-3 row-start-1 w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: dice.pipColorEmerald,
                              boxShadow: dice.pipShadow,
                            }}
                          />
                          <div
                            className="col-start-3 row-start-2 w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: dice.pipColorEmerald,
                              boxShadow: dice.pipShadow,
                            }}
                          />
                          <div
                            className="col-start-3 row-start-3 w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: dice.pipColorEmerald,
                              boxShadow: dice.pipShadow,
                            }}
                          />
                        </div>

                        {isSelected ? (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500 text-white flex items-center gap-1 shadow">
                            <Check className="w-3 h-3" /> Selected
                          </span>
                        ) : isCurrentEquipped ? (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                            Equipped
                          </span>
                        ) : null}
                      </div>

                      <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                        <span>{dice.previewIcon}</span>
                        <span>{dice.name}</span>
                      </h4>
                      <p className="text-[11px] text-amber-400 font-semibold mb-1">
                        {dice.tagline}
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {dice.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Unique Glow & Pips</span>
                      <span className="text-indigo-400 font-medium">Equip Instantly</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Themes are saved automatically to your profile loadout.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              id="btn-apply-theme-settings"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Apply Loadout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
