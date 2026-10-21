import {
  PlayerColor,
  Token,
  Player,
  GameState,
  MoveOption,
  GameMode,
  AIDifficulty,
} from '../types/ludo';
import {
  TRACK_COORDINATES,
  HOME_PATHS,
  GOAL_COORDINATES,
  YARD_POSITIONS,
  COLOR_OFFSETS,
  SAFE_TRACK_INDICES,
  GridCoord,
} from './ludoConstants';

export const TOTAL_PATH_STEPS = 56; // 0..50 on track (51 steps) + 51..55 on home path (5 steps) + 56 (Goal)

export function getInitialYardTokenPosition(color: PlayerColor, index: number): GridCoord {
  return YARD_POSITIONS[color][index] || { x: 0, y: 0 };
}

export function getTokenBoardCoordinate(token: Token): GridCoord {
  if (token.state === 'home' || token.step < 0) {
    return getInitialYardTokenPosition(token.color, token.id);
  }

  if (token.state === 'finished' || token.step >= TOTAL_PATH_STEPS) {
    return GOAL_COORDINATES[token.color];
  }

  if (token.step <= 50) {
    const trackIndex = (COLOR_OFFSETS[token.color] + token.step) % 52;
    return TRACK_COORDINATES[trackIndex];
  }

  // In home colored stretch (step 51..55 -> indices 0..4)
  const homeIndex = token.step - 51;
  const path = HOME_PATHS[token.color];
  return path[homeIndex] || GOAL_COORDINATES[token.color];
}

export function createInitialTokens(color: PlayerColor): Token[] {
  return [0, 1, 2, 3].map((id) => ({
    id,
    color,
    step: -1,
    position: getInitialYardTokenPosition(color, id),
    state: 'home',
  }));
}

export function createPlayers(
  mode: GameMode,
  playerConfigs: { name: string; color: PlayerColor; isAI: boolean; aiDifficulty?: AIDifficulty; avatar: string }[]
): Player[] {
  return playerConfigs.map((cfg, idx) => ({
    id: `player_${idx}_${cfg.color}`,
    name: cfg.name,
    color: cfg.color,
    isAI: cfg.isAI,
    aiDifficulty: cfg.aiDifficulty || 'medium',
    avatar: cfg.avatar,
    tokens: createInitialTokens(cfg.color),
    hasWon: false,
    consecutiveSixes: 0,
  }));
}

export function getTrackIndex(token: Token): number | null {
  if (token.step >= 0 && token.step <= 50) {
    return (COLOR_OFFSETS[token.color] + token.step) % 52;
  }
  return null;
}

export function isSafeTrackSquare(trackIndex: number): boolean {
  return SAFE_TRACK_INDICES.includes(trackIndex);
}

export function calculateValidMoves(player: Player, diceValue: number, allPlayers: Player[]): MoveOption[] {
  const validMoves: MoveOption[] = [];

  player.tokens.forEach((token) => {
    // If token in yard: can only move out on a 6
    if (token.state === 'home' || token.step === -1) {
      if (diceValue === 6) {
        // Can open token to step 0
        validMoves.push({
          tokenId: token.id,
          fromStep: -1,
          toStep: 0,
          willCapture: false,
          willFinish: false,
        });
      }
      return;
    }

    // If already finished
    if (token.state === 'finished' || token.step >= TOTAL_PATH_STEPS) {
      return;
    }

    const nextStep = token.step + diceValue;

    // Check if move exceeds goal
    if (nextStep > TOTAL_PATH_STEPS) {
      return;
    }

    let willCapture = false;
    let willFinish = nextStep === TOTAL_PATH_STEPS;

    // If still on common track, check capture
    if (nextStep <= 50) {
      const nextTrackIndex = (COLOR_OFFSETS[token.color] + nextStep) % 52;
      const isSafe = isSafeTrackSquare(nextTrackIndex);

      if (!isSafe) {
        // Check if landing on opponent
        allPlayers.forEach((otherPlayer) => {
          if (otherPlayer.color !== player.color) {
            otherPlayer.tokens.forEach((otherToken) => {
              const otherTrackIdx = getTrackIndex(otherToken);
              if (otherTrackIdx !== null && otherTrackIdx === nextTrackIndex) {
                willCapture = true;
              }
            });
          }
        });
      }
    }

    validMoves.push({
      tokenId: token.id,
      fromStep: token.step,
      toStep: nextStep,
      willCapture,
      willFinish,
    });
  });

  return validMoves;
}

