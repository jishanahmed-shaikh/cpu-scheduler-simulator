import { describe, expect, it } from 'vitest';
import { LearnModeController } from '../../game/LearnModeController';
import { ChallengeModeController } from '../../game/ChallengeModeController';
import { OptimizeModeController } from '../../game/OptimizeModeController';
import { FCFSScheduler } from '../../core/schedulers/FCFSScheduler';
import { SJFScheduler } from '../../core/schedulers/SJFScheduler';
import { getScenario } from '../../core/scenarios/PredefinedScenarios';

const scenario = () => getScenario('ALL_SIMULTANEOUS')!.processes;
const config = () => ({ processes: scenario(), scheduler: new FCFSScheduler() });

describe('LearnModeController', () => {
  it('walks every scheduling decision then returns null, and restart resets', () => {
    const learn = new LearnModeController();
    learn.start(config());
    expect(learn.totalSteps).toBe(4);
    const explanations: string[] = [];
    for (let i = 0; i < 4; i += 1) explanations.push(learn.nextStep()!.explanation);
    expect(learn.nextStep()).toBeNull();
    expect(learn.isComplete).toBe(true);
    expect(explanations[0]).toMatch(/^Process P\d was chosen because .+\.$/);
    learn.restart();
    expect(learn.currentStep).toBe(0);
  });
});

describe('ChallengeModeController', () => {
  it('offers 2-4 ready-queue candidates and scores correct answers with a streak', () => {
    const challenge = new ChallengeModeController();
    challenge.start(config(), 'hard');
    const first = challenge.getCandidates();
    expect(first.length).toBeGreaterThanOrEqual(2);
    expect(first.length).toBeLessThanOrEqual(4);

    let correctCount = 0;
    while (!challenge.isComplete) {
      const candidates = challenge.getCandidates();
      expect(candidates.map((c) => c.pid)).toContain(challenge.pendingCorrectPid);
      const res = challenge.submitAnswer(challenge.pendingCorrectPid!, 0);
      expect(res.correct).toBe(true);
      correctCount += 1;
    }
    expect(challenge.score).toBeGreaterThanOrEqual(correctCount * 100);
  });

  it('resets the streak on a wrong answer', () => {
    const challenge = new ChallengeModeController();
    challenge.start(config());
    const wrongPid = -1;
    const res = challenge.submitAnswer(wrongPid, 0);
    expect(res.correct).toBe(false);
    expect(res.newStreak).toBe(0);
  });
});

describe('OptimizeModeController', () => {
  it('scores 1000 when the chosen scheduler hits the optimal metric', () => {
    const optimize = new OptimizeModeController();
    const processes = scenario();
    optimize.load(processes, 'averageWaitingTime');
    let best = { score: 0, isPerfect: false, resultMetric: 0, optimalMetric: 0 };
    for (const s of [new FCFSScheduler(), new SJFScheduler()]) {
      const r = optimize.submit(s);
      if (r.score > best.score) best = r;
    }
    expect(best.score).toBe(1000);
    expect(best.isPerfect).toBe(true);
  });
});
