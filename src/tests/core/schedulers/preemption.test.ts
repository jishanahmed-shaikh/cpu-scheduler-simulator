import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { SRTFScheduler } from '../../../core/schedulers/SRTFScheduler';
import { RRScheduler } from '../../../core/schedulers/RRScheduler';
import { PriorityScheduler } from '../../../core/schedulers/PriorityScheduler';
import { initProcess, type Process } from '../../../core/models/Process';

const P = (pid: number, over: Partial<Process> = {}): Process =>
  initProcess({ pid, arrivalTime: 0, burstTime: 10, priority: 5, ...over });

// Feature: cpu-scheduler-game, Property 6: SRTF Preempts on Strictly Shorter Remaining Time
describe('Property 6: SRTF preemption', () => {
  it('preempts iff a ready process has strictly smaller remaining time', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        (runningRemaining, readyRemaining) => {
          const running = P(1, { burstTime: runningRemaining });
          const ready = P(2, { burstTime: readyRemaining });
          const expected = readyRemaining < runningRemaining;
          expect(new SRTFScheduler().shouldPreempt(running, [ready], 3)).toBe(expected);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// Feature: cpu-scheduler-game, Property 8: Round Robin Preempts After Quantum Exhaustion
describe('Property 8: RR quantum exhaustion', () => {
  it('preempts exactly when consumed ticks reach the quantum', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        fc.integer({ min: 0, max: 40 }),
        (quantum, elapsed) => {
          const rr = new RRScheduler(quantum);
          const running = P(1, { burstTime: 100 });
          rr.onDispatch(running, 0);
          expect(rr.shouldPreempt(running, [], elapsed)).toBe(elapsed >= quantum);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('rejects an out-of-range quantum', () => {
    expect(() => new RRScheduler(0)).toThrow(RangeError);
    expect(() => new RRScheduler(1001)).toThrow(RangeError);
    expect(() => new RRScheduler(2.5)).toThrow(RangeError);
  });
});

// Feature: cpu-scheduler-game, Property 12: Preemptive Priority Preempts on Higher-Priority Arrival
describe('Property 12: preemptive Priority', () => {
  it('preempts iff a ready process has a strictly lower priority number', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 99 }),
        fc.integer({ min: 0, max: 99 }),
        (runningPriority, readyPriority) => {
          const running = P(1, { priority: runningPriority });
          const ready = P(2, { priority: readyPriority });
          expect(new PriorityScheduler(true).shouldPreempt(running, [ready], 1)).toBe(
            readyPriority < runningPriority,
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});
