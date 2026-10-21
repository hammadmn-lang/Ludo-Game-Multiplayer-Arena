export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export type GameMode = 'vs_computer' | 'local_multiplayer' | 'online_multiplayer';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export type TokenState = 'home' | 'path' | 'goal_path' | 'finished';

export interface Token {
  id: number; // 0, 1, 2, 3
  color: PlayerColor;
  step: number; // -1: in yard (home), 0..51: on common track, 52..56: in home path, 57: finished
  position: { x: number; y: number }; // 15x15 grid coords
  state: TokenState;
}

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  isAI: boolean;
  aiDifficulty?: AIDifficulty;
  isReady?: boolean;
  avatar: string;
  tokens: Token[];
  hasWon: boolean;
  rank?: number; // 1st, 2nd, 3rd, 4th
  consecutiveSixes: number;
}

export interface MoveOption {
  tokenId: number;
  fromStep: number;
  toStep: number;
  willCapture?: boolean;
  willFinish?: boolean;
}

export interface GameState {
  gameId: string;
  mode: GameMode;
  players: Player[];
  activePlayerIndex: number;
  diceValue: number | null;
  isRolling: boolean;
  hasRolled: boolean;
  validMoves: MoveOption[];
  turnTimeLeft: number;
  turnDuration: number;
  turnTimerEnabled?: boolean; // If false, no turn countdown/timeout auto-pass
  consecutiveSixes: number;
  winnerOrder: string[]; // Player IDs in order of finishing
  isGameOver: boolean;
  savedAt?: number;
  lastMoveInfo?: {
    playerId: string;
    playerName: string;
    color: PlayerColor;
    tokenId: number;
    capturedPlayerId?: string;
    capturedColor?: PlayerColor;
    roll: number;
  };
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor?: PlayerColor;
  text: string;
  isEmoji?: boolean;
  timestamp: number;
}

export interface UserStats {
  totalMatches: number;
  wins: number;
  losses: number;
  secondPlaces: number;
  winStreak: number;
  bestWinStreak: number;
  tokensCaptured: number;
  tokensLost: number;
  sixesRolled: number;
  eloRating: number;
}

export interface MatchRecord {
  id: string;
  date: string;
  mode: GameMode;
  playersCount: number;
  playerColor: PlayerColor;
  rank: number; // 1 = Won, 2 = 2nd, etc. (0 or 99 = Forfeit/Disconnected)
  status?: 'completed' | 'forfeited' | 'disconnected';
  durationSeconds: number;
  tokensCaptured: number;
  opponents: { name: string; color: PlayerColor; isAI: boolean }[];
  eloChange: number;
  notes?: string;
}

export interface TeamInfo {
  id: string;
  name: string;
  tag: string; // e.g. "TITAN", "ROYAL"
  avatar: string;
  role: 'leader' | 'member';
  memberCount: number;
  totalElo: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  avatar: string;
  country?: string;
  location?: string;
  phoneNumber?: string;
  contacts?: string[]; // Array of friend user IDs or phone numbers
  team?: TeamInfo;
  blockedUsers?: string[]; // List of user IDs blocked from chatting/inviting
  mutedUsers?: string[]; // List of user IDs muted in match chat
  createdAt: string;
  stats: UserStats;
  matches: MatchRecord[];
}

export interface ContactUser {
  id: string;
  username: string;
  avatar: string;
  country?: string;
  location?: string;
  phoneNumber?: string;
  eloRating: number;
  isOnline: boolean;
  isInApp: boolean;
  isPlaying?: boolean;
  currentMode?: string;
  currentRoomCode?: string;
  lastSeen?: string;
}

export interface ContactMatchResult {
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  matchedUser: ContactUser;
  isPlaying: boolean;
  isOnline: boolean;
  currentMode?: string;
  currentRoomCode?: string;
}

export interface SavedGame {
  id: string;
  savedAt: number;
  gameState: GameState;
  title: string;
}

export interface OnlineRoom {
  code: string;
  hostId: string;
  playersCount: number;
  players: {
    id: string;
    username: string;
    avatar: string;
    color: PlayerColor;
    isHost: boolean;
    isReady: boolean;
    eloRating: number;
  }[];
  state: 'waiting' | 'in_game' | 'finished';
  gameState?: GameState;
  createdAt: number;
}
