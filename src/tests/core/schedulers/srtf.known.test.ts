import { describe, expect, it } from 'vitest';
import { initProcess, type ProcessInput } from '../../../core/models/Process';
import { SRTFScheduler } from '../../../core/schedulers/SRTFScheduler';
import { SJFScheduler } from '../../../core/schedulers/SJFScheduler';
import { summarize } from '../../helpers/summary';

const build = (rows: Omit<ProcessInput, 'remainingBurstTime'>[]) => rows.map(initProcess);
const srtf = new SRTFScheduler();

const REQ_5_5 = [
  { pid: 1, arrivalTime: 0, burstTime: 8, priority: 0 },
  { pid: 2, arrivalTime: 1, burstTime: 4, priority: 0 },
  { pid: 3, arrivalTime: 2, burstTime: 9, priority: 0 },
  { pid: 4, arrivalTime: 3, burstTime: 5, priority: 0 },
];

describe('SRTF known-answer workloads (Requirements 5.5, 22.1)', () => {
  it('Requirement 5.5 workload gives average waiting time 6.5, no worse than SJF', () => {
    const s = summarize(build(REQ_5_5), srtf);
    expect(s.gantt).toEqual([
      [1, 0, 1],
      [2, 1, 5],
      [4, 5, 10],
      [1, 10, 17],
      [3, 17, 26],
    ]);
    expect(s.averageWaitingTime).toBeCloseTo(6.5, 2);
    const sjfAvg = summarize(build(REQ_5_5), new SJFScheduler()).averageWaitingTime;
    expect(s.averageWaitingTime).toBeLessThanOrEqual(sjfAvg + 1e-9);
  });

  it('two-process preemption', () => {
    const s = summarize(
      build([
        { pid: 1, arrivalTime: 0, burstTime: 5, priority: 0 },
        { pid: 2, arrivalTime: 2, burstTime: 2, priority: 0 },
      ]),
      srtf,
    );
    expect(s.gantt).toEqual([
      [1, 0, 2],
      [2, 2, 4],
      [1, 4, 7],
    ]);
    expect(s.waiting).toEqual({ 1: 2, 2: 0 });
    expect(s.contextSwitches).toBe(3);
  });

  it('no preemption when every arrival follows the previous completion', () => {
    const s = summarize(
      build([
        { pid: 1, arrivalTime: 0, burstTime: 3, priority: 0 },
        { pid: 2, arrivalTime: 5, burstTime: 2, priority: 0 },
        { pid: 3, arrivalTime: 10, burstTime: 4, priority: 0 },
      ]),
      srtf,
    );
    expect(s.gantt).toEqual([
      [1, 0, 3],
      [2, 5, 7],
      [3, 10, 14],
    ]);
    expect(s.waiting).toEqual({ 1: 0, 2: 0, 3: 0 });
    expect(s.cpuUtilization).toBeCloseTo(9 / 14, 10);
  });
});
