import { useSimulation, type ActiveMode } from '../context/SimulationContext';

const MODES: Array<{ id: ActiveMode; label: string; hint: string }> = [
  { id: 'free', label: 'Free Run', hint: 'Explore any algorithm at your own pace' },
  { id: 'learn', label: 'Learn', hint: 'Step through each scheduling decision' },
  { id: 'challenge', label: 'Challenge', hint: 'Predict the next process to run' },
  { id: 'optimize', label: 'Optimize', hint: 'Beat the target metric' },
];

export function ModeSelector() {
  const { activeMode, setActiveMode } = useSimulation();
  return (
    <nav className="mode-selector" aria-label="Game mode">
      {MODES.map((mode) => (
        <button
          key={mode.id}
          type="button"
          className="mode-selector__btn"
          aria-pressed={activeMode === mode.id}
          title={mode.hint}
          onClick={() => setActiveMode(mode.id)}
        >
          {mode.label}
        </button>
      ))}
    </nav>
  );
}
