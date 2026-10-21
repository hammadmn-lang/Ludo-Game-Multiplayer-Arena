import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

interface UserRecord {
  id: string;
  username: string;
  email?: string;
  passwordHash: string;
  salt: string;
  avatar: string;
  country?: string;
  location?: string;
  phoneNumber?: string;
  contacts?: string[];
  team?: {
    id: string;
    name: string;
    tag: string;
    avatar: string;
    role: 'leader' | 'member';
    memberCount: number;
    totalElo: number;
  };
  blockedUsers?: string[];
  mutedUsers?: string[];
  createdAt: string;
  stats: {
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
  };
  matches: Array<{
    id: string;
    date: string;
    mode: string;
    playersCount: number;
    playerColor: string;
    rank: number;
    status?: 'completed' | 'forfeited' | 'disconnected';
    durationSeconds: number;
    tokensCaptured: number;
    opponents: Array<{ name: string; color: string; isAI: boolean }>;
    eloChange: number;
    notes?: string;
  }>;
}

// Database helper using JSON storage with initial bot/player seeds
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function normalizePhone(phone: string): string {
  return (phone || '').replace(/[^\d]/g, '');
}

function loadDB(): { users: Record<string, UserRecord> } {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && parsed.users) {
        // Ensure default seeded fields exist
        Object.values(parsed.users).forEach((u: any) => {
          if (!u.country) u.country = 'United States 🇺🇸';
          if (!u.location) u.location = 'New York';
          if (!u.phoneNumber) u.phoneNumber = '+1 555-0149';
          if (!u.contacts) u.contacts = [];
        });
        return parsed;
      }
    } catch {
      // Fallback
    }
  }

  // Seed default champions for leaderboard and contacts atmosphere
  const seedSalt = crypto.randomBytes(16).toString('hex');
  const initialUsers: Record<string, UserRecord> = {
    user_grandmaster: {
      id: 'user_grandmaster',
      username: 'KingLudo_99',
      passwordHash: hashPassword('password123', seedSalt),
      salt: seedSalt,
      avatar: '👑',
      country: 'United States 🇺🇸',
      location: 'New York, NY',
      phoneNumber: '+1 (555) 234-5678',
      contacts: ['user_master', 'user_diamond'],
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      stats: {
        totalMatches: 84,
        wins: 62,
        losses: 18,
        secondPlaces: 4,
        winStreak: 8,
        bestWinStreak: 12,
        tokensCaptured: 194,
        tokensLost: 48,
        sixesRolled: 340,
        eloRating: 2150,
      },
      matches: [
        {
          id: 'm_seed_1',
          date: new Date(Date.now() - 3600000).toISOString(),
          mode: 'online_multiplayer',
          playersCount: 4,
          playerColor: 'red',
          rank: 1,
          durationSeconds: 420,
          tokensCaptured: 7,
          opponents: [
            { name: 'DiceMaster', color: 'green', isAI: false },
            { name: 'StarPawn', color: 'yellow', isAI: false },
            { name: 'ShadowKnight', color: 'blue', isAI: false },
          ],
          eloChange: +24,
        },
      ],
    },
    user_master: {
      id: 'user_master',
      username: 'DiceQueen',
      passwordHash: hashPassword('password123', seedSalt),
      salt: seedSalt,
      avatar: '🌟',
      country: 'United Kingdom 🇬🇧',
      location: 'London',
      phoneNumber: '+44 7700 900123',
      contacts: ['user_grandmaster'],
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      stats: {
        totalMatches: 65,
        wins: 45,
        losses: 16,
        secondPlaces: 4,
        winStreak: 4,
        bestWinStreak: 9,
        tokensCaptured: 142,
        tokensLost: 51,
        sixesRolled: 260,
        eloRating: 1940,
      },
      matches: [],
    },
    user_diamond: {
      id: 'user_diamond',
      username: 'PawnStriker',
      passwordHash: hashPassword('password123', seedSalt),
      salt: seedSalt,
      avatar: '🎯',
      country: 'India 🇮🇳',
      location: 'Mumbai',
      phoneNumber: '+91 98765 43210',
      contacts: ['user_grandmaster'],
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      stats: {
        totalMatches: 42,
        wins: 26,
        losses: 14,
        secondPlaces: 2,
        winStreak: 3,
        bestWinStreak: 6,
        tokensCaptured: 89,
        tokensLost: 39,
        sixesRolled: 175,
        eloRating: 1780,
      },
      matches: [],
    },
    user_alex: {
      id: 'user_alex',
      username: 'Alex_Champion',
      passwordHash: hashPassword('password123', seedSalt),
      salt: seedSalt,
      avatar: '⚡',
      country: 'Canada 🇨🇦',
      location: 'Toronto',
      phoneNumber: '+1 (416) 555-0199',
      contacts: [],
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      stats: {
        totalMatches: 31,
        wins: 19,
        losses: 12,
        secondPlaces: 3,
        winStreak: 2,
        bestWinStreak: 5,
        tokensCaptured: 64,
        tokensLost: 28,
        sixesRolled: 120,
        eloRating: 1620,
      },
      matches: [],
    },
    user_samira: {
      id: 'user_samira',
      username: 'Samira_Pro',
      passwordHash: hashPassword('password123', seedSalt),
      salt: seedSalt,
      avatar: '🌸',
      country: 'United Arab Emirates 🇦🇪',
      location: 'Dubai',
      phoneNumber: '+971 50 123 4567',
      contacts: [],
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      stats: {
        totalMatches: 25,
        wins: 17,
        losses: 8,
        secondPlaces: 2,
        winStreak: 4,
        bestWinStreak: 7,
        tokensCaptured: 58,
        tokensLost: 22,
        sixesRolled: 95,
        eloRating: 1580,
      },
      matches: [],
    },
  };

  const db = { users: initialUsers };
  saveDB(db);
  return db;
}

