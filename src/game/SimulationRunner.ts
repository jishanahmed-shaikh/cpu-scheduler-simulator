import type { Process } from '../core/models/Process';
import type { SimulationResult } from '../core/models/GanttSegment';
import { runSimulation, type SimulationEngineConfig } from '../core/engine/SimulationEngine';
import { cloneProcesses } from '../core/models/Process';
import { deriveState, type RunnerState, type RunnerStatus } from './runnerState';

export type SpeedMultiplier = 0.25 | 0.5 | 1 | 2 | 4 | 8;
const BASE_INTERVAL_MS = 600;

type Listener = (state: RunnerState) => void;

/**
 * Framework-agnostic playback cursor over a precomputed event log.
 * Consumers subscribe to `stateChange`; no React or DOM references.
 */
export class SimulationRunner {
  private result: SimulationResult | null = null;
  private processes: Process[] = [];
  private index = 0;
  private status: RunnerStatus = 'idle';
  private speed: SpeedMultiplier = 1;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private listeners = new Set<Listener>();

  load(config: SimulationEngineConfig): void {
    this.stopTimer();
    this.result = runSimulation(config);
    this.processes = cloneProcesses(config.processes);
    this.index = 0;
    this.status = 'idle';
    this.emit();
  }

  play(): void {
    if (!this.result || this.status === 'completed' || this.atEnd()) return;
    this.status = 'playing';
    this.schedule();
    this.emit();
  }

  pause(): void {
    this.stopTimer();
    if (this.status === 'playing') this.status = 'paused';
    this.emit();
  }

  step(): void {
    if (this.status === 'playing') this.pause();
    this.advance();
    this.emit();
  }

  reset(): void {
    this.stopTimer();
    this.index = 0;
    this.status = 'idle';
    this.emit();
  }

  setSpeed(multiplier: SpeedMultiplier): void {
    this.speed = multiplier;
    if (this.status === 'playing') this.schedule();
  }

  getState(): RunnerState {
    const events = this.result?.events ?? [];
    const gantt = this.result?.ganttChart ?? [];
    return { status: this.status, ...deriveState(events, this.index, this.processes, gantt) };
  }

  on(_event: 'stateChange', handler: Listener): void {
    this.listeners.add(handler);
  }

  off(_event: 'stateChange', handler: Listener): void {
    this.listeners.delete(handler);
  }

  private advance(): void {
    if (this.atEnd()) {
      this.status = 'completed';
      this.stopTimer();
      return;
    }
    this.index += 1;
    if (this.atEnd()) {
      this.status = 'completed';
      this.stopTimer();
    }
  }

  private schedule(): void {
    this.stopTimer();
    const interval = BASE_INTERVAL_MS / this.speed;
    this.timer = setTimeout(() => {
      this.advance();
      this.emit();
      if (this.status === 'playing') this.schedule();
    }, interval);
  }

  private stopTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private atEnd(): boolean {
    return this.index >= (this.result?.events.length ?? 0);
  }

  private emit(): void {
    const state = this.getState();
    for (const listener of this.listeners) listener(state);
  }
}
