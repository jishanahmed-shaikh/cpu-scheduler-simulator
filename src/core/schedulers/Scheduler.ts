import type { Process } from '../models/Process';

/**
 * Interchangeable scheduling strategy consumed by the SimulationEngine.
 * Implementations must be pure: no React, DOM, timers, or randomness.
 */
export interface Scheduler {
  /** Stable human-readable name, used for explanations and leaderboard keys. */
  readonly name: string;

  /** Whether this strategy can interrupt a running process. */
  readonly preemptive: boolean;

  /** Next process to run, or null when the ready queue is empty. */
  selectNext(readyQueue: Process[], currentTime: number): Process | null;

  /** True when `running` should leave the CPU before the next selectNext. */
  shouldPreempt(
    running: Process,
    readyQueue: Process[],
    currentTime: number,
  ): boolean;

  /**
   * Optional explanation for why `selected` was chosen at `currentTime`.
   * Consumed by the Decision Inspector; derived only from process fields.
   */
  explainSelection?(selected: Process, readyQueue: Process[], currentTime: number): string;

  /** Called by the engine when `process` is dispatched onto the CPU. */
  onDispatch?(process: Process, currentTime: number): void;

  /** Called by the engine when `process` leaves the CPU (preempt or complete). */
  onRelease?(process: Process, currentTime: number): void;

  /** Resets any internal per-run state so the scheduler is reusable. */
  reset?(): void;
}

/** Shared ascending comparator: earliest arrival, then lowest PID. */
export function byArrivalThenPid(a: Process, b: Process): number {
  return a.arrivalTime - b.arrivalTime || a.pid - b.pid;
}

/** Returns the single process minimising `key`, tie-broken by arrival then PID. */
export function pickMin(
  queue: Process[],
  key: (p: Process) => number,
): Process | null {
  if (queue.length === 0) return null;
  let best = queue[0]!;
  let bestKey = key(best);
  for (let i = 1; i < queue.length; i += 1) {
    const candidate = queue[i]!;
    const candidateKey = key(candidate);
    if (
      candidateKey < bestKey ||
      (candidateKey === bestKey && byArrivalThenPid(candidate, best) < 0)
    ) {
      best = candidate;
      bestKey = candidateKey;
    }
  }
  return best;
}
