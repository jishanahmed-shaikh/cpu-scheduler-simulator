import { useState } from 'react';
import { SimulationProvider } from './context/SimulationProvider';
import { SelectedEventProvider } from './context/SelectedEventContext';
import { useSimulation } from './context/SimulationContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { ModeSelector } from './components/ModeSelector';
import { ProcessTable } from './components/ProcessTable';
import { SchedulerSelector } from './components/SchedulerSelector';
import { SimulationControls } from './components/SimulationControls';
import { CpuState } from './components/CpuState';
import { ReadyQueue } from './components/ReadyQueue';
import { GanttChart } from './components/gantt/GanttChart';
import { MetricsPanel } from './components/MetricsPanel';
import { EventTimeline } from './components/EventTimeline';
import { DecisionInspector } from './components/DecisionInspector';
import { ErrorBoundary } from './components/ErrorBoundary';
import { StorageWarning } from './components/StorageWarning';
import { LeaderboardModal } from './components/LeaderboardModal';
import { Footer } from './components/Footer';
import { LearnModeOverlay } from './components/overlays/LearnModeOverlay';
import { ChallengeOverlay } from './components/overlays/ChallengeOverlay';
import { OptimizeOverlay } from './components/overlays/OptimizeOverlay';
import './styles/layout.css';
import './styles/panels.css';
import './styles/viz.css';
import './styles/overlays.css';

function Workspace() {
  const { activeMode } = useSimulation();
  const [boardOpen, setBoardOpen] = useState(false);
  useKeyboardShortcuts();

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1>CPU Scheduler Game</h1>
          <p className="app__tagline">A deterministic, offline operating-systems scheduling lab.</p>
        </div>
        <button type="button" onClick={() => setBoardOpen(true)}>Leaderboard</button>
      </header>

      <ModeSelector />
      <StorageWarning />

      {activeMode === 'learn' && <LearnModeOverlay />}
      {activeMode === 'challenge' && <ChallengeOverlay />}
      {activeMode === 'optimize' && <OptimizeOverlay />}

      <div className="app__grid">
        <div className="app__col">
          <ProcessTable />
          <SchedulerSelector />
          <SimulationControls />
          <div className="app__row">
            <CpuState />
            <ReadyQueue />
          </div>
        </div>
        <div className="app__col">
          <ErrorBoundary label="Gantt chart"><GanttChart /></ErrorBoundary>
          <ErrorBoundary label="metrics"><MetricsPanel /></ErrorBoundary>
          <div className="app__row">
            <EventTimeline />
            <ErrorBoundary label="decision inspector"><DecisionInspector /></ErrorBoundary>
          </div>
        </div>
      </div>

      <LeaderboardModal open={boardOpen} onClose={() => setBoardOpen(false)} />
      <Footer />
    </div>
  );
}

export function App() {
  return (
    <SimulationProvider>
      <SelectedEventProvider>
        <Workspace />
      </SelectedEventProvider>
    </SimulationProvider>
  );
}
