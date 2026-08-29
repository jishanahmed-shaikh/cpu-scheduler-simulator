import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { EVENT_TYPE_ORDER } from '../../../core/models/SimulationEvent';
import { arbWorkload } from '../../helpers/generators';
import { allSchedulers, runWith } from '../../helpers/runAll';

// Feature: cpu-scheduler-game, Property 14: Simulation Determinism
describe('Property 14: determinism', () => {
  it('two runs with identical inputs produce deeply equal output', () => {
    fc.assert(
      fc.property(arbWorkload(8), (processes) => {
        for (const scheduler of allSchedulers()) {
          const a = runWith(processes, scheduler);
          const b = runWith(processes, scheduler);
          expect(a.events).toEqual(b.events);
          expect(a.ganttChart).toEqual(b.ganttChart);
          expect(a.metrics).toEqual(b.metrics);
        }
      }),
      { numRuns: 100 },
    );
  });
});

// Feature: cpu-scheduler-game, Property 15: Event Timestamps Are Monotonically Non-Decreasing
describe('Property 15: monotonic event time', () => {
  it('each event time is >= the previous event time', () => {
    fc.assert(
      fc.property(arbWorkload(8), (processes) => {
        for (const scheduler of allSchedulers()) {
          const { events } = runWith(processes, scheduler);
          for (let i = 1; i < events.length; i += 1) {
            expect(events[i]!.time).toBeGreaterThanOrEqual(events[i - 1]!.time);
          }
        }
      }),
      { numRuns: 100 },
    );
  });
});

// Feature: cpu-scheduler-game, Property 16: Same-Time Events Follow Fixed Priority Order
describe('Property 16: same-time event ordering', () => {
  it('consecutive equal-time events are ordered by event-type priority', () => {
    fc.assert(
      fc.property(arbWorkload(8), (processes) => {
        for (const scheduler of allSchedulers()) {
          const { events } = runWith(processes, scheduler);
          for (let i = 1; i < events.length; i += 1) {
            const prev = events[i - 1]!;
            const cur = events[i]!;
            if (prev.time !== cur.time) continue;
            expect(EVENT_TYPE_ORDER[prev.type]).toBeLessThanOrEqual(EVENT_TYPE_ORDER[cur.type]);
          }
        }
      }),
      { numRuns: 100 },
    );
  });
});
