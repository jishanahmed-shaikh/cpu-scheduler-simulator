import { describe, expect, it } from 'vitest';
import {
  PREDEFINED_SCENARIO_IDS,
  getScenario,
} from '../../../core/scenarios/PredefinedScenarios';
import { FCFSScheduler } from '../../../core/schedulers/FCFSScheduler';
import { runWith, allSchedulers } from '../../helpers/runAll';

describe('Predefined scenarios (Requirement 11)', () => {
  it('ships at least six scenarios that all load', () => {
    expect(PREDEFINED_SCENARIO_IDS.length).toBeGreaterThanOrEqual(6);
    for (const id of PREDEFINED_SCENARIO_IDS) {
      expect(getScenario(id)).not.toBeNull();
    }
  });

  it('returns null for an unknown scenario id', () => {
    expect(getScenario('NOPE')).toBeNull();
  });

  it('SINGLE_PROCESS yields one segment and zero context switches', () => {
    const scenario = getScenario('SINGLE_PROCESS')!;
    const result = runWith(scenario.processes, new FCFSScheduler());
    expect(result.ganttChart).toHaveLength(1);
    expect(result.metrics!.contextSwitches).toBe(1);
  });

  it('ZERO_BURST process is excluded from CPU segments and completes at arrival', () => {
    const scenario = getScenario('ZERO_BURST')!;
    const result = runWith(scenario.processes, new FCFSScheduler());
    expect(result.ganttChart.some((s) => s.pid === 2)).toBe(false);
    expect(result.metrics!.perProcess.find((r) => r.pid === 2)).toMatchObject({
      turnaroundTime: 0,
      waitingTime: 0,
    });
  });

  it('EXTREME_RANGE has a longest burst at least 10x the shortest', () => {
    const bursts = getScenario('EXTREME_RANGE')!.processes.map((p) => p.burstTime);
    expect(Math.max(...bursts)).toBeGreaterThanOrEqual(10 * Math.min(...bursts));
  });

  it('every scenario simulates to completion under every scheduler', () => {
    for (const id of PREDEFINED_SCENARIO_IDS) {
      const scenario = getScenario(id)!;
      for (const scheduler of allSchedulers()) {
        const result = runWith(scenario.processes, scheduler);
        expect(result.errors).toHaveLength(0);
        expect(result.events.length).toBeGreaterThan(0);
      }
    }
  });
});
