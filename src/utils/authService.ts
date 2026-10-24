import { UserProfile } from '../types/ludo';

interface StoredAccount {
  user: UserProfile;
  password: string; // Plain/hashed for client-side fallback storage
}

const STORAGE_KEY = 'ludo_local_accounts';

const SEED_ACCOUNTS: StoredAccount[] = [
  {
    user: {
      id: 'user_grandmaster',
      username: 'KingLudo_99',
      email: 'king@ludoarena.app',
      avatar: '👑',
      country: 'United States 🇺🇸',
      location: 'New York, NY',
      phoneNumber: '+1 (555) 234-5678',
      contacts: [],
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
      matches: [],
    },
    password: 'password123',
  },
  {
    user: {
      id: 'user_alex',
      username: 'Alex_Champion',
      email: 'alex@ludoarena.app',
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
    password: 'password123',
  },
];

function getStoredAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ACCOUNTS));
      return SEED_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return SEED_ACCOUNTS;
  } catch {
    return SEED_ACCOUNTS;
  }
}

function saveStoredAccounts(accounts: StoredAccount[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.warn('Could not save local accounts:', err);
  }
}

// Safely attempts to parse server response without crashing on HTML error pages
async function safeParseResponse(res: Response): Promise<{
  isJson: boolean;
  data: any;
  status: number;
  ok: boolean;
}> {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      const data = await res.json();
      return { isJson: true, data, status: res.status, ok: res.ok };
    } catch {
      // JSON syntax error
    }
  }

  // Handle HTML or text error response (e.g. Vercel "The page cannot be found")
  try {
    await res.text();
  } catch {}

  return { isJson: false, data: null, status: res.status, ok: false };
}

export interface RegisterPayload {
  username: string;
  password: string;
  email?: string;
  phoneNumber?: string;
  country?: string;
  location?: string;
  avatar?: string;
  teamName?: string;
  teamTag?: string;
}

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  token?: string;
  error?: string;
}

export async function loginUser(identifier: string, password: string): Promise<AuthResult> {
  const cleanId = (identifier || '').trim().toLowerCase();
  if (!cleanId || !password) {
    return { success: false, error: 'Username/Email and password are required' };
  }

  // 1. Attempt backend API first
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: identifier.trim(), password }),
    });

    const parsed = await safeParseResponse(res);
    if (parsed.isJson) {
      if (parsed.ok && parsed.data?.user && parsed.data?.token) {
        // Also sync into local storage cache
        const accounts = getStoredAccounts();
        const existingIdx = accounts.findIndex(
          (a) => a.user.id === parsed.data.user.id || a.user.username.toLowerCase() === cleanId
        );
        if (existingIdx !== -1) {
          accounts[existingIdx] = { user: parsed.data.user, password };
        } else {
          accounts.push({ user: parsed.data.user, password });
        }
        saveStoredAccounts(accounts);

        return { success: true, user: parsed.data.user, token: parsed.data.token };
      } else {
        return { success: false, error: parsed.data?.error || 'Invalid username, email, or password' };
      }
    }
  } catch {
    // Backend network error or offline — fall through to local storage
  }

  // 2. Client-Side Fallback (for static Vercel deployment or offline PWA)
  const accounts = getStoredAccounts();
  const matched = accounts.find((a) => {
    const u = a.user;
    return (
      u.username.toLowerCase() === cleanId ||
      (u.email && u.email.toLowerCase() === cleanId) ||
      (u.phoneNumber && u.phoneNumber.replace(/\s+/g, '') === cleanId.replace(/\s+/g, ''))
    );
  });

  if (!matched) {
    return { success: false, error: 'Account not found. Please verify your username/email or register.' };
  }

  if (matched.password !== password) {
    return { success: false, error: 'Invalid password. Please check your credentials.' };
  }

  const token = btoa(`${matched.user.id}:${Date.now()}`);
  return { success: true, user: matched.user, token };
}

export async function registerUser(payload: RegisterPayload): Promise<AuthResult> {
  const cleanUsername = payload.username.trim();
  if (!cleanUsername || cleanUsername.length < 2) {
    return { success: false, error: 'Username must be at least 2 characters long' };
  }
  if (!payload.password || payload.password.length < 4) {
    return { success: false, error: 'Password must be at least 4 characters long' };
  }

  // 1. Attempt backend API first
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const parsed = await safeParseResponse(res);
    if (parsed.isJson) {
      if (parsed.ok && parsed.data?.user && parsed.data?.token) {
        // Sync to local accounts
        const accounts = getStoredAccounts();
        accounts.push({ user: parsed.data.user, password: payload.password });
        saveStoredAccounts(accounts);
        return { success: true, user: parsed.data.user, token: parsed.data.token };
      } else {
        return { success: false, error: parsed.data?.error || 'Registration failed' };
      }
    }
  } catch {
    // Backend offline / static Vercel — fall through to client-side storage
  }

  // 2. Client-Side Fallback Registration
  const accounts = getStoredAccounts();
  const usernameLower = cleanUsername.toLowerCase();
  const emailLower = (payload.email || '').trim().toLowerCase();
  const phoneNormalized = (payload.phoneNumber || '').replace(/\s+/g, '');

  const alreadyExists = accounts.some((a) => {
    const u = a.user;
    if (u.username.toLowerCase() === usernameLower) return true;
    if (emailLower && u.email && u.email.toLowerCase() === emailLower) return true;
    if (phoneNormalized && u.phoneNumber && u.phoneNumber.replace(/\s+/g, '') === phoneNormalized) return true;
    return false;
  });

  if (alreadyExists) {
    return { success: false, error: 'Username, email, or phone number is already registered' };
  }

  const newId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newUser: UserProfile = {
    id: newId,
    username: cleanUsername,
    email: emailLower || undefined,
    phoneNumber: payload.phoneNumber ? payload.phoneNumber.trim() : undefined,
    avatar: payload.avatar || '👑',
    country: payload.country || 'Global 🌐',
    location: payload.location ? payload.location.trim() : 'Online',
    contacts: [],
    blockedUsers: [],
    mutedUsers: [],
    createdAt: new Date().toISOString(),
    team: payload.teamName
      ? {
          id: `team_${Date.now()}`,
          name: payload.teamName.trim(),
          tag: (payload.teamTag || payload.teamName.substring(0, 4)).trim().toUpperCase(),
          avatar: '🛡️',
          role: 'leader',
          memberCount: 1,
          totalElo: 1200,
        }
      : undefined,
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

  accounts.push({ user: newUser, password: payload.password });
  saveStoredAccounts(accounts);

  const token = btoa(`${newUser.id}:${Date.now()}`);
  return { success: true, user: newUser, token };
}

export async function fetchCurrentProfile(token: string): Promise<UserProfile | null> {
  // Try backend first
  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const parsed = await safeParseResponse(res);
    if (parsed.isJson && parsed.ok && parsed.data?.user) {
      return parsed.data.user;
    }
  } catch {}

  // Fallback to local accounts
  try {
    const decoded = atob(token);
    const [userId] = decoded.split(':');
    const accounts = getStoredAccounts();
    const matched = accounts.find((a) => a.user.id === userId);
    return matched ? matched.user : null;
  } catch {
    return null;
  }
}
