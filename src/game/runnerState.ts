import type { Process } from '../core/models/Process';
import type { SimulationEvent } from '../core/models/SimulationEvent';
import type { GanttSegment, SimulationMetrics } from '../core/models/GanttSegment';
import { computeMetrics } from '../core/engine/MetricsCalculator';

export type RunnerStatus = 'idle' | 'playing' | 'paused' | 'completed';

export interface RunnerState {
  status: RunnerStatus;
  currentEventIndex: number;
  currentTime: number;
  cpuProcess: Process | null;
  readyQueue: Process[];
  ganttSegments: GanttSegment[];
  partialMetrics: Partial<SimulationMetrics>;
  events: SimulationEvent[];
}

/**
 * Replays events[0..index] to reconstruct the visible simulation state.
 * Pure and deterministic — the UI never mutates this directly.
 */
export function deriveState(
  events: SimulationEvent[],
  index: number,
  processes: Process[],
  fullGantt: GanttSegment[],
): Omit<RunnerState, 'status'> {
  const byPid = new Map(processes.map((p) => [p.pid, p]));
  const ready: Process[] = [];
  let cpu: Process | null = null;
  let currentTime = 0;

  const slice = events.slice(0, Math.max(0, index));
  for (const event of slice) {
    currentTime = event.time;
    const proc = event.pid === null ? null : byPid.get(event.pid) ?? null;
    if (event.type === 'ARRIVE' && proc && proc.burstTime > 0) ready.push(proc);
    else if (event.type === 'START' && proc) {
      cpu = proc;
      const at = ready.indexOf(proc);
      if (at >= 0) ready.splice(at, 1);
    } else if (event.type === 'PREEMPT' && proc) {
      ready.push(proc);
      cpu = null;
    } else if (event.type === 'COMPLETE') {
      if (cpu && cpu.pid === event.pid) cpu = null;
      const at = ready.findIndex((p) => p.pid === event.pid);
      if (at >= 0) ready.splice(at, 1);
    } else if (event.type === 'IDLE_START') cpu = null;
  }

  const completedPids = new Set(
    slice.filter((e) => e.type === 'COMPLETE').map((e) => e.pid),
  );
  const done = processes.filter((p) => completedPids.has(p.pid));
  const partial = done.length > 0
    ? computeMetrics(done, slice, fullGantt.filter((s) => s.endTime <= currentTime)).metrics
    : {};

  return {
    currentEventIndex: index,
    currentTime,
    cpuProcess: cpu,
    readyQueue: [...ready],
    ganttSegments: fullGantt.filter((s) => s.startTime < currentTime),
    partialMetrics: partial,
    events,
  };
}
