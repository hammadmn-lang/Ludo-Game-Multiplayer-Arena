import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameState,
  Player,
  PlayerColor,
  GameMode,
  AIDifficulty,
  UserProfile,
  ChatMessage,
  MoveOption,
  SavedGame,
} from './types/ludo';
import {
  createPlayers,
  calculateValidMoves,
  executeMove,
  pickAIMove,
  getNextActivePlayerIndex,
} from './utils/ludoEngine';
import { sounds } from './utils/soundEffects';
import { notificationService } from './utils/notifications';
import { saveActiveGame, getSavedActiveGame, clearSavedActiveGame } from './utils/ludoStorage';
import { HeaderNav } from './components/HeaderNav';
import { LobbyView } from './components/LobbyView';
import { LudoBoard } from './components/LudoBoard';
import { DiceRoller } from './components/DiceRoller';
import { PlayerCard } from './components/PlayerCard';
import { InGameChat } from './components/InGameChat';
import { VictoryModal } from './components/VictoryModal';
import { AuthModal } from './components/AuthModal';
import { ProfileView } from './components/ProfileView';
import { LeaderboardView } from './components/LeaderboardView';
import { WaitingRoom } from './components/WaitingRoom';
import { RulesModal } from './components/RulesModal';
import { ContactsModal } from './components/ContactsModal';
import { ThemeModal } from './components/ThemeModal';
import { GoogleAdsBanner } from './components/GoogleAdsBanner';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { ScreenshotsModal } from './components/ScreenshotsModal';
import { PrivacyPolicyView } from './components/PrivacyPolicyView';
import { DeleteAccountView } from './components/DeleteAccountView';
import { DataSafetyView } from './components/DataSafetyView';
import { fetchCurrentProfile } from './utils/authService';
import { ThemeSettings } from './types/theme';
import { getSavedThemeSettings, saveThemeSettings } from './utils/themeData';
import {
  RotateCcw,
  Home,
  Sparkles,
  AlertCircle,
  Gamepad2,
  X,
  Check,
  Clock,
  LogOut,
  Flag,
  ShieldAlert,
  Palette,
  ShieldCheck,
  Smartphone,
  Zap,
  Play,
  BellRing,
  Trash2,
  VolumeX,
} from 'lucide-react';

