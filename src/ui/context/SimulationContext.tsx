import { createContext, useContext } from 'react';
import type { SimulationRunner } from '../../game/SimulationRunner';
import type { LearnModeController } from '../../game/LearnModeController';
import type { ChallengeModeController } from '../../game/ChallengeModeController';
import type { OptimizeModeController } from '../../game/OptimizeModeController';
import type { LeaderboardService } from '../../game/LeaderboardService';
import type { Process } from '../../core/models/Process';
import type { SchedulerChoice } from './schedulerChoice';

export type ActiveMode = 'free' | 'learn' | 'challenge' | 'optimize';

export interface SimulationContextValue {
  runner: SimulationRunner;
  learn: LearnModeController;
  challenge: ChallengeModeController;
  optimize: OptimizeModeController;
  leaderboard: LeaderboardService;
  storageUnavailable: boolean;

  activeMode: ActiveMode;
  setActiveMode: (mode: ActiveMode) => void;

  processes: Process[];
  setProcesses: (processes: Process[]) => void;

  choice: SchedulerChoice;
  setChoice: (choice: SchedulerChoice) => void;
}

export const SimulationContext = createContext<SimulationContextValue | null>(null);

export function useSimulation(): SimulationContextValue {
  const value = useContext(SimulationContext);
  if (!value) throw new Error('useSimulation must be used within a SimulationProvider');
  return value;
}
