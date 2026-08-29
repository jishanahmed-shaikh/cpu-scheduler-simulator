import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { generateWorkload } from '../../../core/scenarios/WorkloadGenerator';
import { arbSeed } from '../../helpers/generators';

// Feature: cpu-scheduler-game, Property 14 (workload half): seeded generation is deterministic
describe('seeded workload generation (Requirement 10.2)', () => {
  it('same options produce an identical workload every time', () => {
    fc.assert(
      fc.property(arbSeed, fc.integer({ min: 1, max: 10 }), (seed, count) => {
        const a = generateWorkload({ seed, count });
        const b = generateWorkload({ seed, count });
        expect(a).toEqual(b);
      }),
      { numRuns: 100 },
    );
  });

  it('honours count and field ranges', () => {
    const workload = generateWorkload({
      seed: 99,
      count: 8,
      arrivalRange: [0, 50],
      burstRange: [2, 9],
      priorityRange: [1, 4],
    });
    expect(workload).toHaveLength(8);
    for (const p of workload) {
      expect(p.arrivalTime).toBeGreaterThanOrEqual(0);
      expect(p.arrivalTime).toBeLessThanOrEqual(50);
      expect(p.burstTime).toBeGreaterThanOrEqual(2);
      expect(p.burstTime).toBeLessThanOrEqual(9);
      expect(p.priority).toBeGreaterThanOrEqual(1);
      expect(p.priority).toBeLessThanOrEqual(4);
    }
  });

  it('different seeds generally produce different workloads', () => {
    expect(generateWorkload({ seed: 1, count: 6 })).not.toEqual(
      generateWorkload({ seed: 2, count: 6 }),
    );
  });
});
