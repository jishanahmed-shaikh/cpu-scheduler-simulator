import { describe, expect, it } from 'vitest';
import { formatDecisionExplanation, inspectEvent } from '../../game/explanations/DecisionExplainer';
import type { SimulationEvent } from '../../core/models/SimulationEvent';

const startEvent: SimulationEvent = {
  time: 5,
  type: 'START',
  pid: 3,
  details: {
    remainingBurstTime: 4,
    reason: 'it has the shortest burst time (4)',
    arrivalTime: 1,
    priority: 2,
  },
};

describe('DecisionExplainer', () => {
  it('builds the explanation only from event details', () => {
    expect(formatDecisionExplanation(startEvent)).toBe(
      'Process P3 was chosen because it has the shortest burst time (4).',
    );
  });

  it('returns structured details for a complete START event', () => {
    const result = inspectEvent(startEvent);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toMatchObject({ pid: 3, remainingBurstTime: 4, arrivalTime: 1, priority: 2 });
    }
  });

  it('reports missing fields instead of showing partial data', () => {
    const broken: SimulationEvent = { time: 5, type: 'START', pid: 3, details: { reason: 'x' } };
    const result = inspectEvent(broken);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.missingFields).toEqual(
        expect.arrayContaining(['remainingBurstTime', 'arrivalTime', 'priority']),
      );
    }
  });
});
