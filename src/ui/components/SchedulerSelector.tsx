import { useSimulation } from '../context/SimulationContext';
import { ALGORITHM_LABELS, type AlgorithmId } from '../context/schedulerChoice';

const IDS: AlgorithmId[] = ['FCFS', 'SJF', 'SRTF', 'RR', 'PRIORITY'];

export function SchedulerSelector() {
  const { choice, setChoice } = useSimulation();
  return (
    <fieldset className="scheduler-selector">
      <legend>Algorithm</legend>
      <label>
        <span className="visually-hidden">Scheduling algorithm</span>
        <select
          value={choice.algorithm}
          onChange={(e) => setChoice({ ...choice, algorithm: e.target.value as AlgorithmId })}
        >
          {IDS.map((id) => (
            <option key={id} value={id}>
              {id} — {ALGORITHM_LABELS[id]}
            </option>
          ))}
        </select>
      </label>

      {choice.algorithm === 'RR' && (
        <label className="scheduler-selector__param">
          Quantum
          <input
            type="number"
            min={1}
            max={1000}
            value={choice.quantum}
            onChange={(e) => setChoice({ ...choice, quantum: Number(e.target.value) })}
          />
        </label>
      )}

      {choice.algorithm === 'PRIORITY' && (
        <label className="scheduler-selector__param">
          <input
            type="checkbox"
            checked={choice.preemptive}
            onChange={(e) => setChoice({ ...choice, preemptive: e.target.checked })}
          />
          Preemptive
        </label>
      )}
    </fieldset>
  );
}
