/**
 * The core workload unit shared by every scheduler and the simulation engine.
 * Field ranges are enforced by {@link validateWorkload} before any scheduling.
 */
export interface Process {
  /** Unique integer identifier, range [1, 9999]. */
  pid: number;
  /** Integer arrival time, range [0, 99999]. */
  arrivalTime: number;
  /** Positive integer burst time, range [1, 9999]. */
  burstTime: number;
  /** Integer priority, range [0, 99]; 0 = highest urgency, 99 = lowest. */
  priority: number;
  /** Remaining CPU time; initialised to burstTime at simulation start. */
  remainingBurstTime: number;
}

/** Lifecycle state of a {@link Process} during a simulation run. */
export enum ProcessState {
  NOT_ARRIVED = 'NOT_ARRIVED',
  READY = 'READY',
  RUNNING = 'RUNNING',
  COMPLETE = 'COMPLETE',
}

export const PROCESS_FIELD_RANGES = {
  pid: { min: 1, max: 9999 },
  arrivalTime: { min: 0, max: 99999 },
  burstTime: { min: 1, max: 9999 },
  priority: { min: 0, max: 99 },
} as const;

export type ProcessFieldName = keyof typeof PROCESS_FIELD_RANGES;

/** A process definition as supplied by a user, before remainingBurstTime is derived. */
export type ProcessInput = Omit<Process, 'remainingBurstTime'> &
  Partial<Pick<Process, 'remainingBurstTime'>>;

/** Returns a fresh runnable Process with remainingBurstTime reset to burstTime. */
export function initProcess(input: ProcessInput): Process {
  return {
    pid: input.pid,
    arrivalTime: input.arrivalTime,
    burstTime: input.burstTime,
    priority: input.priority,
    remainingBurstTime: input.burstTime,
  };
}

/** Deep-clones a list of processes so the engine never mutates caller state. */
export function cloneProcesses(processes: readonly ProcessInput[]): Process[] {
  return processes.map(initProcess);
}
