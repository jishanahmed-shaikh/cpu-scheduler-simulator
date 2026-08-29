import { describe, expect, it } from 'vitest';
import { runSimulation } from '../../../core/engine/SimulationEngine';
import { FCFSScheduler } from '../../../core/schedulers/FCFSScheduler';
import { RRScheduler } from '../../../core/schedulers/RRScheduler';
import { createSeededRNG } from '../../../core/rng/SeededRNG';
import type { ProcessInput } from '../../../core/models/Process';

function generate(n: number, seed: number): ProcessInput[] {
  const rng = createSeededRNG(seed);
  return Array.from({ length: n }, (_v, i) => ({
    pid: i + 1,
    arrivalTime: rng.nextInt(0, 2000),
    burstTime: rng.nextInt(1, 50),
    priority: rng.nextInt(0, 20),
  }));
}

describe('engine smoke tests (Requirement 8.6)', () => {
  it('runs 1000 processes to completion in well under 5 seconds', () => {
    const processes = generate(1000, 42);
    const started = Date.now();
    const result = runSimulation({ processes, scheduler: new FCFSScheduler() });
    const elapsed = Date.now() - started;
    expect(result.errors).toHaveLength(0);
    expect(result.events.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(5000);
  });

  it('runs a large preemptive Round Robin workload to completion', () => {
    const processes = generate(400, 7);
    const result = runSimulation({ processes, scheduler: new RRScheduler(3) });
    expect(result.errors).toHaveLength(0);
    const completed = result.events.filter((e) => e.type === 'COMPLETE').length;
    expect(completed).toBe(400);
  });
});
