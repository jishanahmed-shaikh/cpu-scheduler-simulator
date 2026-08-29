import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { arbWorkload } from '../../helpers/generators';
import { allSchedulers, runWith } from '../../helpers/runAll';

// Feature: cpu-scheduler-game, Property 17: Gantt Chart Segments Are Derived from Events
describe('Property 17: Gantt segments derive from events', () => {
  it('every segment has a START at startTime and a COMPLETE/PREEMPT at endTime', () => {
    fc.assert(
      fc.property(arbWorkload(8), (processes) => {
        for (const scheduler of allSchedulers()) {
          const { events, ganttChart } = runWith(processes, scheduler);
          for (const seg of ganttChart) {
            const hasStart = events.some(
              (e) => e.type === 'START' && e.pid === seg.pid && e.time === seg.startTime,
            );
            const hasEnd = events.some(
              (e) =>
                (e.type === 'COMPLETE' || e.type === 'PREEMPT') &&
                e.pid === seg.pid &&
                e.time === seg.endTime,
            );
            expect(hasStart).toBe(true);
            expect(hasEnd).toBe(true);
            expect(seg.endTime).toBeGreaterThan(seg.startTime);
          }
        }
      }),
      { numRuns: 100 },
    );
  });
});

// Feature: cpu-scheduler-game, Property 18: Gantt Chart Covers All Burst Time
describe('Property 18: Gantt covers all burst time', () => {
  it('per-process segment durations sum to burstTime', () => {
    fc.assert(
      fc.property(arbWorkload(8), (processes) => {
        for (const scheduler of allSchedulers()) {
          const { ganttChart } = runWith(processes, scheduler);
          for (const p of processes) {
            const covered = ganttChart
              .filter((s) => s.pid === p.pid)
              .reduce((sum, s) => sum + (s.endTime - s.startTime), 0);
            expect(covered).toBe(p.burstTime);
          }
        }
      }),
      { numRuns: 100 },
    );
  });
});
