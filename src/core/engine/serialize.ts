import type {
  SerializedSimulationResult,
  SimulationResult,
} from '../models/GanttSegment';

/** Converts a result to a JSON-safe shape (`undefined` metrics become `null`). */
export function serializeResult(result: SimulationResult): SerializedSimulationResult {
  return {
    errors: result.errors,
    events: result.events,
    ganttChart: result.ganttChart,
    metrics: result.metrics
      ? {
          perProcess: result.metrics.perProcess,
          averageWaitingTime: result.metrics.averageWaitingTime,
          averageTurnaroundTime: result.metrics.averageTurnaroundTime,
          averageResponseTime: result.metrics.averageResponseTime,
          throughput: result.metrics.throughput ?? null,
          cpuUtilization: result.metrics.cpuUtilization ?? null,
          contextSwitches: result.metrics.contextSwitches,
          makespan: result.metrics.makespan,
        }
      : null,
    metricWarnings: result.metricWarnings,
  };
}

/** Inverse of {@link serializeResult}; `null` metrics stay `undefined`. */
export function deserializeResult(data: SerializedSimulationResult): SimulationResult {
  return {
    errors: data.errors,
    events: data.events,
    ganttChart: data.ganttChart,
    metrics: data.metrics
      ? {
          perProcess: data.metrics.perProcess,
          averageWaitingTime: data.metrics.averageWaitingTime,
          averageTurnaroundTime: data.metrics.averageTurnaroundTime,
          averageResponseTime: data.metrics.averageResponseTime,
          throughput: data.metrics.throughput ?? undefined,
          cpuUtilization: data.metrics.cpuUtilization ?? undefined,
          contextSwitches: data.metrics.contextSwitches,
          makespan: data.metrics.makespan,
        }
      : null,
    metricWarnings: data.metricWarnings,
  };
}

/** Round-trips through a JSON string; used by Property 25 tests. */
export function jsonRoundTrip(result: SimulationResult): SimulationResult {
  const json = JSON.stringify(serializeResult(result));
  return deserializeResult(JSON.parse(json) as SerializedSimulationResult);
}
