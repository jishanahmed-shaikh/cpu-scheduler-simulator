import { describe, expect, it } from 'vitest';
import { initProcess, type ProcessInput } from '../../../core/models/Process';
import { FCFSScheduler } from '../../../core/schedulers/FCFSScheduler';
import { summarize } from '../../helpers/summary';

const build = (rows: Omit<ProcessInput, 'remainingBurstTime'>[]) => rows.map(initProcess);
const fcfs = new FCFSScheduler();

describe('FCFS known-answer workloads (Requirement 22.1)', () => {
  it('classic 3-process workload', () => {
    const s = summarize(
      build([
        { pid: 1, arrivalTime: 0, burstTime: 24, priority: 0 },
        { pid: 2, arrivalTime: 0, burstTime: 3, priority: 0 },
        { pid: 3, arrivalTime: 0, burstTime: 3, priority: 0 },
      ]),
      fcfs,
    );
    expect(s.gantt).toEqual([
      [1, 0, 24],
      [2, 24, 27],
      [3, 27, 30],
    ]);
    expect(s.waiting).toEqual({ 1: 0, 2: 24, 3: 27 });
    expect(s.turnaround).toEqual({ 1: 24, 2: 27, 3: 30 });
    expect(s.contextSwitches).toBe(3);
    expect(s.cpuUtilization).toBe(1);
    expect(s.makespan).toBe(30);
  });

  it('single process has one segment and no preemption gaps', () => {
    const s = summarize(build([{ pid: 1, arrivalTime: 0, burstTime: 7, priority: 0 }]), fcfs);
    expect(s.gantt).toEqual([[1, 0, 7]]);
    expect(s.contextSwitches).toBe(1);
    expect(s.turnaround).toEqual({ 1: 7 });
    expect(s.waiting).toEqual({ 1: 0 });
  });

  it('staggered arrivals with an initial idle gap', () => {
    const s = summarize(
      build([
        { pid: 1, arrivalTime: 2, burstTime: 4, priority: 0 },
        { pid: 2, arrivalTime: 3, burstTime: 3, priority: 0 },
      ]),
      fcfs,
    );
    expect(s.gantt).toEqual([
      [1, 2, 6],
      [2, 6, 9],
    ]);
    expect(s.waiting).toEqual({ 1: 0, 2: 3 });
    expect(s.makespan).toBe(7);
    expect(s.cpuUtilization).toBe(1);
  });
});
