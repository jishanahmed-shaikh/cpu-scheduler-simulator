import type { SimulationEvent } from './SimulationEvent';

/** A contiguous span of CPU time assigned to one process. */
export interface GanttSegment {
  pid: number;
  startTime: number;
  endTime: number;
}

export interface ProcessMetrics {
  pid: number;
  waitingTime: number;
  turnaroundTime: number;
  responseTime: number;
}

export interface SimulationMetrics {
  perProcess: ProcessMetrics[];
  averageWaitingTime: number;
  averageTurnaroundTime: number;
  averageResponseTime: number;
  throughput: number | undefined;
  cpuUtilization: number | undefined;
  contextSwitches: number;
  makespan: number;
}

export interface ValidationError {
  code: string;
  details: Record<string, unknown>;
}

export type MetricWarningReason =
  | 'TURNAROUND_BELOW_BURST'
  | 'NEGATIVE_WAITING_TIME'
  | 'UTILIZATION_OUT_OF_RANGE';

export interface MetricWarning {
  pid: number;
  reason: MetricWarningReason;
}

export interface SimulationResult {
  errors: ValidationError[];
  events: SimulationEvent[];
  ganttChart: GanttSegment[];
  metrics: SimulationMetrics | null;
  metricWarnings: MetricWarning[];
}

/** JSON-safe form: `undefined` aggregate metrics become `null`. */
export interface SerializedSimulationResult {
  errors: ValidationError[];
  events: SimulationEvent[];
  ganttChart: GanttSegment[];
  metrics: {
    perProcess: ProcessMetrics[];
    averageWaitingTime: number;
    averageTurnaroundTime: number;
    averageResponseTime: number;
    throughput: number | null;
    cpuUtilization: number | null;
    contextSwitches: number;
    makespan: number;
  } | null;
  metricWarnings: MetricWarning[];
}