export default function App() {
  // Navigation & User State
  const [currentScreen, setCurrentScreen] = useState<
    'lobby' | 'game' | 'waiting_room' | 'leaderboard' | 'profile' | 'privacy' | 'delete-account' | 'data-safety'
  >('lobby');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authDefaultToRegister, setAuthDefaultToRegister] = useState(false);

  const handleOpenAuth = (defaultToRegister = false) => {
    setAuthDefaultToRegister(defaultToRegister);
    setIsAuthModalOpen(true);
  };
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isPrivacyPolicyModalOpen, setIsPrivacyPolicyModalOpen] = useState(false);
  const [isScreenshotsModalOpen, setIsScreenshotsModalOpen] = useState(false);
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(getSavedThemeSettings);
  const [isMuted, setIsMuted] = useState(false);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);

  // Chat controls state (Option to stop chat / pause chat)
  const [isChatStopped, setIsChatStopped] = useState<boolean>(() => {
    return localStorage.getItem('ludo_chat_stopped') === 'true';
  });

  const handleToggleStopChat = () => {
    setIsChatStopped((prev) => {
      const next = !prev;
      localStorage.setItem('ludo_chat_stopped', String(next));
      return next;
    });
  };

  const handleSaveThemeSettings = (newSettings: ThemeSettings) => {
    setThemeSettings(newSettings);
    saveThemeSettings(newSettings);
  };

  // Active Game State & Persistence
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [savedGame, setSavedGame] = useState<SavedGame | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeReactions, setActiveReactions] = useState<
    Record<string, { text: string; isEmoji: boolean; id: string }>
  >({});
  const [lastEloChange, setLastEloChange] = useState<number>(+20);
  const [gameStartTime, setGameStartTime] = useState<number>(Date.now());
  const [matchTokensCaptured, setMatchTokensCaptured] = useState<number>(0);
  const [matchSixesRolled, setMatchSixesRolled] = useState<number>(0);

  // Online Multiplayer & Contacts State
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [onlineRoomCode, setOnlineRoomCode] = useState<string | null>(null);
  const [onlinePlayers, setOnlinePlayers] = useState<
    { id: string; username: string; avatar: string; color: PlayerColor; eloRating: number }[]
  >([]);
  const [isHost, setIsHost] = useState(false);
  const [onlineMaxPlayers, setOnlineMaxPlayers] = useState(4);
  const [contactOnlineToast, setContactOnlineToast] = useState<{
    username: string;
    country?: string;
  } | null>(null);
  const [contactPlayingToast, setContactPlayingToast] = useState<{
    username: string;
    mode?: string;
    roomCode?: string;
  } | null>(null);
  const [incomingInvite, setIncomingInvite] = useState<{
    senderName: string;
    roomCode: string;
    mode: string;
  } | null>(null);
  const [isForfeitModalOpen, setIsForfeitModalOpen] = useState(false);
  const [penaltyToast, setPenaltyToast] = useState<{
    title: string;
    description: string;
    type: 'forfeit' | 'disconnect';
    penalty: number;
  } | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Sync refs for async/socket handlers
  const userRef = useRef<UserProfile | null>(user);
  const authTokenRef = useRef<string | null>(authToken);
  const gameStateRef = useRef<GameState | null>(gameState);

  useEffect(() => {
    userRef.current = user;
    authTokenRef.current = authToken;
    gameStateRef.current = gameState;
  }, [user, authToken, gameState]);

  // Auto-pass & turn timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check saved authentication & cached game on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('ludo_auth_token');
    const savedUser = localStorage.getItem('ludo_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {}
    }
    if (savedToken) {
      setAuthToken(savedToken);
      fetchCurrentProfile(savedToken).then((profile) => {
        if (profile) {
          setUser(profile);
          localStorage.setItem('ludo_user', JSON.stringify(profile));
        }
      });
    }

    // Check if there is an existing saved game
    const cached = getSavedActiveGame();
    if (cached && !cached.gameState.isGameOver) {
      setSavedGame(cached);
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setHasNotificationPermission(Notification.permission === 'granted');
    }

    // Google Play Policy & Erasure direct URL route handler
    const handleUrlRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/privacy' || path === '/privacy.html' || hash === '#privacy') {
        setCurrentScreen('privacy');
      } else if (path === '/delete-account' || path === '/delete-account.html' || hash === '#delete-account') {
        setCurrentScreen('delete-account');
      } else if (
        path === '/data-safety' ||
        path === '/data-safety.html' ||
        path === '/data' ||
        path === '/data.html' ||
        hash === '#data-safety' ||
        hash === '#data'
      ) {
        setCurrentScreen('data-safety');
      }
    };

    handleUrlRoute();
    window.addEventListener('hashchange', handleUrlRoute);
    window.addEventListener('popstate', handleUrlRoute);

    return () => {
      window.removeEventListener('hashchange', handleUrlRoute);
      window.removeEventListener('popstate', handleUrlRoute);
    };
  }, []);

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    sounds.setMuted(nextMute);
  };

  const handleRequestNotifications = async () => {
    const granted = await notificationService.requestPermission();
    setHasNotificationPermission(granted);
  };

  const handleAuthSuccess = (authUser: UserProfile, token: string) => {
    setUser(authUser);
    setAuthToken(token);
    localStorage.setItem('ludo_auth_token', token);
    localStorage.setItem('ludo_user', JSON.stringify(authUser));

    // User requirement: "once logon, user should land on home page"
    setCurrentScreen('lobby');
    window.location.hash = '';

    // Broadcast identity over WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          event: 'identify_user',
          payload: { user: authUser },
        })
      );
    }
  };

  // ================= WEBSOCKET REAL-TIME CONNECTION =================
  const connectWebSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return wsRef.current;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = (import.meta.env.VITE_WS_URL as string | undefined) || `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (user) {
        ws.send(
          JSON.stringify({
            event: 'identify_user',
            payload: { user },
          })
        );
      }
    };

    ws.onmessage = (event) => {
      try {
        const { event: ev, payload } = JSON.parse(event.data);

        if (ev === 'room_created') {
          setOnlineRoomCode(payload.code);
          setOnlinePlayers(payload.players);
          setIsHost(true);
          setOnlineMaxPlayers(payload.playersCount);
          setCurrentScreen('waiting_room');
        } else if (ev === 'player_joined') {
          setOnlinePlayers(payload.players);
        } else if (ev === 'match_found') {
          setIsMatchmaking(false);
          setOnlineRoomCode(payload.code);
          setOnlinePlayers(payload.players);
          setIsHost(false);
          setOnlineMaxPlayers(payload.players.length);
          setCurrentScreen('waiting_room');
        } else if (ev === 'game_started') {
          setGameState(payload.gameState);
          setGameStartTime(Date.now());
          setCurrentScreen('game');
        } else if (ev === 'game_state_updated') {
          setGameState(payload.gameState);
        } else if (ev === 'chat_received') {
          // If sender is blocked by current user, suppress message and reactions completely
          const blocked = userRef.current?.blockedUsers || [];
          if (payload.senderId && blocked.includes(payload.senderId)) {
            return;
          }
          setChatMessages((prev) => [...prev, payload]);
          if (!isChatStopped && payload.senderColor) {
            setActiveReactions((prev) => ({
              ...prev,
              [payload.senderId]: {
                text: payload.text,
                isEmoji: !!payload.isEmoji,
                id: payload.id,
              },
            }));
            setTimeout(() => {
              setActiveReactions((prev) => {
                const next = { ...prev };
                delete next[payload.senderId];
                return next;
              });
            }, 3000);
          }
        } else if (ev === 'contact_online_status') {
          if (payload.status === 'online' || payload.isOnline) {
            setContactOnlineToast({
              username: payload.username,
              country: payload.country,
            });
            notificationService.sendContactOnlineNotification(payload.username, payload.country);
            setTimeout(() => setContactOnlineToast(null), 5000);
          }
        } else if (ev === 'contact_playing') {
          setContactPlayingToast({
            username: payload.username,
            mode: payload.mode,
            roomCode: payload.roomCode,
          });
          notificationService.sendContactPlayingNotification(payload.username, payload.mode, payload.roomCode);
          setTimeout(() => setContactPlayingToast(null), 7000);
        } else if (ev === 'match_invitation') {
          setIncomingInvite({
            senderName: payload.senderName,
            roomCode: payload.roomCode,
            mode: payload.mode || 'Championship Match',
          });
          sounds.playTurnNotification();
        }
      } catch (err) {
        console.error('Socket message parse error:', err);
      }
    };

    ws.onclose = () => {
      // Check if user was abruptly disconnected while in an active online match
      const curGame = gameStateRef.current;
      const curUser = userRef.current;
      const curToken = authTokenRef.current;
      if (curGame && curGame.mode === 'online_multiplayer' && !curGame.isGameOver && curUser && curToken) {
        fetch('/api/matches/disconnect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${curToken}`,
          },
          body: JSON.stringify({ userId: curUser.id }),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.success) {
              setUser((prev) => (prev ? { ...prev, stats: data.stats } : null));
              setPenaltyToast({
                title: 'Match Disconnected',
                description: `Network connection lost. Grace disconnect penalty applied: ${data.eloPenalty} Elo (much lighter than voluntary forfeit).`,
                type: 'disconnect',
                penalty: data.eloPenalty,
              });
            }
          })
          .catch(() => {});
      }
    };

    return ws;
  }, [user]);

  useEffect(() => {
    connectWebSocket();
  }, [connectWebSocket]);

  // Persist active game whenever it progresses
  useEffect(() => {
    if (gameState && !gameState.isGameOver) {
      const modeLabel =
        gameState.mode === 'vs_computer'
          ? 'VS AI Match'
          : gameState.mode === 'local_multiplayer'
          ? 'Pass & Play Match'
          : 'Online Championship';
      saveActiveGame(gameState, `${modeLabel} (${gameState.players.length}P)`);
    } else if (gameState?.isGameOver) {
      clearSavedActiveGame();
      setSavedGame(null);
    }
  }, [gameState]);

  // ================= GAME LAUNCHERS =================
  const startVsComputerGame = (
    playersCount: number,
    userColor: PlayerColor,
    difficulty: AIDifficulty
  ) => {
    const allColors: PlayerColor[] =
      playersCount === 2
        ? [userColor, userColor === 'red' ? 'yellow' : 'red']
        : ['red', 'green', 'yellow', 'blue'].slice(0, playersCount) as PlayerColor[];

    const orderedColors = [userColor, ...allColors.filter((c) => c !== userColor)];

    const configs = orderedColors.map((color, idx) => {
      const isUser = idx === 0;
      return {
        name: isUser ? user?.username || 'You' : `Bot ${color.toUpperCase()}`,
        color,
        isAI: !isUser,
        aiDifficulty: difficulty,
        avatar: isUser ? user?.avatar || '🦁' : '🤖',
      };
    });

    const players = createPlayers('vs_computer', configs);
    const initialGame: GameState = {
      gameId: `game_${Date.now()}`,
      mode: 'vs_computer',
      players,
      activePlayerIndex: 0,
      diceValue: null,
      isRolling: false,
      hasRolled: false,
      validMoves: [],
      turnTimeLeft: 20,
      turnDuration: 20,
      consecutiveSixes: 0,
      winnerOrder: [],
      isGameOver: false,
      turnTimerEnabled: true,
    };

    setGameState(initialGame);
    setSavedGame(null);
    setChatMessages([]);
    setGameStartTime(Date.now());
    setMatchTokensCaptured(0);
    setMatchSixesRolled(0);
    setCurrentScreen('game');
  };

  const startLocalMultiplayerGame = (
    playersList: { name: string; color: PlayerColor; avatar: string }[]
  ) => {
    const configs = playersList.map((p) => ({
      name: p.name,
      color: p.color,
      isAI: false,
      avatar: p.avatar,
    }));

    const players = createPlayers('local_multiplayer', configs);
    const initialGame: GameState = {
      gameId: `game_${Date.now()}`,
      mode: 'local_multiplayer',
      players,
      activePlayerIndex: 0,
      diceValue: null,
      isRolling: false,
      hasRolled: false,
      validMoves: [],
      turnTimeLeft: 20,
      turnDuration: 20,
      consecutiveSixes: 0,
      winnerOrder: [],
      isGameOver: false,
      turnTimerEnabled: true,
    };

    setGameState(initialGame);
    setSavedGame(null);
    setChatMessages([]);
    setGameStartTime(Date.now());
    setMatchTokensCaptured(0);
    setMatchSixesRolled(0);
    setCurrentScreen('game');
  };

  const startQuickMatch = (playersCount: number) => {
    const ws = connectWebSocket();
    setIsMatchmaking(true);
    ws.send(
      JSON.stringify({
        event: 'join_queue',
        payload: {
          user: user || {
            id: `guest_${Date.now()}`,
            username: `Player_${Math.floor(Math.random() * 1000)}`,
            avatar: '🎲',
            stats: { eloRating: 1200 },
          },
          playersCount,
        },
      })
    );
  };

  const cancelMatchmaking = () => {
    setIsMatchmaking(false);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          event: 'leave_queue',
          payload: { userId: user?.id },
        })
      );
    }
  };

  const createOnlineRoom = (playersCount: number) => {
    const ws = connectWebSocket();
    const curUser = user || {
      id: `guest_${Date.now()}`,
      username: `Host_${Math.floor(Math.random() * 1000)}`,
      avatar: '👑',
      stats: { eloRating: 1200 },
    };
    ws.send(
      JSON.stringify({
        event: 'create_room',
        payload: {
          userId: curUser.id,
          username: curUser.username,
          avatar: curUser.avatar,
          eloRating: curUser.stats.eloRating,
          user: curUser,
          playersCount,
        },
      })
    );
  };

  const joinOnlineRoom = (code: string) => {
    const ws = connectWebSocket();
    const curUser = user || {
      id: `guest_${Date.now()}`,
      username: `Player_${Math.floor(Math.random() * 1000)}`,
      avatar: '🎲',
      stats: { eloRating: 1200 },
    };
    ws.send(
      JSON.stringify({
        event: 'join_room',
        payload: {
          code: code.toUpperCase(),
          userId: curUser.id,
          username: curUser.username,
          avatar: curUser.avatar,
          eloRating: curUser.stats.eloRating,
          user: curUser,
        },
      })
    );
  };

  const startOnlineGameAsHost = () => {
    const colors: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
    const configs = onlinePlayers.map((p, idx) => ({
      name: p.username,
      color: colors[idx],
      isAI: false,
      avatar: p.avatar,
    }));

    const players = createPlayers('online_multiplayer', configs);
    const initialGame: GameState = {
      gameId: `game_${Date.now()}`,
      mode: 'online_multiplayer',
      players,
      activePlayerIndex: 0,
      diceValue: null,
      isRolling: false,
      hasRolled: false,
      validMoves: [],
      turnTimeLeft: 20,
      turnDuration: 20,
      consecutiveSixes: 0,
      winnerOrder: [],
      isGameOver: false,
      turnTimerEnabled: true,
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          event: 'start_game',
          payload: { initialGameState: initialGame },
        })
      );
    }
  };

  const broadcastGameState = (state: GameState) => {
    if (
      gameState?.mode === 'online_multiplayer' &&
      wsRef.current &&
      wsRef.current.readyState === WebSocket.OPEN
    ) {
      wsRef.current.send(
        JSON.stringify({
          event: 'sync_game_state',
          payload: { gameState: state },
        })
      );
    }
  };

  // ================= TURN TIMER TOGGLE =================
  const handleToggleTurnTimer = () => {
    setGameState((prev) => {
      if (!prev) return null;
      const nextEnabled = prev.turnTimerEnabled === false ? true : false;
      const updated: GameState = {
        ...prev,
        turnTimerEnabled: nextEnabled,
      };
      broadcastGameState(updated);
      return updated;
    });
  };

  // ================= GAME LOGIC & TURN ACTIONS =================
  const handleRollDice = () => {
    if (!gameState || gameState.isRolling || gameState.hasRolled || gameState.isGameOver) return;

    const activePlayer = gameState.players[gameState.activePlayerIndex];
    sounds.playDiceRoll();

    setGameState((prev) => (prev ? { ...prev, isRolling: true } : null));

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      if (roll === 6) {
        setMatchSixesRolled((c) => c + 1);
      }

      setGameState((prev) => {
        if (!prev) return null;

        const nextConsecutive = roll === 6 ? prev.consecutiveSixes + 1 : 0;

        // Fair-play 3 sixes penalty
        if (nextConsecutive >= 3) {
          const nextIdx = getNextActivePlayerIndex(prev.players, prev.activePlayerIndex);
          const updated: GameState = {
            ...prev,
            diceValue: roll,
            isRolling: false,
            hasRolled: false,
            validMoves: [],
            consecutiveSixes: 0,
            activePlayerIndex: nextIdx,
            turnTimeLeft: 20,
          };
          broadcastGameState(updated);
          return updated;
        }

        const validMoves = calculateValidMoves(activePlayer, roll, prev.players);

        // Auto-pass if 0 valid moves
        if (validMoves.length === 0) {
          const nextIdx = getNextActivePlayerIndex(prev.players, prev.activePlayerIndex);
          const updated: GameState = {
            ...prev,
            diceValue: roll,
            isRolling: false,
            hasRolled: false,
            validMoves: [],
            consecutiveSixes: nextConsecutive,
            activePlayerIndex: roll === 6 ? prev.activePlayerIndex : nextIdx,
            turnTimeLeft: 20,
          };
          broadcastGameState(updated);
          return updated;
        }

        const updated: GameState = {
          ...prev,
          diceValue: roll,
          isRolling: false,
          hasRolled: true,
          validMoves,
          consecutiveSixes: nextConsecutive,
          turnTimeLeft: 20,
        };
        broadcastGameState(updated);
        return updated;
      });
    }, 450);
  };

  const handleMakeMove = (tokenId: number) => {
    if (!gameState || !gameState.hasRolled || gameState.isGameOver) return;

    const { nextState, capturedPlayer, didFinish } = executeMove(
      gameState,
      tokenId
    );

    // Audio triggers
    if (didFinish) {
      sounds.playHomeGoal();
    } else if (capturedPlayer) {
      sounds.playCapture();
      setMatchTokensCaptured((c) => c + 1);
    } else {
      sounds.playTokenMove();
    }

    nextState.turnTimeLeft = 20;
    setGameState(nextState);
    broadcastGameState(nextState);

    // Check if user won / game over to record match
    if (nextState.isGameOver) {
      handleGameOver(nextState);
    }
  };

  const handleGameOver = async (finalState: GameState) => {
    sounds.playVictory();
    clearSavedActiveGame();
    setSavedGame(null);

    const duration = Math.round((Date.now() - gameStartTime) / 1000);
    const userPlayer = finalState.players[0];
    const isWin = finalState.winnerOrder[0] === userPlayer?.id;

    if (user && authToken) {
      try {
        const res = await fetch('/api/matches/record', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            userId: user.id,
            matchData: {
              mode: finalState.mode,
              playersCount: finalState.players.length,
              playerColor: userPlayer?.color || 'red',
              rank: userPlayer?.rank || (isWin ? 1 : 2),
              durationSeconds: duration,
              tokensCaptured: matchTokensCaptured,
              sixesRolled: matchSixesRolled,
              opponents: finalState.players.slice(1).map((p) => ({
                name: p.name,
                color: p.color,
                isAI: p.isAI,
              })),
            },
          }),
        });
        const data = await res.json();
        if (data.success) {
          setLastEloChange(data.eloChange);
          setUser((prev) => (prev ? { ...prev, stats: data.stats } : null));
        }
      } catch {
        // Fallback
      }
    }
  };

  // ================= AI TURN AUTOMATION =================
  useEffect(() => {
    if (!gameState || gameState.isGameOver) return;

    const activePlayer = gameState.players[gameState.activePlayerIndex];
    if (!activePlayer || !activePlayer.isAI) return;

    // AI Step 1: Roll dice
    if (!gameState.hasRolled && !gameState.isRolling) {
      const rollTimeout = setTimeout(() => {
        handleRollDice();
      }, 700);
      return () => clearTimeout(rollTimeout);
    }

    // AI Step 2: Pick best move
    if (gameState.hasRolled && gameState.validMoves.length > 0) {
      const moveTimeout = setTimeout(() => {
        const bestMove = pickAIMove(activePlayer, gameState.validMoves, gameState.players);
        if (bestMove) {
          handleMakeMove(bestMove.tokenId);
        }
      }, 800);
      return () => clearTimeout(moveTimeout);
    }
  }, [gameState]);

  // ================= TURN TIMER & NOTIFICATIONS =================
  useEffect(() => {
    if (!gameState || gameState.isGameOver) return;

    if (timerRef.current) clearInterval(timerRef.current);

    // If timer is disabled by user, skip countdown
    if (gameState.turnTimerEnabled === false) {
      return;
    }

    timerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (!prev || prev.isGameOver || prev.turnTimerEnabled === false) return prev;

        if (prev.turnTimeLeft <= 1) {
          // Time expired -> auto roll or pass turn
          const active = prev.players[prev.activePlayerIndex];
          if (!prev.hasRolled) {
            handleRollDice();
            return prev;
          } else if (prev.validMoves.length > 0) {
            const first = prev.validMoves[0];
            const { nextState } = executeMove(prev, first.tokenId);
            nextState.turnTimeLeft = 20;
            return nextState;
          } else {
            const nextIdx = getNextActivePlayerIndex(prev.players, prev.activePlayerIndex);
            return {
              ...prev,
              activePlayerIndex: nextIdx,
              hasRolled: false,
              diceValue: null,
              validMoves: [],
              turnTimeLeft: 20,
            };
          }
        }

        // Sound reminder at 5s remaining
        if (prev.turnTimeLeft === 5) {
          const isMyTurn = !prev.players[prev.activePlayerIndex]?.isAI;
          if (isMyTurn) {
            sounds.playTurnNotification();
            notificationService.sendTurnNotification(
              prev.players[prev.activePlayerIndex]?.name || 'Player',
              true
            );
          }
        }

        return { ...prev, turnTimeLeft: prev.turnTimeLeft - 1 };
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState?.activePlayerIndex, gameState?.hasRolled, gameState?.turnTimerEnabled]);

  // ================= CHAT MESSAGE SENDER =================
  const handleSendMessage = (text: string, isEmoji = false) => {
    const activePlayer = gameState?.players[gameState.activePlayerIndex] || gameState?.players[0];
    const newMsg: ChatMessage = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      senderId: user?.id || 'local_user',
      senderName: user?.username || activePlayer?.name || 'Player',
      senderColor: activePlayer?.color,
      text,
      isEmoji,
      timestamp: Date.now(),
    };

    setChatMessages((prev) => [...prev, newMsg]);

    if (
      gameState?.mode === 'online_multiplayer' &&
      wsRef.current &&
      wsRef.current.readyState === WebSocket.OPEN
    ) {
      wsRef.current.send(
        JSON.stringify({
          event: 'chat_message',
          payload: newMsg,
        })
      );
    }
  };

  const handleRematch = () => {
    if (!gameState) return;
    if (gameState.mode === 'vs_computer') {
      const p = gameState.players;
      startVsComputerGame(p.length, p[0].color, p[1]?.aiDifficulty || 'medium');
    } else if (gameState.mode === 'local_multiplayer') {
      startLocalMultiplayerGame(gameState.players);
    } else {
      setCurrentScreen('waiting_room');
    }
  };

  // Forfeit / Leave Active Game Handler
  const handleForfeitGame = async () => {
    setIsForfeitModalOpen(false);
    if (!gameState) return;

    if (user && authToken) {
      try {
        const res = await fetch('/api/matches/forfeit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await res.json();
        if (data.success) {
          setUser((prev) => (prev ? { ...prev, stats: data.stats } : null));
          setPenaltyToast({
            title: 'Match Forfeited',
            description: `You voluntarily left the match. Rank reduced: ${data.eloPenalty} Elo.`,
            type: 'forfeit',
            penalty: data.eloPenalty,
          });
        }
      } catch (err) {
        console.error('Forfeit request error:', err);
      }
    }

    if (
      gameState.mode === 'online_multiplayer' &&
      wsRef.current &&
      wsRef.current.readyState === WebSocket.OPEN
    ) {
      wsRef.current.send(
        JSON.stringify({
          event: 'player_leave',
          payload: { userId: user?.id },
        })
      );
    }

    clearSavedActiveGame();
    setSavedGame(null);
    setGameState(null);
    setCurrentScreen('lobby');
  };

  // Moderation Handlers (Mute / Block)
  const handleToggleMuteUser = async (targetUserId: string) => {
    if (!authToken) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const res = await fetch('/api/users/mute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ targetUserId }),
      });
      const data = await res.json();
      if (data.success) {
        setUser((prev) => (prev ? { ...prev, mutedUsers: data.mutedUsers } : null));
      }
    } catch (err) {
      console.error('Mute error:', err);
    }
  };

  const handleToggleBlockUser = async (targetUserId: string) => {
    if (!authToken) {
      // Allow guest user to block/unblock locally
      setUser((prev) => {
        const curBlocked = prev?.blockedUsers || [];
        const isAlreadyBlocked = curBlocked.includes(targetUserId);
        const nextBlocked = isAlreadyBlocked
          ? curBlocked.filter((id) => id !== targetUserId)
          : [...curBlocked, targetUserId];
        return prev ? { ...prev, blockedUsers: nextBlocked } : null;
      });
      return;
    }
    try {
      const res = await fetch('/api/users/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ targetUserId }),
      });
      const data = await res.json();
      if (data.success) {
        setUser((prev) => (prev ? { ...prev, blockedUsers: data.blockedUsers } : null));
      }
    } catch (err) {
      console.error('Block error:', err);
    }
  };

  // Delete User Account & All Stored Personal Data (GDPR Article 17 Right to Erasure)
  const handleDeleteAccount = async () => {
    if (!authToken) {
      handleClearLocalData();
      setUser(null);
      setPenaltyToast({
        title: 'Local Data Cleared',
        description: 'All local player sessions, games, and cached data were wiped.',
        type: 'disconnect',
        penalty: 0,
      });
      return;
    }

    try {
      const res = await fetch('/api/auth/account', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        localStorage.clear();
        setAuthToken(null);
        setUser(null);
        clearSavedActiveGame();
        setSavedGame(null);
        setGameState(null);
        setCurrentScreen('lobby');
        setPenaltyToast({
          title: 'Account & Data Deleted',
          description: data.message || 'Your player account, matches, and all personal data have been permanently erased.',
          type: 'disconnect',
          penalty: 0,
        });
      }
    } catch (err) {
      console.error('Delete account error:', err);
    }
  };

  const handleClearLocalData = () => {
    clearSavedActiveGame();
    setSavedGame(null);
    localStorage.removeItem('ludo_active_game');
    localStorage.removeItem('ludo_theme_settings');
    localStorage.removeItem('ludo_contacts_accepted');
    localStorage.removeItem('ludo_chat_stopped');
  };

  // Direct online player challenge handler
  const handleDirectChallengeUser = (targetPlayer: { id: string; username: string; avatar?: string; eloRating?: number }) => {
    setIsContactsModalOpen(false);
    const ws = connectWebSocket();
    const generatedCode = `CHAMP${Math.floor(1000 + Math.random() * 9000)}`;

    const curUser = user || {
      id: `guest_${Date.now()}`,
      username: `Player_${Math.floor(Math.random() * 1000)}`,
      avatar: '👑',
      stats: { eloRating: 1200 },
    };

    ws.send(
      JSON.stringify({
        event: 'invite_contact',
        payload: {
          targetUserId: targetPlayer.id,
          senderName: curUser.username,
          roomCode: generatedCode,
          mode: '1v1 Championship Duel',
        },
      })
    );

    // Host room immediately with custom code and 2 players
    ws.send(
      JSON.stringify({
        event: 'create_room',
        payload: {
          code: generatedCode,
          userId: curUser.id,
          username: curUser.username,
          avatar: curUser.avatar,
          eloRating: curUser.stats.eloRating,
          user: curUser,
          playersCount: 2,
        },
      })
    );
  };

  // Contacts challenge handler
  const handleChallengeContact = (contactUser: UserProfile | any) => {
    handleDirectChallengeUser(contactUser);
  };

  const activePlayer = gameState ? gameState.players[gameState.activePlayerIndex] : null;
  const isMyTurn = activePlayer ? !activePlayer.isAI : false;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-neutral-950">
      {/* Contact Online Toast Alert */}
      {contactOnlineToast && (
        <div className="fixed top-16 right-4 z-50 p-3.5 rounded-2xl bg-slate-900/95 border border-emerald-500/40 shadow-2xl backdrop-blur-md flex items-center gap-3 animate-fadeIn">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div className="text-xs">
            <span className="font-bold text-white">{contactOnlineToast.username}</span>
            {contactOnlineToast.country && (
              <span className="text-slate-400"> ({contactOnlineToast.country})</span>
            )}
            <span className="text-emerald-400 block font-medium">is now online & ready to play!</span>
          </div>
          <button
            onClick={() => setContactOnlineToast(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Contact Playing Live Notification Toast */}
      {contactPlayingToast && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-3xl bg-indigo-950/95 border-2 border-amber-500/80 shadow-2xl backdrop-blur-md flex items-start gap-3.5 animate-fadeIn max-w-sm">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
            <Play className="w-4 h-4 fill-amber-400" />
          </div>
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-white text-sm">{contactPlayingToast.username}</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                Playing Now
              </span>
            </div>
            <p className="text-slate-300 text-xs mt-0.5">
              Is currently playing {contactPlayingToast.mode || 'a championship match'}!
            </p>
            {contactPlayingToast.roomCode && (
              <button
                type="button"
                onClick={() => {
                  const code = contactPlayingToast.roomCode!;
                  setContactPlayingToast(null);
                  joinOnlineRoom(code);
                }}
                className="mt-2.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Join Game ({contactPlayingToast.roomCode})</span>
              </button>
            )}
          </div>
          <button
            onClick={() => setContactPlayingToast(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Incoming Match Invitation Modal/Toast */}
      {incomingInvite && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-3xl bg-slate-900 border-2 border-indigo-500 shadow-2xl backdrop-blur-md max-w-sm w-full animate-fadeIn">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl font-bold">
                ⚡
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">{incomingInvite.senderName}</h4>
                <p className="text-xs text-indigo-300">Challenged you to a match!</p>
              </div>
            </div>
            <button
              onClick={() => setIncomingInvite(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2 mt-3.5">
            <button
              onClick={() => setIncomingInvite(null)}
              className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition cursor-pointer"
            >
              Decline
            </button>
            <button
              onClick={() => {
                const code = incomingInvite.roomCode;
                setIncomingInvite(null);
                joinOnlineRoom(code);
              }}
              className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept & Join</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Header Navigation with Active Game Return Button */}
      <HeaderNav
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
        user={user}
        hasActiveGame={!!gameState && !gameState.isGameOver}
        onReturnToGame={() => setCurrentScreen('game')}
        onOpenContacts={() => setIsContactsModalOpen(true)}
        onOpenThemes={() => setIsThemeModalOpen(true)}
        onOpenScreenshots={() => setIsScreenshotsModalOpen(true)}
        onOpenPrivacyPolicy={() => setCurrentScreen('privacy')}
        onOpenDeleteAccount={() => setCurrentScreen('delete-account')}
        onOpenDataSafety={() => setCurrentScreen('data-safety')}
        onOpenAuth={() => handleOpenAuth(false)}
        onOpenRules={() => setIsRulesModalOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        hasNotificationPermission={hasNotificationPermission}
        onRequestNotifications={handleRequestNotifications}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-6 max-w-6xl w-full mx-auto flex flex-col justify-center">
        {/* Screen 1: Lobby */}
        {currentScreen === 'lobby' && (
          <LobbyView
            user={user}
            savedGame={savedGame}
            onResumeSavedGame={() => {
              if (savedGame) {
                setGameState(savedGame.gameState);
                setSavedGame(null);
                setCurrentScreen('game');
              }
            }}
            onClearSavedGame={() => {
              clearSavedActiveGame();
              setSavedGame(null);
            }}
            onOpenContacts={() => setIsContactsModalOpen(true)}
            onOpenThemes={() => setIsThemeModalOpen(true)}
            onOpenScreenshots={() => setIsScreenshotsModalOpen(true)}
            onOpenPrivacyPolicy={() => setCurrentScreen('privacy')}
            onOpenDeleteAccount={() => setCurrentScreen('delete-account')}
            onOpenDataSafety={() => setCurrentScreen('data-safety')}
            themeSettings={themeSettings}
            onStartVsComputer={startVsComputerGame}
            onStartLocalMultiplayer={startLocalMultiplayerGame}
            onStartQuickMatch={startQuickMatch}
            onCreateOnlineRoom={createOnlineRoom}
            onJoinOnlineRoom={joinOnlineRoom}
            onChallengePlayer={handleDirectChallengeUser}
            isMatchmaking={isMatchmaking}
            onCancelMatchmaking={cancelMatchmaking}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {/* Screen 2: Online Waiting Room */}
        {currentScreen === 'waiting_room' && (
          <WaitingRoom
            roomCode={onlineRoomCode || 'LUDO7X'}
            isHost={isHost}
            players={onlinePlayers}
            maxPlayers={onlineMaxPlayers}
            onStartGame={startOnlineGameAsHost}
            onLeaveRoom={() => setCurrentScreen('lobby')}
          />
        )}

        {/* Screen 3: Active Ludo Game */}
        {currentScreen === 'game' && gameState && (
          <div className="space-y-4 animate-fadeIn" id="active-game-container">
            {/* Top Game Status Banner */}
            <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentScreen('lobby')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition cursor-pointer"
                  title="Pause and return to lobby (game remains saved in background)"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Lobby (Save)</span>
                </button>

                <button
                  onClick={() => setIsForfeitModalOpen(true)}
                  id="btn-leave-forfeit"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition cursor-pointer"
                  title="Leave match (voluntary forfeit with rank penalty)"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Leave Match</span>
                </button>
              </div>

              <div className="text-center">
                <span className="text-xs font-bold text-amber-400 capitalize">
                  {gameState.mode.replace('_', ' ')}
                </span>
                {gameState.lastMoveInfo && (
                  <span className="block text-[11px] text-slate-400 font-medium">
                    {gameState.lastMoveInfo.capturedPlayerId ? (
                      <span className="text-rose-400 font-bold">
                        🎯 {gameState.lastMoveInfo.playerName} captured opponent token!
                      </span>
                    ) : (
                      `${gameState.lastMoveInfo.playerName} rolled ${gameState.lastMoveInfo.roll}`
                    )}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsThemeModalOpen(true)}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  title="Change board theme & skins"
                  id="btn-ingame-theme-picker"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Theme</span>
                </button>
                <button
                  onClick={handleToggleTurnTimer}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    gameState.turnTimerEnabled !== false
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                  title="Toggle 20s turn timer on/off"
                >
                  {gameState.turnTimerEnabled !== false ? '⏱️ Timer On' : '🧘 No Timer'}
                </button>
                <button
                  onClick={() => setIsRulesModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition cursor-pointer"
                >
                  Rules
                </button>
              </div>
            </div>

            {/* Main Game Layout (Board + Player Cards + Dice Roller) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Left Column: Top Players Cards */}
              <div className="lg:col-span-3 space-y-2 flex flex-col justify-center">
                {gameState.players.slice(0, Math.ceil(gameState.players.length / 2)).map((p, idx) => (
                  <PlayerCard
                    key={`p-card-${p.id}`}
                    player={p}
                    isActive={gameState.activePlayerIndex === idx}
                    isCurrentUser={idx === 0 && !p.isAI}
                    reaction={activeReactions[p.id]}
                  />
                ))}
              </div>

              {/* Center Column: Interactive Board & Dice Roller */}
              <div className="lg:col-span-6 flex flex-col items-center gap-3">
                <LudoBoard
                  players={gameState.players}
                  activePlayerIndex={gameState.activePlayerIndex}
                  validMoves={gameState.validMoves}
                  hasRolled={gameState.hasRolled}
                  onTokenClick={handleMakeMove}
                  isInteractive={isMyTurn}
                  boardTheme={themeSettings.boardTheme}
                  tokenSkin={themeSettings.tokenSkin}
                />

                {activePlayer && (
                  <DiceRoller
                    diceValue={gameState.diceValue}
                    isRolling={gameState.isRolling}
                    hasRolled={gameState.hasRolled}
                    isMyTurn={isMyTurn}
                    activePlayer={activePlayer}
                    consecutiveSixes={gameState.consecutiveSixes}
                    timeLeft={gameState.turnTimeLeft}
                    maxTime={gameState.turnDuration}
                    onRollClick={handleRollDice}
                    timerEnabled={gameState.turnTimerEnabled !== false}
                    diceSkin={themeSettings.diceSkin}
                    gameMode={gameState.mode}
                    onToggleTimer={handleToggleTurnTimer}
                  />
                )}
              </div>

              {/* Right Column: Bottom Players Cards */}
              <div className="lg:col-span-3 space-y-2 flex flex-col justify-center">
                {gameState.players.slice(Math.ceil(gameState.players.length / 2)).map((p, idx) => {
                  const actualIdx = Math.ceil(gameState.players.length / 2) + idx;
                  return (
                    <PlayerCard
                      key={`p-card-${p.id}`}
                      player={p}
                      isActive={gameState.activePlayerIndex === actualIdx}
                      isCurrentUser={false}
                      reaction={activeReactions[p.id]}
                    />
                  );
                })}
              </div>
            </div>

            {/* In-game Chat Panel with Mute, Block and Stop Chat support */}
            <InGameChat
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              isOpen={isChatOpen}
              onToggle={() => setIsChatOpen(!isChatOpen)}
              currentUserColor={user ? 'red' : 'red'}
              currentUserId={user?.id}
              mutedUsers={user?.mutedUsers || []}
              blockedUsers={user?.blockedUsers || []}
              isChatStopped={isChatStopped}
              onToggleStopChat={handleToggleStopChat}
              onToggleMute={handleToggleMuteUser}
              onToggleBlock={handleToggleBlockUser}
            />
          </div>
        )}

        {/* Screen 4: Leaderboard */}
        {currentScreen === 'leaderboard' && <LeaderboardView />}

        {/* Screen 5: Profile & Career Stats with Account & Data Deletion */}
        {currentScreen === 'profile' && (
          <ProfileView
            user={user}
            authToken={authToken}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenContacts={() => setIsContactsModalOpen(true)}
            onOpenThemes={() => setIsThemeModalOpen(true)}
            themeSettings={themeSettings}
            onUpdateUser={(updated) => setUser(updated)}
            onDeleteAccount={handleDeleteAccount}
            onClearLocalData={handleClearLocalData}
          />
        )}

        {/* Screen 6: Privacy Policy & Terms */}
        {currentScreen === 'privacy' && (
          <PrivacyPolicyView
            onBack={() => setCurrentScreen('lobby')}
            onNavigateToDeleteAccount={() => setCurrentScreen('delete-account')}
            onNavigateToDataSafety={() => setCurrentScreen('data-safety')}
          />
        )}

        {/* Screen 7: Delete Account & Data Erasure */}
        {currentScreen === 'delete-account' && (
          <DeleteAccountView
            user={user}
            authToken={authToken}
            onBack={() => setCurrentScreen('lobby')}
            onNavigateToPolicy={() => setCurrentScreen('privacy')}
            onNavigateToDataSafety={() => setCurrentScreen('data-safety')}
            onDeleteCurrentAccount={handleDeleteAccount}
            onClearLocalData={handleClearLocalData}
          />
        )}

        {/* Screen 8: Google Play Data Safety Disclosure */}
        {currentScreen === 'data-safety' && (
          <DataSafetyView
            onBack={() => setCurrentScreen('lobby')}
            onNavigateToPolicy={() => setCurrentScreen('privacy')}
            onNavigateToDeleteAccount={() => setCurrentScreen('delete-account')}
          />
        )}
      </main>

      {/* Penalty / Forfeit Notification Toast */}
      {penaltyToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 p-4 rounded-3xl bg-slate-900 border-2 border-rose-500/80 shadow-2xl backdrop-blur-md max-w-md w-full animate-fadeIn flex items-start gap-3.5">
          <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-white text-sm">{penaltyToast.title}</h4>
              <span className="font-black text-rose-400 text-xs px-2 py-0.5 rounded bg-rose-500/20">
                {penaltyToast.penalty} Elo
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">{penaltyToast.description}</p>
          </div>
          <button
            onClick={() => setPenaltyToast(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Forfeit Confirmation Modal */}
      {isForfeitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
              <Flag className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-white mb-2">Leave & Forfeit Match?</h3>
            
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Voluntarily leaving an in-progress championship match is counted as an immediate defeat and applies a <span className="font-bold text-rose-400">heavy rank penalty (-35 to -45 Elo)</span>.
            </p>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-left text-[11px] text-slate-400 space-y-1 mb-5">
              <div className="flex items-center justify-between text-rose-300 font-semibold">
                <span>• Voluntary Exit / Leave:</span>
                <span>-35 to -45 Elo penalty</span>
              </div>
              <div className="flex items-center justify-between text-amber-300 font-semibold">
                <span>• Accidental Disconnection:</span>
                <span>-10 to -14 Elo (Grace reduction)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsForfeitModalOpen(false)}
                className="py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Stay & Play
              </button>
              <button
                onClick={handleForfeitGame}
                id="btn-confirm-forfeit"
                className="py-2.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition cursor-pointer"
              >
                Forfeit (-35 Elo)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Victory Celebration Modal */}
      {gameState?.isGameOver && (
        <VictoryModal
          winnerOrder={gameState.winnerOrder}
          players={gameState.players}
          gameMode={gameState.mode}
          onRematch={handleRematch}
          onReturnToLobby={() => setCurrentScreen('lobby')}
          eloChange={lastEloChange}
        />
      )}

      {/* Auth Modal (Sign in / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        defaultToRegister={authDefaultToRegister}
      />

      {/* Rules Modal */}
      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      {/* Contacts & Search Players Modal */}
      <ContactsModal
        isOpen={isContactsModalOpen}
        onClose={() => setIsContactsModalOpen(false)}
        currentUser={user}
        authToken={authToken}
        onInviteUser={handleChallengeContact}
        onNotifyContactPlaying={(contactName, mode, roomCode) => {
          setContactPlayingToast({
            username: contactName,
            mode,
            roomCode,
          });
        }}
      />

      {/* Themes & Skins Customizer Studio Modal */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentSettings={themeSettings}
        onSaveSettings={handleSaveThemeSettings}
      />

      {/* Privacy Policy & Copyrights Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyPolicyModalOpen}
        onClose={() => setIsPrivacyPolicyModalOpen(false)}
      />

      {/* Phone Screenshots & Store Assets Preview Modal */}
      <ScreenshotsModal
        isOpen={isScreenshotsModalOpen}
        onClose={() => setIsScreenshotsModalOpen(false)}
      />

      {/* Persistent Internet-Active Google Ads Network Banner */}
      <GoogleAdsBanner
        onOpenPrivacyPolicy={() => setIsPrivacyPolicyModalOpen(true)}
      />
    </div>
  );
}