export function executeMove(
  currentState: GameState,
  tokenId: number
): {
  nextState: GameState;
  capturedPlayer?: Player;
  capturedToken?: Token;
  didFinish: boolean;
  givesExtraTurn: boolean;
} {
  const state = JSON.parse(JSON.stringify(currentState)) as GameState;
  const player = state.players[state.activePlayerIndex];
  const dice = state.diceValue || 0;
  const token = player.tokens.find((t) => t.id === tokenId);

  if (!token) {
    return { nextState: state, didFinish: false, givesExtraTurn: false };
  }

  let givesExtraTurn = false;
  let didFinish = false;
  let capturedPlayer: Player | undefined;
  let capturedToken: Token | undefined;

  // Case 1: Token in yard coming out
  if (token.step === -1 && dice === 6) {
    token.step = 0;
    token.state = 'path';
    token.position = getTokenBoardCoordinate(token);
    givesExtraTurn = true; // Rolling 6 gives extra turn
  } else if (token.step >= 0) {
    // Case 2: Moving on track or home stretch
    const nextStep = token.step + dice;

    if (nextStep === TOTAL_PATH_STEPS) {
      token.step = TOTAL_PATH_STEPS;
      token.state = 'finished';
      token.position = GOAL_COORDINATES[token.color];
      didFinish = true;
      givesExtraTurn = true; // Finishing a token awards an extra turn!
    } else if (nextStep > 50) {
      token.step = nextStep;
      token.state = 'goal_path';
      token.position = getTokenBoardCoordinate(token);
      if (dice === 6) givesExtraTurn = true;
    } else {
      token.step = nextStep;
      token.state = 'path';
      token.position = getTokenBoardCoordinate(token);
      if (dice === 6) givesExtraTurn = true;

      // Check capture
      const destTrackIdx = (COLOR_OFFSETS[token.color] + nextStep) % 52;
      if (!isSafeTrackSquare(destTrackIdx)) {
        state.players.forEach((otherPlayer) => {
          if (otherPlayer.color !== player.color) {
            otherPlayer.tokens.forEach((otherToken) => {
              const otherIdx = getTrackIndex(otherToken);
              if (otherIdx !== null && otherIdx === destTrackIdx) {
                // Capture!
                capturedPlayer = otherPlayer;
                capturedToken = otherToken;
                otherToken.step = -1;
                otherToken.state = 'home';
                otherToken.position = getInitialYardTokenPosition(otherPlayer.color, otherToken.id);
                givesExtraTurn = true; // Capturing awards an extra turn!
              }
            });
          }
        });
      }
    }
  }

  // Check if player has finished all 4 tokens
  const allTokensFinished = player.tokens.every((t) => t.state === 'finished' || t.step >= TOTAL_PATH_STEPS);
  if (allTokensFinished && !player.hasWon) {
    player.hasWon = true;
    if (!state.winnerOrder.includes(player.id)) {
      state.winnerOrder.push(player.id);
      player.rank = state.winnerOrder.length;
    }
  }

  // Check if game over (e.g., in 2 player mode when 1 wins, or in 3/4 player mode when N-1 win)
  const activeUnfinishedPlayers = state.players.filter((p) => !p.hasWon);
  if (activeUnfinishedPlayers.length <= 1) {
    state.isGameOver = true;
    // Assign remaining player rank
    activeUnfinishedPlayers.forEach((p) => {
      if (!state.winnerOrder.includes(p.id)) {
        state.winnerOrder.push(p.id);
        p.rank = state.winnerOrder.length;
      }
    });
  }

  // Record last move
  state.lastMoveInfo = {
    playerId: player.id,
    playerName: player.name,
    color: player.color,
    tokenId,
    capturedPlayerId: capturedPlayer?.id,
    capturedColor: capturedPlayer?.color,
    roll: dice,
  };

  // Turn transitions:
  state.hasRolled = false;
  state.diceValue = null;
  state.validMoves = [];

  if (!givesExtraTurn || player.hasWon) {
    player.consecutiveSixes = 0;
    state.activePlayerIndex = getNextActivePlayerIndex(state.players, state.activePlayerIndex);
  } else {
    // Player keeps turn
    if (dice !== 6) {
      player.consecutiveSixes = 0;
    }
  }

  return {
    nextState: state,
    capturedPlayer,
    capturedToken,
    didFinish,
    givesExtraTurn,
  };
}

export function getNextActivePlayerIndex(players: Player[], currentIndex: number): number {
  const total = players.length;
  for (let i = 1; i <= total; i++) {
    const nextIdx = (currentIndex + i) % total;
    if (!players[nextIdx].hasWon) {
      return nextIdx;
    }
  }
  return currentIndex;
}

export function pickAIMove(player: Player, validMoves: MoveOption[], allPlayers: Player[]): MoveOption | null {
  if (validMoves.length === 0) return null;
  if (validMoves.length === 1) return validMoves[0];

  const diff = player.aiDifficulty || 'medium';

  if (diff === 'easy') {
    const randomIndex = Math.floor(Math.random() * validMoves.length);
    return validMoves[randomIndex];
  }

  // Medium / Hard evaluation
  let bestMove = validMoves[0];
  let bestScore = -99999;

  validMoves.forEach((move) => {
    let score = 0;

    // 1. Finishing is top priority
    if (move.willFinish) {
      score += 2000;
    }

    // 2. Capturing opponent
    if (move.willCapture) {
      score += 1200;
    }

    // 3. Opening token out of home yard
    if (move.fromStep === -1 && move.toStep === 0) {
      score += 700;
    }

    // 4. Moving into home colored safety path
    if (move.toStep > 50) {
      score += 400 + (move.toStep - 50) * 40;
    }

    // 5. Landing on a safe star square on track
    if (move.toStep <= 50) {
      const destTrackIdx = (COLOR_OFFSETS[player.color] + move.toStep) % 52;
      if (isSafeTrackSquare(destTrackIdx)) {
        score += 350;
      }
    }

    // 6. Hard AI Danger & Hunter calculations
    if (diff === 'hard') {
      // Bonus for advancing tokens that are further along
      score += move.toStep * 5;

      if (move.toStep <= 50) {
        const destTrackIdx = (COLOR_OFFSETS[player.color] + move.toStep) % 52;

        if (!isSafeTrackSquare(destTrackIdx)) {
          // Check if any opponent is behind us (within 1..6 steps)
          allPlayers.forEach((other) => {
            if (other.color !== player.color) {
              other.tokens.forEach((otherToken) => {
                const otherTrackIdx = getTrackIndex(otherToken);
                if (otherTrackIdx !== null) {
                  const distance = (destTrackIdx - otherTrackIdx + 52) % 52;
                  if (distance >= 1 && distance <= 6) {
                    score -= 300; // Danger penalty
                  }
                }
              });
            }
          });
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  });

  return bestMove;
}
