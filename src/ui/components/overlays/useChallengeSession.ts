import { useCallback, useEffect, useRef, useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { createScheduler } from '../../context/schedulerChoice';
import type { Process } from '../../../core/models/Process';
import type { AnswerResult, Difficulty } from '../../../game/ChallengeModeController';

interface SessionView {
  candidates: Process[];
  lastResult: AnswerResult | null;
  score: number;
  streak: number;
  complete: boolean;
}

export function useChallengeSession(difficulty: Difficulty) {
  const { challenge, runner, processes, choice } = useSimulation();
  const shownAt = useRef(Date.now());
  const [view, setView] = useState<SessionView>({
    candidates: [],
    lastResult: null,
    score: 0,
    streak: 0,
    complete: false,
  });

  const refresh = useCallback(
    (lastResult: AnswerResult | null): void => {
      const candidates = challenge.getCandidates();
      shownAt.current = Date.now();
      setView({
        candidates,
        lastResult,
        score: challenge.score,
        streak: challenge.streak,
        complete: challenge.isComplete,
      });
      const idx = challenge.pendingEventIndex;
      runner.seekTo(idx === null ? Number.MAX_SAFE_INTEGER : idx);
    },
    [challenge, runner],
  );

  useEffect(() => {
    challenge.start({ processes, scheduler: createScheduler(choice) }, difficulty);
    runner.reset();
    refresh(null);
  }, [challenge, runner, processes, choice, difficulty, refresh]);

  const answer = (pid: number): void => {
    const elapsed = (Date.now() - shownAt.current) / 1000;
    const result = challenge.submitAnswer(pid, elapsed);
    refresh(result);
  };

  return { view, answer };
}
