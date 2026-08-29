import type { Process } from '../models/Process';
import { pickMin, type Scheduler } from './Scheduler';

/** Shortest Job First: non-preemptive, ordered by total burst time. */
export class SJFScheduler implements Scheduler {
  readonly name = 'SJF';
  readonly preemptive = false;

  selectNext(readyQueue: Process[], _currentTime = 0): Process | null {
    return pickMin(readyQueue, (p) => p.burstTime);
  }

  shouldPreempt(_running?: Process, _readyQueue?: Process[], _currentTime?: number): boolean {
    return false;
  }

  explainSelection(selected: Process): string {
    return `it has the shortest burst time (${selected.burstTime})`;
  }
}
