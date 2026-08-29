export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
  algorithmName: string;
  modeName: string;
  timestamp: string;
}

export type NewEntry = Omit<LeaderboardEntry, 'rank'>;

const MAX_ENTRIES = 10;
const KEY_PREFIX = 'cpu-scheduler-game:leaderboard:';

export function leaderboardKey(algorithmName: string, modeName: string): string {
  return `${algorithmName}:${modeName}`;
}

export function validatePlayerName(name: string): string | null {
  if (name.length < 1 || name.length > 32) {
    return 'Player name must be between 1 and 32 characters.';
  }
  return null;
}

/** Top-10 local leaderboard with an in-memory fallback (Requirement 15). */
export class LeaderboardService {
  private memory = new Map<string, LeaderboardEntry[]>();
  storageUnavailable = false;

  private read(key: string): LeaderboardEntry[] {
    try {
      const raw = globalThis.localStorage?.getItem(KEY_PREFIX + key);
      if (raw) return JSON.parse(raw) as LeaderboardEntry[];
      return this.memory.get(key) ?? [];
    } catch {
      this.storageUnavailable = true;
      return this.memory.get(key) ?? [];
    }
  }

  private write(key: string, entries: LeaderboardEntry[]): void {
    this.memory.set(key, entries);
    try {
      globalThis.localStorage?.setItem(KEY_PREFIX + key, JSON.stringify(entries));
    } catch {
      this.storageUnavailable = true;
    }
  }

  getEntries(key: string): LeaderboardEntry[] {
    return this.read(key);
  }

  addEntry(key: string, entry: NewEntry): string | null {
    const error = validatePlayerName(entry.playerName);
    if (error) return error;
    const merged = [...this.read(key), { ...entry, rank: 0 }]
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ENTRIES)
      .map((item, index) => ({ ...item, rank: index + 1 }));
    this.write(key, merged);
    return null;
  }

  clear(key: string): void {
    this.memory.delete(key);
    try {
      globalThis.localStorage?.removeItem(KEY_PREFIX + key);
    } catch {
      this.storageUnavailable = true;
    }
  }
}

export function formatTimestamp(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}
