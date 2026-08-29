import { initProcess, type Process, type ProcessInput } from '../models/Process';

export type PredefinedScenarioId =
  | 'ALL_SIMULTANEOUS'
  | 'STAGGERED_ARRIVALS'
  | 'SINGLE_PROCESS'
  | 'EQUAL_BURSTS'
  | 'EXTREME_RANGE'
  | 'ZERO_BURST';

export interface Scenario {
  id: PredefinedScenarioId;
  name: string;
  description: string;
  processes: Process[];
}

type Row = Omit<ProcessInput, 'remainingBurstTime'>;

const make = (rows: Row[]): Process[] => rows.map(initProcess);

const DEFINITIONS: Record<PredefinedScenarioId, Omit<Scenario, 'processes'> & { rows: Row[] }> = {
  ALL_SIMULTANEOUS: {
    id: 'ALL_SIMULTANEOUS',
    name: 'All Simultaneous Arrivals',
    description: 'Four processes that all arrive at time 0; tie-breaking decides order.',
    rows: [
      { pid: 1, arrivalTime: 0, burstTime: 7, priority: 2 },
      { pid: 2, arrivalTime: 0, burstTime: 4, priority: 1 },
      { pid: 3, arrivalTime: 0, burstTime: 9, priority: 3 },
      { pid: 4, arrivalTime: 0, burstTime: 4, priority: 2 },
    ],
  },
  STAGGERED_ARRIVALS: {
    id: 'STAGGERED_ARRIVALS',
    name: 'Staggered Arrivals',
    description: 'Processes arrive one after another, producing CPU idle gaps under some policies.',
    rows: [
      { pid: 1, arrivalTime: 0, burstTime: 5, priority: 2 },
      { pid: 2, arrivalTime: 3, burstTime: 6, priority: 1 },
      { pid: 3, arrivalTime: 8, burstTime: 2, priority: 3 },
      { pid: 4, arrivalTime: 14, burstTime: 4, priority: 2 },
    ],
  },
  SINGLE_PROCESS: {
    id: 'SINGLE_PROCESS',
    name: 'Single Process',
    description: 'One process only: exactly one Gantt segment and zero context switches between processes.',
    rows: [{ pid: 1, arrivalTime: 0, burstTime: 6, priority: 0 }],
  },
  EQUAL_BURSTS: {
    id: 'EQUAL_BURSTS',
    name: 'Equal Burst Times',
    description: 'Every process has the same burst time, so SJF and FCFS agree.',
    rows: [
      { pid: 1, arrivalTime: 0, burstTime: 4, priority: 1 },
      { pid: 2, arrivalTime: 1, burstTime: 4, priority: 2 },
      { pid: 3, arrivalTime: 2, burstTime: 4, priority: 3 },
      { pid: 4, arrivalTime: 3, burstTime: 4, priority: 1 },
    ],
  },
  EXTREME_RANGE: {
    id: 'EXTREME_RANGE',
    name: 'Extreme Burst Range',
    description: 'The longest burst is at least 10x the shortest, stressing SJF and SRTF.',
    rows: [
      { pid: 1, arrivalTime: 0, burstTime: 2, priority: 2 },
      { pid: 2, arrivalTime: 0, burstTime: 30, priority: 1 },
      { pid: 3, arrivalTime: 1, burstTime: 3, priority: 3 },
      { pid: 4, arrivalTime: 2, burstTime: 1, priority: 2 },
    ],
  },
  ZERO_BURST: {
    id: 'ZERO_BURST',
    name: 'Zero-Burst Process',
    description: 'Includes a process with burst time 0; it completes at arrival and never uses the CPU.',
    rows: [
      { pid: 1, arrivalTime: 0, burstTime: 5, priority: 2 },
      { pid: 2, arrivalTime: 2, burstTime: 0, priority: 1 },
      { pid: 3, arrivalTime: 3, burstTime: 4, priority: 3 },
    ],
  },
};

export const PREDEFINED_SCENARIO_IDS = Object.keys(DEFINITIONS) as PredefinedScenarioId[];

/** Returns a fresh copy of a scenario, or null for an unknown id (Requirement 11.6). */
export function getScenario(id: string): Scenario | null {
  const def = DEFINITIONS[id as PredefinedScenarioId];
  if (!def) return null;
  return { id: def.id, name: def.name, description: def.description, processes: make(def.rows) };
}

export function allScenarios(): Scenario[] {
  return PREDEFINED_SCENARIO_IDS.map((id) => getScenario(id)!);
}
