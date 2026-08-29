import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { PROCESS_FIELD_RANGES } from '../../../core/models/Process';
import { arbWorkload } from '../../helpers/generators';

// Feature: cpu-scheduler-game, Property 1: Process Record Invariants
describe('Property 1: Process record invariants', () => {
  it('every generated process stays within declared field ranges', () => {
    fc.assert(
      fc.property(arbWorkload(10), (processes) => {
        for (const p of processes) {
          expect(p.pid).toBeGreaterThanOrEqual(PROCESS_FIELD_RANGES.pid.min);
          expect(p.pid).toBeLessThanOrEqual(PROCESS_FIELD_RANGES.pid.max);
          expect(p.arrivalTime).toBeGreaterThanOrEqual(0);
          expect(p.burstTime).toBeGreaterThanOrEqual(1);
          expect(p.priority).toBeGreaterThanOrEqual(0);
          expect(p.remainingBurstTime).toBe(p.burstTime);
        }
      }),
      { numRuns: 100 },
    );
  });
});
