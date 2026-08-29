/** Every significant step the simulation engine emits. */
export type EventType =
  | 'ARRIVE'
  | 'START'
  | 'PREEMPT'
  | 'COMPLETE'
  | 'IDLE_START'
  | 'IDLE_END';

/**
 * A single entry in the ordered event log. `details` carries
 * algorithm-specific fields keyed by event type (see design doc).
 */
export interface SimulationEvent {
  /** Integer simulation time, >= 0. */
  time: number;
  type: EventType;
  /** Process id, or null for idle events. */
  pid: number | null;
  details: Record<string, unknown>;
}

/**
 * Fixed processing order for events scheduled at the same simulation time
 * (Requirement 8.7). Lower number is processed first.
 */
export const EVENT_TYPE_ORDER: Record<EventType, number> = {
  IDLE_END: 0,
  ARRIVE: 1,
  COMPLETE: 2,
  PREEMPT: 3,
  IDLE_START: 4,
  START: 5,
};

/** Details shape for a START event; `reason` feeds the Decision Inspector. */
export interface StartDetails {
  remainingBurstTime: number;
  reason: string;
  arrivalTime: number;
  priority: number;
}

export function isSchedulingDecision(event: SimulationEvent): boolean {
  return event.type === 'START';
}