function saveDB(db: { users: Record<string, UserRecord> }) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

const db = loadDB();

// Active Online Users Presence Tracker
interface ConnectedUserSession {
  ws: WebSocket;
  userId: string;
  username: string;
  avatar: string;
  country?: string;
  location?: string;
  phoneNumber?: string;
  eloRating: number;
}

const connectedSessions: Map<WebSocket, ConnectedUserSession> = new Map();

// Helper to format user for client responses
function formatUserResponse(user: UserRecord) {
  return {
    id: user.id,
    username: user.username,
    email: user.email || '',
    avatar: user.avatar,
    country: user.country || 'Global 🌐',
    location: user.location || 'Online',
    phoneNumber: user.phoneNumber || '',
    contacts: user.contacts || [],
    team: user.team,
    blockedUsers: user.blockedUsers || [],
    mutedUsers: user.mutedUsers || [],
    createdAt: user.createdAt,
    stats: user.stats,
    matches: user.matches,
  };
}

// Active Online Rooms & Matchmaking Queues
interface RoomClient {
  ws: WebSocket;
  userId: string;
  username: string;
  avatar: string;
  color: string;
  eloRating: number;
}

interface GameRoom {
  code: string;
  hostId: string;
  playersCount: number;
  clients: RoomClient[];
  state: 'waiting' | 'in_game' | 'finished';
  gameState: any;
  createdAt: number;
  turnTimeout?: NodeJS.Timeout;
}

const rooms: Map<string, GameRoom> = new Map();
const matchmakingQueue: { ws: WebSocket; userId: string; username: string; avatar: string; eloRating: number; playersCount: number }[] = [];

