import { describe, expect, it } from 'vitest';
import { initProcess, type ProcessInput } from '../../../core/models/Process';
import { PriorityScheduler } from '../../../core/schedulers/PriorityScheduler';
import { summarize } from '../../helpers/summary';

const build = (rows: Omit<ProcessInput, 'remainingBurstTime'>[]) => rows.map(initProcess);

describe('Priority known-answer workloads (Requirement 22.1)', () => {
  it('non-preemptive classic 4-process workload', () => {
    const s = summarize(
      build([
        { pid: 1, arrivalTime: 0, burstTime: 4, priority: 3 },
        { pid: 2, arrivalTime: 1, burstTime: 3, priority: 1 },
        { pid: 3, arrivalTime: 2, burstTime: 1, priority: 4 },
        { pid: 4, arrivalTime: 3, burstTime: 2, priority: 2 },
      ]),
      new PriorityScheduler(false),
    );
    expect(s.gantt).toEqual([
      [1, 0, 4],
      [2, 4, 7],
      [4, 7, 9],
      [3, 9, 10],
    ]);
    expect(s.waiting).toEqual({ 1: 0, 2: 3, 3: 7, 4: 4 });
    expect(s.contextSwitches).toBe(4);
  });

  it('preemptive priority interrupts on a higher-priority arrival', () => {
    const s = summarize(
      build([
        { pid: 1, arrivalTime: 0, burstTime: 5, priority: 3 },
        { pid: 2, arrivalTime: 2, burstTime: 2, priority: 1 },
      ]),
      new PriorityScheduler(true),
    );
    expect(s.gantt).toEqual([
      [1, 0, 2],
      [2, 2, 4],
      [1, 4, 7],
    ]);
    expect(s.waiting).toEqual({ 1: 2, 2: 0 });
    expect(s.response).toEqual({ 1: 0, 2: 0 });
    expect(s.contextSwitches).toBe(3);
  });

  it('equal priorities fall back to arrival then PID order', () => {
    const s = summarize(
      build([
        { pid: 1, arrivalTime: 0, burstTime: 3, priority: 2 },
        { pid: 2, arrivalTime: 0, burstTime: 3, priority: 2 },
        { pid: 3, arrivalTime: 0, burstTime: 3, priority: 2 },
      ]),
      new PriorityScheduler(false),
    );
    expect(s.gantt).toEqual([
      [1, 0, 3],
      [2, 3, 6],
      [3, 6, 9],
    ]);
    expect(s.waiting).toEqual({ 1: 0, 2: 3, 3: 6 });
  });
});
