import { describe, expect, it } from 'vitest';
import { initProcess, type ProcessInput } from '../../../core/models/Process';
import { RRScheduler } from '../../../core/schedulers/RRScheduler';
import { FCFSScheduler } from '../../../core/schedulers/FCFSScheduler';
import { runWith } from '../../helpers/runAll';
import { summarize } from '../../helpers/summary';

const build = (rows: Omit<ProcessInput, 'remainingBurstTime'>[]) => rows.map(initProcess);

describe('Round Robin known-answer workloads (Requirements 6.5, 6.7, 22.1)', () => {
  it('quantum 2, three staggered processes', () => {
    const s = summarize(
      build([
        { pid: 1, arrivalTime: 0, burstTime: 5, priority: 0 },
        { pid: 2, arrivalTime: 1, burstTime: 3, priority: 0 },
        { pid: 3, arrivalTime: 2, burstTime: 1, priority: 0 },
      ]),
      new RRScheduler(2),
    );
    expect(s.gantt).toEqual([
      [1, 0, 2],
      [2, 2, 4],
      [3, 4, 5],
      [1, 5, 7],
      [2, 7, 8],
      [1, 8, 9],
    ]);
    expect(s.waiting).toEqual({ 1: 4, 2: 4, 3: 2 });
    expect(s.response).toEqual({ 1: 0, 2: 1, 3: 2 });
    expect(s.contextSwitches).toBe(6);
  });

  it('mid-quantum completion inserts no idle tick (Requirement 6.5)', () => {
    const result = runWith(
      build([
        { pid: 1, arrivalTime: 0, burstTime: 1, priority: 0 },
        { pid: 2, arrivalTime: 0, burstTime: 4, priority: 0 },
      ]),
      new RRScheduler(3),
    );
    const types = result.events.map((e) => e.type);
    const completeIdx = types.indexOf('COMPLETE');
    expect(types[completeIdx + 1]).toBe('START');
    expect(types).not.toContain('IDLE_START');
  });

  it('quantum >= max burst matches FCFS completion times (Requirement 6.7)', () => {
    const rows = build([
      { pid: 1, arrivalTime: 0, burstTime: 3, priority: 0 },
      { pid: 2, arrivalTime: 0, burstTime: 5, priority: 0 },
      { pid: 3, arrivalTime: 0, burstTime: 2, priority: 0 },
    ]);
    const rr = summarize(rows, new RRScheduler(5));
    const fcfs = summarize(rows, new FCFSScheduler());
    expect(rr.turnaround).toEqual(fcfs.turnaround);
    expect(rr.gantt).toEqual(fcfs.gantt);
  });
});
