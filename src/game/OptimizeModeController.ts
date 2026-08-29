import type { Process } from '../core/models/Process';
import type { SimulationMetrics } from '../core/models/GanttSegment';
import type { Scheduler } from '../core/schedulers/Scheduler';
import { runSimulation } from '../core/engine/SimulationEngine';
import { FCFSScheduler } from '../core/schedulers/FCFSScheduler';
import { SJFScheduler } from '../core/schedulers/SJFScheduler';
import { SRTFScheduler } from '../core/schedulers/SRTFScheduler';
import { RRScheduler } from '../core/schedulers/RRScheduler';
import { PriorityScheduler } from '../core/schedulers/PriorityScheduler';
import { optimizeScore } from './scoring';

export type MetricKey = 'averageWaitingTime' | 'averageTurnaroundTime' | 'averageResponseTime';

export interface OptimizeResult {
  resultMetric: number;
  optimalMetric: number;
  score: number;
  isPerfect: boolean;
}

function candidateSchedulers(): Scheduler[] {
  const rr = [1, 2, 3, 4, 6, 8].map((q) => new RRScheduler(q));
  return [
    new FCFSScheduler(),
    new SJFScheduler(),
    new SRTFScheduler(),
    ...rr,
    new PriorityScheduler(false),
    new PriorityScheduler(true),
  ];
}

function metricValue(metrics: SimulationMetrics, key: MetricKey): number {
  return metrics[key];
}

/** Brute-forces the minimum achievable value of `key` for this workload. */
export function computeOptimal(processes: Process[], key: MetricKey): number {
  let best = Infinity;
  for (const scheduler of candidateSchedulers()) {
    const result = runSimulation({ processes, scheduler });
    if (result.metrics) best = Math.min(best, metricValue(result.metrics, key));
  }
  return best === Infinity ? 0 : best;
}

/** Scores how close a chosen scheduler comes to the optimal metric (Requirement 14). */
export class OptimizeModeController {
  private processes: Process[] = [];
  private targetMetric: MetricKey = 'averageWaitingTime';
  private optimalValue = 0;

  load(processes: Process[], targetMetric: MetricKey, optimalValue?: number): void {
    this.processes = processes;
    this.targetMetric = targetMetric;
    this.optimalValue = optimalValue ?? computeOptimal(processes, targetMetric);
  }

  get optimal(): number {
    return this.optimalValue;
  }

  submit(scheduler: Scheduler): OptimizeResult {
    const result = runSimulation({ processes: this.processes, scheduler });
    const resultMetric = result.metrics ? metricValue(result.metrics, this.targetMetric) : Infinity;
    const { score, isPerfect } = optimizeScore(resultMetric, this.optimalValue);
    return { resultMetric, optimalMetric: this.optimalValue, score, isPerfect };
  }
}
