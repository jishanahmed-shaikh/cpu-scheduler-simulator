import type { Process } from '../core/models/Process';
import type { SimulationEvent } from '../core/models/SimulationEvent';
import type { SimulationResult } from '../core/models/GanttSegment';
import { runSimulation, type SimulationEngineConfig } from '../core/engine/SimulationEngine';
import { cloneProcesses } from '../core/models/Process';
import { deriveState, type RunnerState } from './runnerState';
import { formatDecisionExplanation } from './explanations/DecisionExplainer';

export interface LearnStep {
  event: SimulationEvent;
  explanation: string;
  snapshot: RunnerState;
}

/**
 * Steps through the scheduling decisions (START events) one at a time,
 * pairing each with a natural-language explanation (Requirement 12).
 */
export class LearnModeController {
  private result: SimulationResult | null = null;
  private processes: Process[] = [];
  private decisionIndices: number[] = [];
  private cursor = 0;

  start(config: SimulationEngineConfig): void {
    this.result = runSimulation(config);
    this.processes = cloneProcesses(config.processes);
    this.decisionIndices = this.result.events
      .map((event, index) => (event.type === 'START' ? index : -1))
      .filter((index) => index >= 0);
    this.cursor = 0;
  }

  nextStep(): LearnStep | null {
    if (!this.result || this.cursor >= this.decisionIndices.length) return null;
    const eventIndex = this.decisionIndices[this.cursor]!;
    this.cursor += 1;
    const event = this.result.events[eventIndex]!;
    return {
      event,
      explanation: formatDecisionExplanation(event),
      snapshot: {
        status: this.isComplete ? 'completed' : 'paused',
        ...deriveState(this.result.events, eventIndex + 1, this.processes, this.result.ganttChart),
      },
    };
  }

  restart(): void {
    this.cursor = 0;
  }

  get currentStep(): number {
    return this.cursor;
  }

  get totalSteps(): number {
    return this.decisionIndices.length;
  }

  get isComplete(): boolean {
    return this.cursor >= this.decisionIndices.length;
  }

  get finalResult(): SimulationResult | null {
    return this.result;
  }
}
