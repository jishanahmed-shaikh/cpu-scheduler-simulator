/** Pure scoring formulas for Challenge and Optimize modes. */

const CHALLENGE_BASE = 100;
const TIME_BONUS_MAX = 50;
const TIME_BONUS_DECAY = 5;
const STREAK_CAP = 2.0;

export interface ChallengeScoreInput {
  elapsedSeconds: number;
  streak: number;
}

/**
 * Challenge Mode points for a correct answer (Requirements 13.3, 13.4).
 * base 100 + max(0, 50 - elapsed*5), times a streak multiplier once
 * streak >= 2, capped at 2.0, then rounded.
 */
export function challengeScore({ elapsedSeconds, streak }: ChallengeScoreInput): number {
  const timeBonus = Math.max(0, TIME_BONUS_MAX - elapsedSeconds * TIME_BONUS_DECAY);
  const raw = CHALLENGE_BASE + timeBonus;
  const multiplier = streak >= 2 ? Math.min(STREAK_CAP, 1 + 0.1 * streak) : 1;
  return Math.round(raw * multiplier);
}

export interface OptimizeScoreResult {
  score: number;
  isPerfect: boolean;
}

/**
 * Optimize Mode score (Requirements 14.3, 14.6).
 * max(0, 1000 - round((result - optimal) / optimal * 1000)); when optimal is
 * 0, a perfect 1000 iff result is also 0, else 0.
 */
export function optimizeScore(resultMetric: number, optimalMetric: number): OptimizeScoreResult {
  if (optimalMetric === 0) {
    const perfect = resultMetric === 0;
    return { score: perfect ? 1000 : 0, isPerfect: perfect };
  }
  const penalty = Math.round(((resultMetric - optimalMetric) / optimalMetric) * 1000);
  const score = Math.max(0, 1000 - penalty);
  return { score, isPerfect: score === 1000 };
}
