import type { Scheduler } from '../../core/schedulers/Scheduler';
import { FCFSScheduler } from '../../core/schedulers/FCFSScheduler';
import { SJFScheduler } from '../../core/schedulers/SJFScheduler';
import { SRTFScheduler } from '../../core/schedulers/SRTFScheduler';
import { RRScheduler } from '../../core/schedulers/RRScheduler';
import { PriorityScheduler } from '../../core/schedulers/PriorityScheduler';

export type AlgorithmId = 'FCFS' | 'SJF' | 'SRTF' | 'RR' | 'PRIORITY';

export interface SchedulerChoice {
  algorithm: AlgorithmId;
  quantum: number;
  preemptive: boolean;
}

export const DEFAULT_CHOICE: SchedulerChoice = {
  algorithm: 'FCFS',
  quantum: 2,
  preemptive: false,
};

export const ALGORITHM_LABELS: Record<AlgorithmId, string> = {
  FCFS: 'First Come First Served',
  SJF: 'Shortest Job First',
  SRTF: 'Shortest Remaining Time First',
  RR: 'Round Robin',
  PRIORITY: 'Priority',
};

/** Builds a fresh Scheduler instance from the current UI selection. */
export function createScheduler(choice: SchedulerChoice): Scheduler {
  switch (choice.algorithm) {
    case 'SJF':
      return new SJFScheduler();
    case 'SRTF':
      return new SRTFScheduler();
    case 'RR':
      return new RRScheduler(Math.min(1000, Math.max(1, Math.round(choice.quantum) || 1)));
    case 'PRIORITY':
      return new PriorityScheduler(choice.preemptive);
    case 'FCFS':
    default:
      return new FCFSScheduler();
  }
}

/** Leaderboard-friendly algorithm name including the relevant parameter. */
export function schedulerLabel(choice: SchedulerChoice): string {
  if (choice.algorithm === 'RR') return `RR(q=${choice.quantum})`;
  if (choice.algorithm === 'PRIORITY') return choice.preemptive ? 'Priority (preemptive)' : 'Priority';
  return choice.algorithm;
}
