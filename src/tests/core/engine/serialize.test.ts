import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { jsonRoundTrip, serializeResult } from '../../../core/engine/serialize';
import { arbWorkload } from '../../helpers/generators';
import { allSchedulers, runWith } from '../../helpers/runAll';

// Feature: cpu-scheduler-game, Property 25: Simulation Result Serialisation Round-Trip
describe('Property 25: JSON round-trip', () => {
  it('serialise then deserialise reproduces a deeply equal result', () => {
    fc.assert(
      fc.property(arbWorkload(8), (processes) => {
        for (const scheduler of allSchedulers()) {
          const original = runWith(processes, scheduler);
          expect(jsonRoundTrip(original)).toEqual(original);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('serialises undefined aggregate metrics as null when makespan is 0', () => {
    const zeroBurst = [
      { pid: 1, arrivalTime: 3, burstTime: 0, priority: 0, remainingBurstTime: 0 },
    ];
    const result = runWith(zeroBurst, allSchedulers()[0]!);
    expect(result.metrics!.makespan).toBe(0);
    const serialized = serializeResult(result);
    expect(serialized.metrics!.throughput).toBeNull();
    expect(serialized.metrics!.cpuUtilization).toBeNull();
  });
});
