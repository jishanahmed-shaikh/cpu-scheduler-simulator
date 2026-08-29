import { runSimulation } from '../../core/engine/SimulationEngine';
import type { SimulationResult } from '../../core/models/GanttSegment';
import type { Process } from '../../core/models/Process';
import type { Scheduler } from '../../core/schedulers/Scheduler';
import { FCFSScheduler } from '../../core/schedulers/FCFSScheduler';
import { SJFScheduler } from '../../core/schedulers/SJFScheduler';
import { SRTFScheduler } from '../../core/schedulers/SRTFScheduler';
import { RRScheduler } from '../../core/schedulers/RRScheduler';
import { PriorityScheduler } from '../../core/schedulers/PriorityScheduler';

export function allSchedulers(): Scheduler[] {
  return [
    new FCFSScheduler(),
    new SJFScheduler(),
    new SRTFScheduler(),
    new RRScheduler(2),
    new RRScheduler(4),
    new PriorityScheduler(false),
    new PriorityScheduler(true),
  ];
}

export function runWith(processes: Process[], scheduler: Scheduler): SimulationResult {
  return runSimulation({ processes, scheduler });
}

export function forEachScheduler(
  processes: Process[],
  fn: (result: SimulationResult, scheduler: Scheduler) => void,
): void {
  for (const scheduler of allSchedulers()) {
    fn(runWith(processes, scheduler), scheduler);
  }
}
