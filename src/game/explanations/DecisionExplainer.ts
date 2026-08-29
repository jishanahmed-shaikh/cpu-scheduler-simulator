import type { SimulationEvent } from '../../core/models/SimulationEvent';

export interface DecisionDetails {
  pid: number;
  remainingBurstTime: number;
  arrivalTime: number;
  priority: number;
  reason: string;
}

export type InspectionResult =
  | { ok: true; data: DecisionDetails; explanation: string }
  | { ok: false; missingFields: string[] };

const REQUIRED: Array<keyof DecisionDetails> = [
  'pid',
  'remainingBurstTime',
  'arrivalTime',
  'priority',
  'reason',
];

/** Human-readable line built only from the engine's event details (Req 20.3). */
export function formatDecisionExplanation(event: SimulationEvent): string {
  const reason = event.details.reason;
  const pid = event.pid;
  if (typeof reason !== 'string' || pid === null) {
    return 'This event has no recorded scheduling decision.';
  }
  return `Process P${pid} was chosen because ${reason}.`;
}

/** Structured inspection for the Decision Inspector panel (Requirements 20.2, 20.5). */
export function inspectEvent(event: SimulationEvent): InspectionResult {
  const source: Record<string, unknown> = { pid: event.pid, ...event.details };
  const missingFields = REQUIRED.filter(
    (field) => source[field] === undefined || source[field] === null,
  );
  if (missingFields.length > 0) return { ok: false, missingFields };

  const data: DecisionDetails = {
    pid: source.pid as number,
    remainingBurstTime: source.remainingBurstTime as number,
    arrivalTime: source.arrivalTime as number,
    priority: source.priority as number,
    reason: source.reason as string,
  };
  return { ok: true, data, explanation: formatDecisionExplanation(event) };
}
