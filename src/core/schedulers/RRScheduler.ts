import type { Process } from '../models/Process';
import type { Scheduler } from './Scheduler';

const MIN_QUANTUM = 1;
const MAX_QUANTUM = 1000;

/**
 * Round Robin: preempts the running process once it has consumed a full
 * time quantum. Ready-queue FIFO order is preserved by the engine.
 */
export class RRScheduler implements Scheduler {
  readonly name = 'RR';
  readonly preemptive = true;
  readonly quantum: number;

  private dispatchTime = new Map<number, number>();

  constructor(quantum: number) {
    if (
      !Number.isInteger(quantum) ||
      quantum < MIN_QUANTUM ||
      quantum > MAX_QUANTUM
    ) {
      throw new RangeError(
        `RR quantum must be an integer in [${MIN_QUANTUM}, ${MAX_QUANTUM}], got ${quantum}`,
      );
    }
    this.quantum = quantum;
  }

  selectNext(readyQueue: Process[], _currentTime = 0): Process | null {
    return readyQueue.length > 0 ? readyQueue[0]! : null;
  }

  shouldPreempt(running: Process, _readyQueue: Process[], currentTime = 0): boolean {
    const since = this.dispatchTime.get(running.pid);
    if (since === undefined) return false;
    return currentTime - since >= this.quantum;
  }

  onDispatch(process: Process, currentTime: number): void {
    this.dispatchTime.set(process.pid, currentTime);
  }

  onRelease(process: Process): void {
    this.dispatchTime.delete(process.pid);
  }

  reset(): void {
    this.dispatchTime.clear();
  }

  explainSelection(): string {
    return `it is at the front of the FIFO ready queue (quantum ${this.quantum})`;
  }
}
