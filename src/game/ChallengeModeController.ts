import type { Process } from '../core/models/Process';
import type { SimulationResult } from '../core/models/GanttSegment';
import { runSimulation, type SimulationEngineConfig } from '../core/engine/SimulationEngine';
import { cloneProcesses } from '../core/models/Process';
import { deriveState } from './runnerState';
import { challengeScore } from './scoring';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface AnswerResult {
  correct: boolean;
  correctPid: number;
  pointsAwarded: number;
  newStreak: number;
}

const MAX_CANDIDATES: Record<Difficulty, number> = { easy: 2, medium: 3, hard: 4 };

/** Asks the player to predict each scheduling decision (Requirement 13). */
export class ChallengeModeController {
  private result: SimulationResult | null = null;
  private processes: Process[] = [];
  private decisionIndices: number[] = [];
  private cursor = 0;
  private maxCandidates = 4;
  private _score = 0;
  private _streak = 0;

  start(config: SimulationEngineConfig, difficulty: Difficulty = 'medium'): void {
    this.result = runSimulation(config);
    this.processes = cloneProcesses(config.processes);
    this.decisionIndices = this.result.events
      .map((event, index) => (event.type === 'START' ? index : -1))
      .filter((index) => index >= 0);
    this.cursor = 0;
    this.maxCandidates = MAX_CANDIDATES[difficulty];
    this._score = 0;
    this._streak = 0;
  }

  get isComplete(): boolean {
    return this.cursor >= this.decisionIndices.length;
  }

  get score(): number {
    return this._score;
  }

  get streak(): number {
    return this._streak;
  }

  private correctPid(): number {
    const index = this.decisionIndices[this.cursor]!;
    return this.result!.events[index]!.pid as number;
  }

  /** The engine's actual next process for the current decision point. */
  get pendingCorrectPid(): number | null {
    return this.result && !this.isComplete ? this.correctPid() : null;
  }

  getCandidates(): Process[] {
    if (!this.result || this.isComplete) return [];
    const index = this.decisionIndices[this.cursor]!;
    const { readyQueue } = deriveState(this.result.events, index, this.processes, this.result.ganttChart);
    const correct = this.processes.find((p) => p.pid === this.correctPid())!;
    const pool = readyQueue.some((p) => p.pid === correct.pid) ? readyQueue : [correct, ...readyQueue];
    if (pool.length <= 2) return pool;
    const others = pool.filter((p) => p.pid !== correct.pid).slice(0, this.maxCandidates - 1);
    return [correct, ...others].sort((a, b) => a.pid - b.pid);
  }

  submitAnswer(pid: number, elapsedSeconds = 0): AnswerResult {
    const correctPid = this.correctPid();
    const correct = pid === correctPid;
    let pointsAwarded = 0;
    if (correct) {
      pointsAwarded = challengeScore({ elapsedSeconds, streak: this._streak });
      this._score += pointsAwarded;
      this._streak += 1;
    } else {
      this._streak = 0;
    }
    this.cursor += 1;
    return { correct, correctPid, pointsAwarded, newStreak: this._streak };
  }
}
