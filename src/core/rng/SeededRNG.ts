const MAX_SEED = 0xffffffff;

export interface SeededRNG {
  /** Next float in [0, 1). */
  next(): number;
  /** Integer in the inclusive range [min, max]. Throws if min >= max. */
  nextInt(min: number, max: number): number;
}

/**
 * Mulberry32: a compact, fully deterministic 32-bit PRNG.
 * Uses no non-deterministic source; see Requirement 10.5.
 */
export function createSeededRNG(seed: number): SeededRNG {
  if (!Number.isInteger(seed) || seed < 0 || seed > MAX_SEED) {
    throw new RangeError(`seed must be an integer in [0, ${MAX_SEED}], got ${seed}`);
  }
  let state = seed >>> 0;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const nextInt = (min: number, max: number): number => {
    if (min >= max) {
      throw new RangeError(`invalid range: min (${min}) must be < max (${max})`);
    }
    const span = max - min + 1;
    return min + Math.floor(next() * span);
  };

  return { next, nextInt };
}
