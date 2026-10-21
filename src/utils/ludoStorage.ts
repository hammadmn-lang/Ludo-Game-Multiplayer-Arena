import { GameState, SavedGame } from '../types/ludo';

const SAVED_GAME_KEY = 'ludo_saved_game_state';

export function saveActiveGame(gameState: GameState, customTitle?: string): SavedGame {
  const savedGame: SavedGame = {
    id: gameState.gameId,
    savedAt: Date.now(),
    gameState: {
      ...gameState,
      savedAt: Date.now(),
    },
    title: customTitle || `${gameState.mode === 'vs_computer' ? 'VS AI Match' : gameState.mode === 'local_multiplayer' ? 'Local Multiplayer' : 'Online Room'} (${gameState.players.length} Players)`,
  };

  try {
    localStorage.setItem(SAVED_GAME_KEY, JSON.stringify(savedGame));
  } catch (err) {
    console.error('Failed to save game state:', err);
  }

  return savedGame;
}

export function getSavedActiveGame(): SavedGame | null {
  try {
    const raw = localStorage.getItem(SAVED_GAME_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.gameState && !parsed.gameState.isGameOver) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to retrieve saved game:', err);
  }
  return null;
}

export function clearSavedActiveGame(): void {
  try {
    localStorage.removeItem(SAVED_GAME_KEY);
  } catch (err) {
    console.error('Failed to remove saved game:', err);
  }
}
