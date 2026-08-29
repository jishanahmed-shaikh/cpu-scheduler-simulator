import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { arbWorkload } from '../../helpers/generators';
import { allSchedulers, runWith } from '../../helpers/runAll';

// Feature: cpu-scheduler-game, Property 19: Metrics Formulas Hold for All Processes
describe('Property 19: per-process metric formulas', () => {
  it('waitingTime = turnaround - burst, turnaround >= burst, response >= 0', () => {
    fc.assert(
      fc.property(arbWorkload(8), (processes) => {
        for (const scheduler of allSchedulers()) {
          const { metrics } = runWith(processes, scheduler);
          for (const row of metrics!.perProcess) {
            const p = processes.find((x) => x.pid === row.pid)!;
            expect(row.waitingTime).toBe(row.turnaroundTime - p.burstTime);
            expect(row.turnaroundTime).toBeGreaterThanOrEqual(p.burstTime);
            expect(row.responseTime).toBeGreaterThanOrEqual(0);
            expect(row.responseTime).toBeLessThanOrEqual(row.turnaroundTime);
          }
        }
      }),
      { numRuns: 100 },
    );
  });
});

// Feature: cpu-scheduler-game, Property 20: Aggregate Metrics Formulas Are Correct
describe('Property 20: aggregate metric formulas', () => {
  it('throughput, utilization, makespan, and context switches match definitions', () => {
    fc.assert(
      fc.property(arbWorkload(8), (processes) => {
        for (const scheduler of allSchedulers()) {
          const { events, metrics } = runWith(processes, scheduler);
          const m = metrics!;
          if (m.makespan > 0) {
            expect(m.throughput).toBeCloseTo(processes.length / m.makespan, 10);
            expect(m.cpuUtilization!).toBeGreaterThanOrEqual(0);
            expect(m.cpuUtilization!).toBeLessThanOrEqual(1 + 1e-9);
          }
          let last: number | null = null;
          let switches = 0;
          for (const e of events) {
            if (e.type !== 'START' || e.pid === null) continue;
            if (e.pid !== last) switches += 1;
            last = e.pid;
          }
          expect(m.contextSwitches).toBe(switches);
          expect(m.contextSwitches).toBeGreaterThanOrEqual(0);
          expect(m.contextSwitches).toBeLessThanOrEqual(events.length);
        }
      }),
      { numRuns: 100 },
    );
  });
});
