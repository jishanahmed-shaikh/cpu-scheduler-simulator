import type { Process } from '../models/Process';
import { pickMin, type Scheduler } from './Scheduler';

/**
 * Priority scheduling. Lower `priority` number = higher urgency.
 * Preemptive variant interrupts the running process when a strictly
 * higher-priority process becomes ready.
 */
export class PriorityScheduler implements Scheduler {
  readonly name: string;
  readonly preemptive: boolean;

  constructor(preemptive: boolean) {
    this.preemptive = preemptive;
    this.name = preemptive ? 'PriorityP' : 'Priority';
  }

  selectNext(readyQueue: Process[], _currentTime = 0): Process | null {
    return pickMin(readyQueue, (p) => p.priority);
  }

  shouldPreempt(running: Process, readyQueue: Process[], _currentTime?: number): boolean {
    if (!this.preemptive) return false;
    return readyQueue.some((p) => p.priority < running.priority);
  }

  explainSelection(selected: Process): string {
    return `it has the lowest priority number (${selected.priority}), i.e. highest urgency`;
  }
}
