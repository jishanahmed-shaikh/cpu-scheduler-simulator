import type { Process } from '../models/Process';
import type { SimulationEvent } from '../models/SimulationEvent';
import type {
  GanttSegment,
  MetricWarning,
  ProcessMetrics,
  SimulationMetrics,
} from '../models/GanttSegment';

export interface MetricsOutput {
  metrics: SimulationMetrics;
  metricWarnings: MetricWarning[];
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function countContextSwitches(events: SimulationEvent[]): number {
  let last: number | null = null;
  let count = 0;
  for (const event of events) {
    if (event.type !== 'START' || event.pid === null) continue;
    if (event.pid !== last) count += 1;
    last = event.pid;
  }
  return count;
}

function perProcessMetrics(
  processes: Process[],
  events: SimulationEvent[],
): { rows: ProcessMetrics[]; warnings: MetricWarning[] } {
  const firstStart = new Map<number, number>();
  const completion = new Map<number, number>();
  for (const event of events) {
    if (event.pid === null) continue;
    if (event.type === 'START' && !firstStart.has(event.pid)) {
      firstStart.set(event.pid, event.time);
    }
    if (event.type === 'COMPLETE') completion.set(event.pid, event.time);
  }

  const rows: ProcessMetrics[] = [];
  const warnings: MetricWarning[] = [];
  for (const p of processes) {
    const done = completion.get(p.pid) ?? p.arrivalTime;
    const turnaroundTime = done - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;
    const started = firstStart.get(p.pid);
    const responseTime = started === undefined ? turnaroundTime : started - p.arrivalTime;
    rows.push({ pid: p.pid, waitingTime, turnaroundTime, responseTime });
    if (turnaroundTime < p.burstTime) warnings.push({ pid: p.pid, reason: 'TURNAROUND_BELOW_BURST' });
    if (waitingTime < 0) warnings.push({ pid: p.pid, reason: 'NEGATIVE_WAITING_TIME' });
  }
  return { rows, warnings };
}

/** Derives every metric exclusively from the process list and event log. */
export function computeMetrics(
  processes: Process[],
  events: SimulationEvent[],
  ganttChart: GanttSegment[],
): MetricsOutput {
  const { rows, warnings } = perProcessMetrics(processes, events);
  const flagged = new Set(warnings.map((w) => w.pid));

  const firstArrival = Math.min(...processes.map((p) => p.arrivalTime));
  const completions = events.filter((e) => e.type === 'COMPLETE').map((e) => e.time);
  const lastCompletion = completions.length > 0 ? Math.max(...completions) : firstArrival;
  const makespan = lastCompletion - firstArrival;
  const busyTime = ganttChart.reduce((sum, s) => sum + (s.endTime - s.startTime), 0);

  let throughput: number | undefined;
  let cpuUtilization: number | undefined;
  if (makespan > 0) {
    throughput = processes.length / makespan;
    cpuUtilization = busyTime / makespan;
    if (cpuUtilization < 0 || cpuUtilization > 1) {
      warnings.push({ pid: 0, reason: 'UTILIZATION_OUT_OF_RANGE' });
    }
  }

  const usable = rows.filter((r) => !flagged.has(r.pid));
  const metrics: SimulationMetrics = {
    perProcess: rows,
    averageWaitingTime: average(usable.map((r) => r.waitingTime)),
    averageTurnaroundTime: average(usable.map((r) => r.turnaroundTime)),
    averageResponseTime: average(usable.map((r) => r.responseTime)),
    throughput,
    cpuUtilization,
    contextSwitches: countContextSwitches(events),
    makespan,
  };
  return { metrics, metricWarnings: warnings };
}
