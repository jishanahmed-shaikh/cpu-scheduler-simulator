import type { Process } from '../models/Process';
import { pickMin, type Scheduler } from './Scheduler';

/** Shortest Remaining Time First: preemptive variant of SJF. */
export class SRTFScheduler implements Scheduler {
  readonly name = 'SRTF';
  readonly preemptive = true;

  selectNext(readyQueue: Process[], _currentTime = 0): Process | null {
    return pickMin(readyQueue, (p) => p.remainingBurstTime);
  }

  shouldPreempt(running: Process, readyQueue: Process[], _currentTime?: number): boolean {
    return readyQueue.some((p) => p.remainingBurstTime < running.remainingBurstTime);
  }

  explainSelection(selected: Process): string {
    return `it has the smallest remaining burst time (${selected.remainingBurstTime})`;
  }
}
