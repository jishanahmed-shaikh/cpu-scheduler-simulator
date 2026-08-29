import { describe, expect, it } from 'vitest';
import { initProcess, type ProcessInput } from '../../../core/models/Process';
import { SJFScheduler } from '../../../core/schedulers/SJFScheduler';
import { summarize } from '../../helpers/summary';

const build = (rows: Omit<ProcessInput, 'remainingBurstTime'>[]) => rows.map(initProcess);
const sjf = new SJFScheduler();

describe('SJF known-answer workloads (Requirements 4.4, 22.1)', () => {
  it('classic 4-process workload reaches the published optimal average waiting time of 7', () => {
    const s = summarize(
      build([
        { pid: 1, arrivalTime: 0, burstTime: 6, priority: 0 },
        { pid: 2, arrivalTime: 0, burstTime: 8, priority: 0 },
        { pid: 3, arrivalTime: 0, burstTime: 7, priority: 0 },
        { pid: 4, arrivalTime: 0, burstTime: 3, priority: 0 },
      ]),
      sjf,
    );
    expect(s.gantt).toEqual([
      [4, 0, 3],
      [1, 3, 9],
      [3, 9, 16],
      [2, 16, 24],
    ]);
    expect(s.averageWaitingTime).toBeCloseTo(7, 2);
    expect(s.waiting).toEqual({ 1: 3, 2: 16, 3: 9, 4: 0 });
    expect(s.contextSwitches).toBe(4);
  });

  it('equal bursts fall back to arrival then PID order', () => {
    const s = summarize(
      build([
        { pid: 1, arrivalTime: 0, burstTime: 5, priority: 0 },
        { pid: 2, arrivalTime: 0, burstTime: 5, priority: 0 },
        { pid: 3, arrivalTime: 0, burstTime: 5, priority: 0 },
      ]),
      sjf,
    );
    expect(s.gantt).toEqual([
      [1, 0, 5],
      [2, 5, 10],
      [3, 10, 15],
    ]);
    expect(s.averageWaitingTime).toBeCloseTo(5, 2);
  });

  it('single process', () => {
    const s = summarize(build([{ pid: 1, arrivalTime: 0, burstTime: 4, priority: 0 }]), sjf);
    expect(s.turnaround).toEqual({ 1: 4 });
    expect(s.waiting).toEqual({ 1: 0 });
    expect(s.contextSwitches).toBe(1);
  });
});
