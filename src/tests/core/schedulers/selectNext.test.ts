import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { FCFSScheduler } from '../../../core/schedulers/FCFSScheduler';
import { SJFScheduler } from '../../../core/schedulers/SJFScheduler';
import { SRTFScheduler } from '../../../core/schedulers/SRTFScheduler';
import { PriorityScheduler } from '../../../core/schedulers/PriorityScheduler';
import { byArrivalThenPid } from '../../../core/schedulers/Scheduler';
import type { Process } from '../../../core/models/Process';
import { arbReadyQueue } from '../../helpers/generators';

function expectMinBy(queue: Process[], selected: Process | null, key: (p: Process) => number): void {
  const sorted = [...queue].sort((a, b) => key(a) - key(b) || byArrivalThenPid(a, b));
  expect(selected?.pid).toBe(sorted[0]!.pid);
}

// Feature: cpu-scheduler-game, Property 3: FCFS Always Selects Earliest-Arrived Process
describe('Property 3: FCFS selectNext', () => {
  it('returns the earliest arrival, tie-broken by PID', () => {
    fc.assert(
      fc.property(arbReadyQueue(), (q) => {
        expectMinBy(q, new FCFSScheduler().selectNext(q, 0), (p) => p.arrivalTime);
      }),
      { numRuns: 100 },
    );
  });
});

// Feature: cpu-scheduler-game, Property 5: SJF Always Selects Shortest Burst
describe('Property 5: SJF selectNext', () => {
  it('returns the smallest burst time, tie-broken by arrival then PID', () => {
    fc.assert(
      fc.property(arbReadyQueue(), (q) => {
        expectMinBy(q, new SJFScheduler().selectNext(q, 0), (p) => p.burstTime);
      }),
      { numRuns: 100 },
    );
  });
});

// Feature: cpu-scheduler-game, Property 7: SRTF Always Selects Smallest Remaining Burst
describe('Property 7: SRTF selectNext', () => {
  it('returns the smallest remaining burst time', () => {
    fc.assert(
      fc.property(arbReadyQueue(), (q) => {
        expectMinBy(q, new SRTFScheduler().selectNext(q, 0), (p) => p.remainingBurstTime);
      }),
      { numRuns: 100 },
    );
  });
});

// Feature: cpu-scheduler-game, Property 11: Priority Scheduler Always Selects Lowest Priority Number
describe('Property 11: Priority selectNext', () => {
  it('returns the lowest priority number', () => {
    fc.assert(
      fc.property(arbReadyQueue(), fc.boolean(), (q, preemptive) => {
        expectMinBy(q, new PriorityScheduler(preemptive).selectNext(q, 0), (p) => p.priority);
      }),
      { numRuns: 100 },
    );
  });
});

// Feature: cpu-scheduler-game, Property 4: Non-Preemptive Schedulers Never Preempt
// Feature: cpu-scheduler-game, Property 13: Non-Preemptive Priority Never Preempts
describe('Properties 4 & 13: non-preemptive schedulers never preempt', () => {
  it('FCFS, SJF, and non-preemptive Priority always return false', () => {
    fc.assert(
      fc.property(arbReadyQueue(), (q) => {
        const running = q[0]!;
        const rest = q.slice(1);
        expect(new FCFSScheduler().shouldPreempt(running, rest, 5)).toBe(false);
        expect(new SJFScheduler().shouldPreempt(running, rest, 5)).toBe(false);
        expect(new PriorityScheduler(false).shouldPreempt(running, rest, 5)).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});
