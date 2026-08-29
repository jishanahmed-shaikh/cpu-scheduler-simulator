import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { runSimulation } from '../../../core/engine/SimulationEngine';
import { FCFSScheduler } from '../../../core/schedulers/FCFSScheduler';
import type { ProcessInput } from '../../../core/models/Process';

const scheduler = new FCFSScheduler();
const base: ProcessInput = { pid: 1, arrivalTime: 0, burstTime: 5, priority: 0 };

function codes(processes: ProcessInput[]): string[] {
  return runSimulation({ processes, scheduler }).errors.map((e) => e.code);
}

// Feature: cpu-scheduler-game, Property 2: Workload Rejection on Duplicate PIDs
describe('Property 2: duplicate PID rejection', () => {
  it('rejects any workload with a duplicated PID and emits no events', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 9999 }),
        fc.integer({ min: 0, max: 500 }),
        (pid, arrivalTime) => {
          const result = runSimulation({
            processes: [
              { pid, arrivalTime, burstTime: 3, priority: 1 },
              { pid, arrivalTime: arrivalTime + 1, burstTime: 4, priority: 2 },
            ],
            scheduler,
          });
          expect(result.errors.some((e) => e.code === 'DUPLICATE_PID')).toBe(true);
          expect(result.events).toHaveLength(0);
          expect(result.metrics).toBeNull();
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('engine validation paths', () => {
  it('flags an empty workload', () => {
    expect(codes([])).toContain('EMPTY_WORKLOAD');
  });

  it('flags a negative burst time', () => {
    expect(codes([{ ...base, burstTime: -3 }])).toContain('INVALID_BURST_TIME');
  });

  it('flags a field out of range', () => {
    expect(codes([{ ...base, priority: 500 }])).toContain('FIELD_OUT_OF_RANGE');
    expect(codes([{ ...base, pid: 0 }])).toContain('FIELD_OUT_OF_RANGE');
  });

  it('flags a wrong field type', () => {
    expect(codes([{ ...base, arrivalTime: 'x' as unknown as number }])).toContain(
      'INVALID_FIELD_TYPE',
    );
  });

  it('accepts a zero-burst process without rejecting the workload', () => {
    const result = runSimulation({
      processes: [base, { pid: 2, arrivalTime: 2, burstTime: 0, priority: 0 }],
      scheduler,
    });
    expect(result.errors).toHaveLength(0);
    expect(result.ganttChart.some((s) => s.pid === 2)).toBe(false);
    expect(result.metrics!.perProcess.find((r) => r.pid === 2)).toMatchObject({
      waitingTime: 0,
      turnaroundTime: 0,
    });
  });
});
