import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { createSeededRNG } from '../../../core/rng/SeededRNG';
import { arbSeed } from '../../helpers/generators';

// Feature: cpu-scheduler-game, Property 21: SeededRNG Outputs Are Within Range
describe('Property 21: SeededRNG output range', () => {
  it('nextInt always returns a value within [min, max]', () => {
    fc.assert(
      fc.property(
        arbSeed,
        fc.integer({ min: -1000, max: 1000 }),
        fc.integer({ min: 1, max: 5000 }),
        (seed, min, span) => {
          const rng = createSeededRNG(seed);
          const max = min + span;
          for (let i = 0; i < 100; i += 1) {
            const v = rng.nextInt(min, max);
            expect(v).toBeGreaterThanOrEqual(min);
            expect(v).toBeLessThanOrEqual(max);
            expect(Number.isInteger(v)).toBe(true);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('SeededRNG determinism and errors', () => {
  it('produces an identical sequence for the same seed', () => {
    const a = createSeededRNG(12345);
    const b = createSeededRNG(12345);
    const seqA = Array.from({ length: 50 }, () => a.nextInt(0, 999));
    const seqB = Array.from({ length: 50 }, () => b.nextInt(0, 999));
    expect(seqA).toEqual(seqB);
  });

  it('produces different sequences for different seeds', () => {
    const a = createSeededRNG(1);
    const b = createSeededRNG(2);
    const seqA = Array.from({ length: 20 }, () => a.nextInt(0, 9999));
    const seqB = Array.from({ length: 20 }, () => b.nextInt(0, 9999));
    expect(seqA).not.toEqual(seqB);
  });

  it('throws on min >= max', () => {
    const rng = createSeededRNG(1);
    expect(() => rng.nextInt(5, 5)).toThrow(RangeError);
    expect(() => rng.nextInt(9, 2)).toThrow(RangeError);
  });

  it('throws on an invalid seed', () => {
    expect(() => createSeededRNG(-1)).toThrow(RangeError);
    expect(() => createSeededRNG(2 ** 32)).toThrow(RangeError);
    expect(() => createSeededRNG(1.5)).toThrow(RangeError);
  });
});
