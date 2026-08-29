import fc from 'fast-check';
import { initProcess, type Process, type ProcessInput } from '../../core/models/Process';
import { FCFSScheduler } from '../../core/schedulers/FCFSScheduler';
import { SJFScheduler } from '../../core/schedulers/SJFScheduler';
import { SRTFScheduler } from '../../core/schedulers/SRTFScheduler';
import { RRScheduler } from '../../core/schedulers/RRScheduler';
import { PriorityScheduler } from '../../core/schedulers/PriorityScheduler';
import type { Scheduler } from '../../core/schedulers/Scheduler';

/** Valid workload bounds used by property tests (Requirement 22.2). */
export const arbProcessInput = fc.record({
  arrivalTime: fc.integer({ min: 0, max: 999 }),
  burstTime: fc.integer({ min: 1, max: 100 }),
  priority: fc.integer({ min: 1, max: 10 }),
});

/** 1–n processes with unique, ascending PIDs. */
export function arbWorkload(n = 10): fc.Arbitrary<Process[]> {
  return fc
    .array(arbProcessInput, { minLength: 1, maxLength: n })
    .map((rows) =>
      rows.map((row, index) =>
        initProcess({ pid: index + 1, ...row } satisfies ProcessInput),
      ),
    );
}

/** Non-empty ready queue (processes already "arrived"). */
export function arbReadyQueue(n = 8): fc.Arbitrary<Process[]> {
  return arbWorkload(n);
}

export const arbScheduler: fc.Arbitrary<Scheduler> = fc.oneof(
  fc.constant(new FCFSScheduler()),
  fc.constant(new SJFScheduler()),
  fc.constant(new SRTFScheduler()),
  fc.integer({ min: 1, max: 20 }).map((q) => new RRScheduler(q)),
  fc.boolean().map((pre) => new PriorityScheduler(pre)),
);

export const arbSeed = fc.integer({ min: 0, max: 0xffffffff });
