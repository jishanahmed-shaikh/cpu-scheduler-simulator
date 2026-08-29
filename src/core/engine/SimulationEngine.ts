import { cloneProcesses, type ProcessInput } from '../models/Process';
import type { SimulationResult } from '../models/GanttSegment';
import type { Scheduler } from '../schedulers/Scheduler';
import { validateWorkload } from './validateWorkload';
import { runSimulationLoop } from './simulationLoop';
import { computeMetrics } from './MetricsCalculator';

export interface SimulationEngineConfig {
  processes: readonly ProcessInput[];
  scheduler: Scheduler;
}

const EMPTY_RESULT = (
  errors: SimulationResult['errors'],
): SimulationResult => ({
  errors,
  events: [],
  ganttChart: [],
  metrics: null,
  metricWarnings: [],
});

/**
 * Runs one deterministic simulation. Validation happens before any
 * scheduling; on failure the result carries `errors` and no events.
 */
export function runSimulation(config: SimulationEngineConfig): SimulationResult {
  const errors = validateWorkload(config.processes);
  if (errors.length > 0) return EMPTY_RESULT(errors);

  const processes = cloneProcesses(config.processes);
  const { events, ganttChart } = runSimulationLoop(processes, config.scheduler);
  const { metrics, metricWarnings } = computeMetrics(processes, events, ganttChart);

  return { errors: [], events, ganttChart, metrics, metricWarnings };
}

/** Class facade for callers that prefer an object (matches design doc). */
export class SimulationEngine {
  run(config: SimulationEngineConfig): SimulationResult {
    return runSimulation(config);
  }
}
