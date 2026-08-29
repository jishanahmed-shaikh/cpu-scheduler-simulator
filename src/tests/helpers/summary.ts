import type { Process } from '../../core/models/Process';
import type { Scheduler } from '../../core/schedulers/Scheduler';
import { runWith } from './runAll';

export interface RunSummary {
  gantt: Array<[number, number, number]>; // [pid, start, end]
  waiting: Record<number, number>;
  turnaround: Record<number, number>;
  response: Record<number, number>;
  contextSwitches: number;
  makespan: number;
  cpuUtilization: number | undefined;
  averageWaitingTime: number;
}

/** Compact, assertion-friendly view of a simulation run. */
export function summarize(processes: Process[], scheduler: Scheduler): RunSummary {
  const result = runWith(processes, scheduler);
  const m = result.metrics!;
  const waiting: Record<number, number> = {};
  const turnaround: Record<number, number> = {};
  const response: Record<number, number> = {};
  for (const row of m.perProcess) {
    waiting[row.pid] = row.waitingTime;
    turnaround[row.pid] = row.turnaroundTime;
    response[row.pid] = row.responseTime;
  }
  return {
    gantt: result.ganttChart.map((s) => [s.pid, s.startTime, s.endTime]),
    waiting,
    turnaround,
    response,
    contextSwitches: m.contextSwitches,
    makespan: m.makespan,
    cpuUtilization: m.cpuUtilization,
    averageWaitingTime: m.averageWaitingTime,
  };
}