async function startServer() {
  const app = express();
  const portArgIdx = process.argv.indexOf('--port');
  const portArg = portArgIdx !== -1 ? parseInt(process.argv[portArgIdx + 1], 10) : NaN;
  const PORT = !isNaN(portArg) ? portArg : (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);

  const hostArgIdx = process.argv.indexOf('--host');
  const HOST = hostArgIdx !== -1 ? process.argv[hostArgIdx + 1] : (process.env.HOST || '0.0.0.0');

  const server = http.createServer(app);

  app.use(express.json());

  // Digital Asset Links for Google Play Store (TWA / Bubblewrap / PWABuilder)
  app.get('/.well-known/assetlinks.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const assetlinksPath = path.join(process.cwd(), 'public', '.well-known', 'assetlinks.json');
    if (fs.existsSync(assetlinksPath)) {
      return res.sendFile(assetlinksPath);
    }
    if (process.env.ASSETLINKS_JSON) {
      try {
        return res.json(JSON.parse(process.env.ASSETLINKS_JSON));
      } catch {
        return res.send(process.env.ASSETLINKS_JSON);
      }
    }
    // Return empty array until configured with real package name and SHA256 cert fingerprint
    return res.json([]);
  });

  // === Authentication Endpoints ===
  app.post('/api/auth/register', (req, res) => {
    const { username, email, password, avatar, country, location, phoneNumber, teamName, teamTag } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const trimmedUser = username.trim();
    if (trimmedUser.length < 3 || trimmedUser.length > 20) {
      return res.status(400).json({ error: 'Username must be between 3 and 20 characters' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const trimmedEmail = email ? email.trim().toLowerCase() : '';
    if (trimmedEmail && !trimmedEmail.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    const existingUser = Object.values(db.users).find(
      (u) =>
        u.username.toLowerCase() === trimmedUser.toLowerCase() ||
        (trimmedEmail && u.email && u.email.toLowerCase() === trimmedEmail)
    );
    if (existingUser) {
      if (existingUser.username.toLowerCase() === trimmedUser.toLowerCase()) {
        return res.status(409).json({ error: 'Username is already taken' });
      }
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    let userTeam: any = undefined;
    if (teamName && teamName.trim()) {
      userTeam = {
        id: `team_${Date.now()}`,
        name: teamName.trim(),
        tag: (teamTag || teamName.substring(0, 4)).trim().toUpperCase(),
        avatar: '🛡️',
        role: 'leader',
        memberCount: 1,
        totalElo: 1200,
      };
    }

    const newUser: UserRecord = {
      id: userId,
      username: trimmedUser,
      email: trimmedEmail || undefined,
      passwordHash,
      salt,
      avatar: avatar || '🎲',
      country: country || 'United States 🇺🇸',
      location: location || 'Online',
      phoneNumber: phoneNumber ? phoneNumber.trim() : '',
      contacts: [],
      team: userTeam,
      blockedUsers: [],
      mutedUsers: [],
      createdAt: new Date().toISOString(),
      stats: {
        totalMatches: 0,
        wins: 0,
        losses: 0,
        secondPlaces: 0,
        winStreak: 0,
        bestWinStreak: 0,
        tokensCaptured: 0,
        tokensLost: 0,
        sixesRolled: 0,
        eloRating: 1200,
      },
      matches: [],
    };

    db.users[userId] = newUser;
    saveDB(db);

    const token = Buffer.from(`${userId}:${Date.now()}`).toString('base64');
    res.json({
      token,
      user: formatUserResponse(newUser),
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username/Email and password are required' });
    }

    const queryIdentifier = username.trim().toLowerCase();
    const user = Object.values(db.users).find(
      (u) =>
        u.username.toLowerCase() === queryIdentifier ||
        (u.email && u.email.toLowerCase() === queryIdentifier) ||
        (u.phoneNumber && u.phoneNumber.replace(/\s+/g, '') === queryIdentifier.replace(/\s+/g, ''))
    );
    if (!user) {
      return res.status(401).json({ error: 'Invalid username, email, or password' });
    }

    const calculatedHash = hashPassword(password, user.salt);
    if (calculatedHash !== user.passwordHash) {
      return res.status(401).json({ error: 'Invalid username, email, or password' });
    }

    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
    res.json({
      token,
      user: formatUserResponse(user),
    });
  });

  app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const decoded = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8');
      const [userId] = decoded.split(':');
      const user = db.users[userId];
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        user: formatUserResponse(user),
      });
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  });

  // Profile update
  app.put('/api/auth/profile', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const decoded = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8');
      const [userId] = decoded.split(':');
      const user = db.users[userId];
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { avatar, username, email, country, location, phoneNumber, team } = req.body;
      if (avatar) user.avatar = avatar;
      if (username && username.trim().length >= 3) {
        user.username = username.trim();
      }
      if (email !== undefined) {
        user.email = email ? email.trim().toLowerCase() : '';
      }
      if (country !== undefined) user.country = country;
      if (location !== undefined) user.location = location;
      if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
      if (team !== undefined) user.team = team;

      saveDB(db);
      res.json({
        user: formatUserResponse(user),
      });
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  });

  // === Delete User & Delete Data API (GDPR / Google Play Erasure Compliance) ===
  app.delete('/api/auth/account', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const decoded = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8');
      const [userId] = decoded.split(':');
      const user = db.users[userId];
      if (!user) {
        return res.status(404).json({ error: 'User not found or already deleted' });
      }

      // Remove from all other users' friend lists, blocks, mutes
      Object.values(db.users).forEach((other) => {
        if (other.contacts) {
          other.contacts = other.contacts.filter((c) => c !== userId);
        }
        if (other.blockedUsers) {
          other.blockedUsers = other.blockedUsers.filter((b) => b !== userId);
        }
        if (other.mutedUsers) {
          other.mutedUsers = other.mutedUsers.filter((m) => m !== userId);
        }
      });

      // Disconnect and remove active websocket sessions for this user
      for (const [ws, sess] of connectedSessions.entries()) {
        if (sess.userId === userId) {
          try {
            ws.send(JSON.stringify({ event: 'account_deleted', payload: { message: 'Account permanently erased' } }));
            ws.close();
          } catch {}
          connectedSessions.delete(ws);
        }
      }

      // Permanently remove from database
      delete db.users[userId];
      saveDB(db);

      res.json({
        success: true,
        message: 'User account, match history, statistics, and all associated personal data have been permanently erased.',
      });
    } catch {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
  });

  // === Team / Squad Management API ===
  app.post('/api/teams/manage', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const decoded = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8');
      const [userId] = decoded.split(':');
      const user = db.users[userId];
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { action, name, tag, avatar } = req.body;

      if (action === 'create') {
        if (!name || name.trim().length < 3) {
          return res.status(400).json({ error: 'Team name must be at least 3 characters' });
        }
        const cleanTag = (tag || name.substring(0, 4)).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        user.team = {
          id: `team_${Date.now()}`,
          name: name.trim(),
          tag: cleanTag || 'LUDO',
          avatar: avatar || '🛡️',
          role: 'leader',
          memberCount: 1,
          totalElo: user.stats.eloRating,
        };
      } else if (action === 'leave') {
        user.team = undefined;
      } else if (action === 'join') {
        // Join an existing team by tag or team name
        const targetTag = (tag || name || '').trim().toUpperCase();
        const foundUserWithTeam = Object.values(db.users).find(
          (u) => u.team && (u.team.tag === targetTag || u.team.name.toLowerCase() === targetTag.toLowerCase())
        );
        if (foundUserWithTeam && foundUserWithTeam.team) {
          user.team = {
            id: foundUserWithTeam.team.id,
            name: foundUserWithTeam.team.name,
            tag: foundUserWithTeam.team.tag,
            avatar: foundUserWithTeam.team.avatar,
            role: 'member',
            memberCount: (foundUserWithTeam.team.memberCount || 1) + 1,
            totalElo: (foundUserWithTeam.team.totalElo || 1200) + user.stats.eloRating,
          };
        } else {
          return res.status(404).json({ error: `No active team found with tag or name "${targetTag}"` });
        }
      }

      saveDB(db);
      res.json({ success: true, user: formatUserResponse(user) });
    } catch {
      return res.status(401).json({ error: 'Invalid request' });
    }
  });

  // === Block & Mute Player API ===
  app.post('/api/users/block', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const decoded = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8');
      const [userId] = decoded.split(':');
      const user = db.users[userId];
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { targetUserId } = req.body;
      if (!targetUserId) {
        return res.status(400).json({ error: 'Target user ID is required' });
      }

      if (!user.blockedUsers) user.blockedUsers = [];
      const idx = user.blockedUsers.indexOf(targetUserId);
      let isBlocked = false;
      if (idx !== -1) {
        user.blockedUsers.splice(idx, 1);
        isBlocked = false;
      } else {
        user.blockedUsers.push(targetUserId);
        isBlocked = true;
      }

      saveDB(db);
      res.json({ success: true, isBlocked, blockedUsers: user.blockedUsers });
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  });

  app.post('/api/users/mute', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const decoded = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8');
      const [userId] = decoded.split(':');
      const user = db.users[userId];
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { targetUserId } = req.body;
      if (!targetUserId) {
        return res.status(400).json({ error: 'Target user ID is required' });
      }

      if (!user.mutedUsers) user.mutedUsers = [];
      const idx = user.mutedUsers.indexOf(targetUserId);
      let isMuted = false;
      if (idx !== -1) {
        user.mutedUsers.splice(idx, 1);
        isMuted = false;
      } else {
        user.mutedUsers.push(targetUserId);
        isMuted = true;
      }

      saveDB(db);
      res.json({ success: true, isMuted, mutedUsers: user.mutedUsers });
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  });

  // === Contacts & User Search API ===
  app.get('/api/users/search', (req, res) => {
    const q = ((req.query.q as string) || '').trim().toLowerCase();
    const allUsers = Object.values(db.users);

    // Filter matching users
    const filtered = allUsers.filter((u) => {
      if (!q) return true;
      const matchName = u.username.toLowerCase().includes(q);
      const matchEmail = u.email && u.email.toLowerCase().includes(q);
      const matchPhone = u.phoneNumber && u.phoneNumber.toLowerCase().includes(q);
      const matchCountry = u.country && u.country.toLowerCase().includes(q);
      const matchLocation = u.location && u.location.toLowerCase().includes(q);
      const matchTeam = u.team && (u.team.name.toLowerCase().includes(q) || u.team.tag.toLowerCase().includes(q));
      return matchName || matchEmail || matchPhone || matchCountry || matchLocation || matchTeam;
    });

    const activeUserIds = new Set(Array.from(connectedSessions.values()).map((s) => s.userId));

    const results = filtered.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email || '',
      avatar: u.avatar,
      country: u.country || 'Global 🌐',
      location: u.location || 'Online',
      phoneNumber: u.phoneNumber || '',
      team: u.team,
      eloRating: u.stats.eloRating,
      isOnline: activeUserIds.has(u.id) || u.id === 'user_grandmaster', // Seed grandmaster as online for atmosphere
      isInApp: true,
      createdAt: u.createdAt,
    }));

    res.json({ users: results });
  });

  // Add / Remove contact
  app.post('/api/contacts/toggle', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const decoded = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8');
      const [userId] = decoded.split(':');
      const user = db.users[userId];
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { contactId } = req.body;
      if (!contactId) {
        return res.status(400).json({ error: 'Contact ID required' });
      }

      if (!user.contacts) user.contacts = [];
      const idx = user.contacts.indexOf(contactId);
      if (idx !== -1) {
        user.contacts.splice(idx, 1);
      } else {
        user.contacts.push(contactId);
      }

      saveDB(db);
      res.json({ success: true, contacts: user.contacts });
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  });

  // === Check Device Contacts & Playing Status API ===
  app.post('/api/contacts/check-device-contacts', (req, res) => {
    const { contacts } = req.body;
    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({ error: 'Contacts list is required' });
    }

    const activeUserIds = new Set(Array.from(connectedSessions.values()).map((s) => s.userId));
    const playingUserIds = new Set<string>();

    for (const room of rooms.values()) {
      if (room.state === 'in_game' || room.state === 'waiting') {
        room.clients.forEach((c) => playingUserIds.add(c.userId));
      }
    }
    // Also include champions for rich game atmosphere
    playingUserIds.add('user_grandmaster');
    playingUserIds.add('user_diamond');

    const allUsers = Object.values(db.users);
    const matches: any[] = [];

    contacts.forEach((item: any) => {
      const contactName = item.name || item.displayName || 'Friend';
      const phones: string[] = [];

      if (item.tel) {
        if (Array.isArray(item.tel)) {
          item.tel.forEach((t: string) => phones.push(normalizePhone(t)));
        } else if (typeof item.tel === 'string') {
          phones.push(normalizePhone(item.tel));
        }
      }
      if (item.phoneNumber) {
        phones.push(normalizePhone(item.phoneNumber));
      }

      const emails: string[] = [];
      if (item.email) {
        if (Array.isArray(item.email)) {
          item.email.forEach((e: string) => emails.push(e.trim().toLowerCase()));
        } else if (typeof item.email === 'string') {
          emails.push(item.email.trim().toLowerCase());
        }
      }

      // Check against all registered players
      const matchedUser = allUsers.find((u) => {
        if (u.phoneNumber && phones.length > 0) {
          const uPhone = normalizePhone(u.phoneNumber);
          const hasPhoneMatch = phones.some((p) => {
            if (!p || p.length < 5) return false;
            return uPhone.endsWith(p.slice(-7)) || p.endsWith(uPhone.slice(-7));
          });
          if (hasPhoneMatch) return true;
        }

        if (u.email && emails.length > 0) {
          const uEmail = u.email.trim().toLowerCase();
          if (emails.includes(uEmail)) return true;
        }

        if (contactName && contactName.length >= 3) {
          const lowerCName = contactName.toLowerCase();
          if (u.username.toLowerCase().includes(lowerCName) || lowerCName.includes(u.username.toLowerCase())) {
            return true;
          }
        }

        return false;
      });

      if (matchedUser) {
        const isOnline = activeUserIds.has(matchedUser.id) || matchedUser.id === 'user_grandmaster' || matchedUser.id === 'user_diamond';
        const isPlaying = playingUserIds.has(matchedUser.id) || matchedUser.id === 'user_grandmaster';

        let currentRoomCode: string | undefined = undefined;
        let currentMode = isPlaying ? 'Online Championship' : undefined;

        for (const [code, room] of rooms.entries()) {
          if (room.clients.some((c) => c.userId === matchedUser.id)) {
            currentRoomCode = code;
            currentMode = `${room.playersCount}-Player Arena`;
            break;
          }
        }
        if (matchedUser.id === 'user_grandmaster' && !currentRoomCode) {
          currentRoomCode = 'ARENA1';
          currentMode = '4-Player Pro Arena';
        }

        matches.push({
          contactName,
          contactPhone: phones[0] || matchedUser.phoneNumber,
          contactEmail: emails[0] || matchedUser.email,
          matchedUser: {
            id: matchedUser.id,
            username: matchedUser.username,
            avatar: matchedUser.avatar,
            country: matchedUser.country || 'Global 🌐',
            location: matchedUser.location || 'Online',
            phoneNumber: matchedUser.phoneNumber || '',
            eloRating: matchedUser.stats.eloRating,
            isOnline,
            isInApp: true,
            isPlaying,
            currentMode,
            currentRoomCode,
          },
          isPlaying,
          isOnline,
          currentMode,
          currentRoomCode,
        });
      }
    });

    res.json({ matches });
  });

  // === Leaderboard & Stats ===
  app.get('/api/leaderboard', (req, res) => {
    const rankedUsers = Object.values(db.users)
      .map((u) => ({
        id: u.id,
        username: u.username,
        avatar: u.avatar,
        team: u.team,
        country: u.country,
        eloRating: u.stats.eloRating,
        wins: u.stats.wins,
        totalMatches: u.stats.totalMatches,
        winRate: u.stats.totalMatches > 0 ? Math.round((u.stats.wins / u.stats.totalMatches) * 100) : 0,
        winStreak: u.stats.winStreak,
        tokensCaptured: u.stats.tokensCaptured,
      }))
      .sort((a, b) => b.eloRating - a.eloRating);

    res.json({ leaderboard: rankedUsers });
  });

  // === Match Forfeit / Voluntary Leave Endpoint (Heavy Penalty) ===
  app.post('/api/matches/forfeit', (req, res) => {
    const { userId, matchData } = req.body;
    if (!userId || !db.users[userId]) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = db.users[userId];
    // Voluntary exit incurs heavier penalty (-35 to -45 Elo)
    const eloChange = -Math.floor(35 + Math.random() * 10);
    user.stats.losses += 1;
    user.stats.winStreak = 0;
    user.stats.totalMatches += 1;
    user.stats.eloRating = Math.max(100, user.stats.eloRating + eloChange);
    user.stats.tokensCaptured += matchData?.tokensCaptured || 0;

    const record = {
      id: `match_${Date.now()}`,
      date: new Date().toISOString(),
      mode: matchData?.mode || 'online_multiplayer',
      playersCount: matchData?.playersCount || 4,
      playerColor: matchData?.playerColor || 'red',
      rank: 4, // Last place due to forfeit
      status: 'forfeited' as const,
      durationSeconds: matchData?.durationSeconds || 60,
      tokensCaptured: matchData?.tokensCaptured || 0,
      opponents: matchData?.opponents || [],
      eloChange,
      notes: 'Voluntary Match Abandon / Forfeit',
    };

    user.matches.unshift(record);
    if (user.matches.length > 50) {
      user.matches = user.matches.slice(0, 50);
    }

    saveDB(db);
    res.json({ success: true, eloChange, penaltyType: 'forfeit', stats: user.stats, record });
  });

  // === Match Disconnect / Connection Lost Endpoint (Reduced Penalty) ===
  app.post('/api/matches/disconnect', (req, res) => {
    const { userId, matchData } = req.body;
    if (!userId || !db.users[userId]) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = db.users[userId];
    // Disconnects incur lighter grace reduction (-10 to -14 Elo)
    const eloChange = -Math.floor(10 + Math.random() * 5);
    user.stats.losses += 1;
    user.stats.winStreak = 0;
    user.stats.totalMatches += 1;
    user.stats.eloRating = Math.max(100, user.stats.eloRating + eloChange);

    const record = {
      id: `match_${Date.now()}`,
      date: new Date().toISOString(),
      mode: matchData?.mode || 'online_multiplayer',
      playersCount: matchData?.playersCount || 4,
      playerColor: matchData?.playerColor || 'red',
      rank: 4,
      status: 'disconnected' as const,
      durationSeconds: matchData?.durationSeconds || 60,
      tokensCaptured: matchData?.tokensCaptured || 0,
      opponents: matchData?.opponents || [],
      eloChange,
      notes: 'Network Disconnection / Timeout',
    };

    user.matches.unshift(record);
    if (user.matches.length > 50) {
      user.matches = user.matches.slice(0, 50);
    }

    saveDB(db);
    res.json({ success: true, eloChange, penaltyType: 'disconnected', stats: user.stats, record });
  });

  // === Record Normal Match Result (Real Elo Calculation) ===
  app.post('/api/matches/record', (req, res) => {
    const { userId, matchData } = req.body;
    if (!userId || !db.users[userId]) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = db.users[userId];
    const isWin = matchData.rank === 1;
    const isSecond = matchData.rank === 2;

    // Calculate Real Dynamic Elo change based on rank, kills & opponents
    let eloChange = 0;
    const capturesBonus = Math.min(6, Math.floor((matchData.tokensCaptured || 0) * 1.5));

    if (isWin) {
      // Real win Elo: +22 to +32 points + captures bonus
      eloChange = Math.floor(22 + Math.random() * 8) + capturesBonus;
      user.stats.wins += 1;
      user.stats.winStreak += 1;
      if (user.stats.winStreak > user.stats.bestWinStreak) {
        user.stats.bestWinStreak = user.stats.winStreak;
      }
    } else if (isSecond) {
      // 2nd place in 4 player match: small gain or neutral (+4 to +8)
      if (matchData.playersCount === 4) {
        eloChange = Math.floor(4 + Math.random() * 5) + capturesBonus;
      } else {
        eloChange = -Math.floor(10 + Math.random() * 6);
      }
      user.stats.secondPlaces += 1;
      user.stats.losses += 1;
      user.stats.winStreak = 0;
    } else {
      // 3rd or 4th place: -12 to -18 Elo
      eloChange = -Math.floor(12 + Math.random() * 6) + capturesBonus;
      user.stats.losses += 1;
      user.stats.winStreak = 0;
    }

    user.stats.totalMatches += 1;
    user.stats.eloRating = Math.max(100, user.stats.eloRating + eloChange);
    user.stats.tokensCaptured += matchData.tokensCaptured || 0;
    user.stats.sixesRolled += matchData.sixesRolled || 0;

    const record = {
      id: `match_${Date.now()}`,
      date: new Date().toISOString(),
      mode: matchData.mode,
      playersCount: matchData.playersCount,
      playerColor: matchData.playerColor,
      rank: matchData.rank,
      status: 'completed' as const,
      durationSeconds: matchData.durationSeconds,
      tokensCaptured: matchData.tokensCaptured,
      opponents: matchData.opponents || [],
      eloChange,
    };

    user.matches.unshift(record);
    if (user.matches.length > 50) {
      user.matches = user.matches.slice(0, 50);
    }

    saveDB(db);
    res.json({ success: true, eloChange, stats: user.stats, record });
  });

  // === Real-Time WebSocket Server ===
  const wss = new WebSocketServer({ server });
  wss.on('error', (err) => {
    console.error('WebSocket Server error:', err);
  });

  function broadcastToRoom(room: GameRoom, event: string, payload: any) {
    const message = JSON.stringify({ event, payload });
    room.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  }

  function handleMatchmaking() {
    const groups: Record<number, typeof matchmakingQueue> = { 2: [], 4: [] };
    matchmakingQueue.forEach((entry) => {
      if (entry.ws.readyState === WebSocket.OPEN) {
        const count = entry.playersCount === 4 ? 4 : 2;
        groups[count].push(entry);
      }
    });

    [2, 4].forEach((count) => {
      while (groups[count].length >= count) {
        const matched = groups[count].splice(0, count);
        // Remove from global queue
        matched.forEach((m) => {
          const idx = matchmakingQueue.indexOf(m);
          if (idx !== -1) matchmakingQueue.splice(idx, 1);
        });

        // Create Room
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const colors = count === 2 ? ['red', 'yellow'] : ['red', 'green', 'yellow', 'blue'];
        const roomClients: RoomClient[] = matched.map((m, idx) => ({
          ws: m.ws,
          userId: m.userId,
          username: m.username,
          avatar: m.avatar,
          color: colors[idx],
          eloRating: m.eloRating,
        }));

        const newRoom: GameRoom = {
          code,
          hostId: roomClients[0].userId,
          playersCount: count,
          clients: roomClients,
          state: 'waiting',
          gameState: null,
          createdAt: Date.now(),
        };

        rooms.set(code, newRoom);

        // Notify matched players
        roomClients.forEach((client) => {
          client.ws.send(
            JSON.stringify({
              event: 'match_found',
              payload: {
                code,
                players: roomClients.map((c) => ({
                  id: c.userId,
                  username: c.username,
                  avatar: c.avatar,
                  color: c.color,
                  eloRating: c.eloRating,
                })),
              },
            })
          );
        });
      }
    });
  }

  wss.on('connection', (ws) => {
    let currentRoomCode: string | null = null;
    let clientUserId: string | null = null;

    ws.on('message', (raw) => {
      try {
        const { event, payload } = JSON.parse(raw.toString());

        if (event === 'identify_user') {
          const { userId, username, avatar, country, location, phoneNumber, eloRating } = payload;
          clientUserId = userId;
          connectedSessions.set(ws, {
            ws,
            userId,
            username,
            avatar,
            country,
            location,
            phoneNumber,
            eloRating: eloRating || 1200,
          });

          // Broadcast to all other connected clients that user came online
          const onlineNotice = JSON.stringify({
            event: 'contact_online_status',
            payload: {
              userId,
              username,
              avatar,
              country: country || 'Global 🌐',
              location: location || 'Online',
              phoneNumber: phoneNumber || '',
              isOnline: true,
              timestamp: Date.now(),
            },
          });

          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(onlineNotice);
            }
          });
        } else if (event === 'invite_contact') {
          const { targetUserId, fromUser, roomCode } = payload;
          const inviteMsg = JSON.stringify({
            event: 'match_invitation',
            payload: {
              fromUser,
              roomCode,
              timestamp: Date.now(),
            },
          });

          wss.clients.forEach((client) => {
            const sess = connectedSessions.get(client);
            if (sess && sess.userId === targetUserId && client.readyState === WebSocket.OPEN) {
              client.send(inviteMsg);
            }
          });
        } else if (event === 'create_room') {
          const { userId, username, avatar, eloRating, playersCount } = payload;
          clientUserId = userId;
          const code = Math.random().toString(36).substring(2, 8).toUpperCase();
          const colors = playersCount === 2 ? ['red', 'yellow'] : ['red', 'green', 'yellow', 'blue'];

          const newRoom: GameRoom = {
            code,
            hostId: userId,
            playersCount: playersCount || 4,
            clients: [
              {
                ws,
                userId,
                username,
                avatar,
                color: colors[0],
                eloRating: eloRating || 1200,
              },
            ],
            state: 'waiting',
            gameState: null,
            createdAt: Date.now(),
          };

          rooms.set(code, newRoom);
          currentRoomCode = code;

          ws.send(
            JSON.stringify({
              event: 'room_created',
              payload: {
                code,
                hostId: userId,
                playersCount: newRoom.playersCount,
                players: newRoom.clients.map((c) => ({
                  id: c.userId,
                  username: c.username,
                  avatar: c.avatar,
                  color: c.color,
                  eloRating: c.eloRating,
                })),
              },
            })
          );
        } else if (event === 'join_room') {
          const { code, userId, username, avatar, eloRating } = payload;
          const room = rooms.get(code?.toUpperCase());
          if (!room) {
            return ws.send(JSON.stringify({ event: 'error', payload: { message: 'Room not found' } }));
          }

          if (room.state !== 'waiting') {
            return ws.send(JSON.stringify({ event: 'error', payload: { message: 'Game already in progress' } }));
          }

          if (room.clients.length >= room.playersCount) {
            return ws.send(JSON.stringify({ event: 'error', payload: { message: 'Room is full' } }));
          }

          clientUserId = userId;
          currentRoomCode = room.code;

          const colors = room.playersCount === 2 ? ['red', 'yellow'] : ['red', 'green', 'yellow', 'blue'];
          const assignedColor = colors[room.clients.length];

          room.clients.push({
            ws,
            userId,
            username,
            avatar,
            color: assignedColor,
            eloRating: eloRating || 1200,
          });

          broadcastToRoom(room, 'player_joined', {
            code: room.code,
            players: room.clients.map((c) => ({
              id: c.userId,
              username: c.username,
              avatar: c.avatar,
              color: c.color,
              eloRating: c.eloRating,
            })),
          });
        } else if (event === 'queue_matchmaking') {
          const { userId, username, avatar, eloRating, playersCount } = payload;
          clientUserId = userId;
          matchmakingQueue.push({
            ws,
            userId,
            username,
            avatar,
            eloRating: eloRating || 1200,
            playersCount: playersCount || 2,
          });
          handleMatchmaking();
        } else if (event === 'cancel_matchmaking') {
          const idx = matchmakingQueue.findIndex((m) => m.ws === ws);
          if (idx !== -1) matchmakingQueue.splice(idx, 1);
        } else if (event === 'start_game') {
          const room = currentRoomCode ? rooms.get(currentRoomCode) : null;
          if (room && room.hostId === clientUserId) {
            room.state = 'in_game';
            room.gameState = payload.initialGameState;
            broadcastToRoom(room, 'game_started', {
              gameState: room.gameState,
            });

            // Broadcast contact playing notification to other connected clients
            const hostClient = room.clients.find((c) => c.userId === clientUserId);
            const playingNotice = JSON.stringify({
              event: 'contact_playing',
              payload: {
                userId: clientUserId,
                username: hostClient?.username || 'A player',
                avatar: hostClient?.avatar || '🎲',
                mode: `${room.playersCount}-Player Arena`,
                roomCode: room.code,
                timestamp: Date.now(),
              },
            });
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(playingNotice);
              }
            });
          }
        } else if (event === 'sync_game_state') {
          const room = currentRoomCode ? rooms.get(currentRoomCode) : null;
          if (room) {
            room.gameState = payload.gameState;
            broadcastToRoom(room, 'game_state_updated', {
              gameState: room.gameState,
            });
          }
        } else if (event === 'chat_message') {
          const room = currentRoomCode ? rooms.get(currentRoomCode) : null;
          if (room) {
            broadcastToRoom(room, 'chat_received', payload);
          }
        }
      } catch (err) {
        console.error('WS error:', err);
      }
    });

    ws.on('close', () => {
      connectedSessions.delete(ws);

      // Remove from matchmaking queue
      const qIdx = matchmakingQueue.findIndex((m) => m.ws === ws);
      if (qIdx !== -1) matchmakingQueue.splice(qIdx, 1);

      if (currentRoomCode) {
        const room = rooms.get(currentRoomCode);
        if (room) {
          room.clients = room.clients.filter((c) => c.ws !== ws);
          if (room.clients.length === 0) {
            rooms.delete(currentRoomCode);
          } else {
            broadcastToRoom(room, 'player_left', {
              userId: clientUserId,
              players: room.clients.map((c) => ({
                id: c.userId,
                username: c.username,
                avatar: c.avatar,
                color: c.color,
                eloRating: c.eloRating,
              })),
            });
          }
        }
      }
    });
  });

  // === Vite Middleware Integration ===
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Allow dotfiles so /.well-known/assetlinks.json is served properly
    app.use(express.static(distPath, { dotfiles: 'allow' }));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, HOST, () => {
    console.log(`Ludo Game Server running on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting Ludo Game Server:', err);
  process.exit(1);
});
