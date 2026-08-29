import { describe, expect, it, beforeEach } from 'vitest';
import fc from 'fast-check';
import {
  LeaderboardService,
  validatePlayerName,
  formatTimestamp,
} from '../../game/LeaderboardService';

const entry = (score: number) => ({
  playerName: 'Player',
  score,
  algorithmName: 'FCFS',
  modeName: 'challenge',
  timestamp: formatTimestamp(new Date(0)),
});

describe('Property 24: Leaderboard maintains the top-10 invariant and sort order', () => {
  it('never exceeds 10 entries, stays sorted desc, ranks 1..N, evicts the lowest', () => {
    fc.assert(
      fc.property(fc.array(fc.integer({ min: 0, max: 10000 }), { minLength: 1, maxLength: 40 }), (scores) => {
        localStorage.clear();
        const board = new LeaderboardService();
        for (const score of scores) board.addEntry('K', entry(score));
        const entries = board.getEntries('K');
        expect(entries.length).toBeLessThanOrEqual(10);
        for (let i = 1; i < entries.length; i += 1) {
          expect(entries[i - 1]!.score).toBeGreaterThanOrEqual(entries[i]!.score);
          expect(entries[i]!.rank).toBe(i + 1);
        }
        const top10 = [...scores].sort((a, b) => b - a).slice(0, 10);
        expect(entries.map((e) => e.score)).toEqual(top10);
      }),
      { numRuns: 100 },
    );
  });
});

describe('LeaderboardService details', () => {
  beforeEach(() => localStorage.clear());

  it('persists across service instances via localStorage', () => {
    new LeaderboardService().addEntry('K', entry(500));
    expect(new LeaderboardService().getEntries('K')[0]!.score).toBe(500);
  });

  it('rejects invalid player names', () => {
    expect(validatePlayerName('')).not.toBeNull();
    expect(validatePlayerName('x'.repeat(33))).not.toBeNull();
    expect(validatePlayerName('Ada')).toBeNull();
    const board = new LeaderboardService();
    expect(board.addEntry('K', { ...entry(1), playerName: '' })).not.toBeNull();
  });

  it('formats timestamps as YYYY-MM-DD HH:MM:SS', () => {
    expect(formatTimestamp(new Date(2026, 7, 30, 9, 5, 3))).toBe('2026-08-30 09:05:03');
  });
});
