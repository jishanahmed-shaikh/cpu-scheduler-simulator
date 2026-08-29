import { initProcess, type Process } from '../models/Process';
import { createSeededRNG } from '../rng/SeededRNG';

export interface WorkloadOptions {
  seed: number;
  count: number;
  arrivalRange: [number, number];
  burstRange: [number, number];
  priorityRange: [number, number];
}

const DEFAULTS: Omit<WorkloadOptions, 'seed'> = {
  count: 5,
  arrivalRange: [0, 20],
  burstRange: [1, 12],
  priorityRange: [0, 9],
};

/**
 * Deterministic seeded workload generation (Requirement 10). The same options
 * always yield an identical Process array in count, order, and field values.
 */
export function generateWorkload(options: Partial<WorkloadOptions> & { seed: number }): Process[] {
  const opts: WorkloadOptions = { ...DEFAULTS, ...options };
  if (opts.count < 1) throw new RangeError('count must be >= 1');
  const rng = createSeededRNG(opts.seed);
  const [aMin, aMax] = opts.arrivalRange;
  const [bMin, bMax] = opts.burstRange;
  const [pMin, pMax] = opts.priorityRange;

  return Array.from({ length: opts.count }, (_v, index) =>
    initProcess({
      pid: index + 1,
      arrivalTime: aMin >= aMax ? aMin : rng.nextInt(aMin, aMax),
      burstTime: bMin >= bMax ? bMin : rng.nextInt(bMin, bMax),
      priority: pMin >= pMax ? pMin : rng.nextInt(pMin, pMax),
    }),
  );
}
