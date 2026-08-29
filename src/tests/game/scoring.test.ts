import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { challengeScore, optimizeScore } from '../../game/scoring';

// Feature: cpu-scheduler-game, Property 22: Challenge Mode Scoring Formula Is Correct
describe('Property 22: challenge scoring formula', () => {
  it('matches base + time bonus + capped streak multiplier, rounded', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 60, noNaN: true }),
        fc.integer({ min: 0, max: 30 }),
        (elapsedSeconds, streak) => {
          const timeBonus = Math.max(0, 50 - elapsedSeconds * 5);
          const raw = 100 + timeBonus;
          const multiplier = streak >= 2 ? Math.min(2.0, 1 + 0.1 * streak) : 1.0;
          expect(challengeScore({ elapsedSeconds, streak })).toBe(Math.round(raw * multiplier));
        },
      ),
      { numRuns: 100 },
    );
  });
});

// Feature: cpu-scheduler-game, Property 23: Optimize Mode Scoring Formula Is Correct
describe('Property 23: optimize scoring formula', () => {
  it('matches max(0, 1000 - round(delta/optimal * 1000)) with a zero-optimal guard', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 500, noNaN: true }),
        fc.double({ min: 0, max: 500, noNaN: true }),
        (resultMetric, optimalMetric) => {
          const { score } = optimizeScore(resultMetric, optimalMetric);
          if (optimalMetric === 0) {
            expect(score).toBe(resultMetric === 0 ? 1000 : 0);
          } else {
            const penalty = Math.round(((resultMetric - optimalMetric) / optimalMetric) * 1000);
            expect(score).toBe(Math.max(0, 1000 - penalty));
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('flags a perfect score', () => {
    expect(optimizeScore(4, 4)).toEqual({ score: 1000, isPerfect: true });
    expect(optimizeScore(0, 0)).toEqual({ score: 1000, isPerfect: true });
    expect(optimizeScore(5, 0)).toEqual({ score: 0, isPerfect: false });
  });
});
