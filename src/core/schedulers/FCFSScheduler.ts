import type { Process } from '../models/Process';
import { pickMin, type Scheduler } from './Scheduler';

/** First Come First Served: non-preemptive, ordered by arrival time. */
export class FCFSScheduler implements Scheduler {
  readonly name = 'FCFS';
  readonly preemptive = false;

  selectNext(readyQueue: Process[], _currentTime = 0): Process | null {
    return pickMin(readyQueue, (p) => p.arrivalTime);
  }

  shouldPreempt(_running?: Process, _readyQueue?: Process[], _currentTime?: number): boolean {
    return false;
  }

  explainSelection(selected: Process): string {
    return `it has the earliest arrival time (${selected.arrivalTime})`;
  }
}
