import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { SimulationRunner } from '../../game/SimulationRunner';
import { LearnModeController } from '../../game/LearnModeController';
import { ChallengeModeController } from '../../game/ChallengeModeController';
import { OptimizeModeController } from '../../game/OptimizeModeController';
import { LeaderboardService } from '../../game/LeaderboardService';
import { getScenario } from '../../core/scenarios/PredefinedScenarios';
import type { Process } from '../../core/models/Process';
import { SimulationContext, type ActiveMode, type SimulationContextValue } from './SimulationContext';
import { DEFAULT_CHOICE, createScheduler, type SchedulerChoice } from './schedulerChoice';

const INITIAL_PROCESSES = getScenario('STAGGERED_ARRIVALS')!.processes;

export function SimulationProvider({ children }: { children: ReactNode }) {
  const refs = useRef<{
    runner: SimulationRunner;
    learn: LearnModeController;
    challenge: ChallengeModeController;
    optimize: OptimizeModeController;
    leaderboard: LeaderboardService;
  }>();
  if (!refs.current) {
    refs.current = {
      runner: new SimulationRunner(),
      learn: new LearnModeController(),
      challenge: new ChallengeModeController(),
      optimize: new OptimizeModeController(),
      leaderboard: new LeaderboardService(),
    };
  }

  const [activeMode, setActiveMode] = useState<ActiveMode>('free');
  const [processes, setProcesses] = useState<Process[]>(INITIAL_PROCESSES);
  const [choice, setChoice] = useState<SchedulerChoice>(DEFAULT_CHOICE);

  useEffect(() => {
    refs.current!.runner.load({ processes, scheduler: createScheduler(choice) });
  }, [processes, choice]);

  const value = useMemo<SimulationContextValue>(
    () => ({
      ...refs.current!,
      storageUnavailable: refs.current!.leaderboard.storageUnavailable,
      activeMode,
      setActiveMode,
      processes,
      setProcesses,
      choice,
      setChoice,
    }),
    [activeMode, processes, choice],
  );

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
}
