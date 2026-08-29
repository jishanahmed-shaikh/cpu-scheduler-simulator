import { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { initProcess, type Process } from '../../core/models/Process';
import { validateWorkload } from '../../core/engine/validateWorkload';
import {
  PREDEFINED_SCENARIO_IDS,
  getScenario,
} from '../../core/scenarios/PredefinedScenarios';

type Field = 'arrivalTime' | 'burstTime' | 'priority';

export function ProcessTable() {
  const { processes, setProcesses } = useSimulation();
  const [scenarioError, setScenarioError] = useState<string | null>(null);
  const errors = validateWorkload(processes);

  const update = (index: number, field: Field, value: number) => {
    const next = processes.map((p, i) => (i === index ? initProcess({ ...p, [field]: value }) : p));
    setProcesses(next);
  };

  const addRow = () => {
    const pid = Math.max(0, ...processes.map((p) => p.pid)) + 1;
    setProcesses([...processes, initProcess({ pid, arrivalTime: 0, burstTime: 3, priority: 0 })]);
  };

  const removeRow = (index: number) => {
    if (processes.length <= 1) return;
    setProcesses(processes.filter((_p, i) => i !== index));
  };

  const loadScenario = (id: string) => {
    if (!id) return;
    const scenario = getScenario(id);
    if (!scenario) {
      setScenarioError(`Could not load scenario "${id}". The process table is unchanged.`);
      return;
    }
    setScenarioError(null);
    setProcesses(scenario.processes.map((p) => initProcess(p)));
  };

  return (
    <section className="process-table" aria-labelledby="process-table-heading">
      <div className="process-table__bar">
        <h2 id="process-table-heading">Processes</h2>
        <label>
          <span className="visually-hidden">Load a predefined scenario</span>
          <select defaultValue="" onChange={(e) => loadScenario(e.target.value)}>
            <option value="">Load scenario…</option>
            {PREDEFINED_SCENARIO_IDS.map((id) => (
              <option key={id} value={id}>
                {getScenario(id)!.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {scenarioError && <p role="alert" className="process-table__error">{scenarioError}</p>}

      <table>
        <thead>
          <tr>
            <th scope="col">PID</th>
            <th scope="col">Arrival</th>
            <th scope="col">Burst</th>
            <th scope="col">Priority</th>
            <th scope="col"><span className="visually-hidden">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {processes.map((p: Process, index) => (
            <tr key={p.pid}>
              <td>P{p.pid}</td>
              {(['arrivalTime', 'burstTime', 'priority'] as Field[]).map((field) => (
                <td key={field}>
                  <input
                    type="number"
                    aria-label={`P${p.pid} ${field}`}
                    min={field === 'burstTime' ? 0 : 0}
                    value={p[field]}
                    onChange={(e) => update(index, field, Number(e.target.value))}
                  />
                </td>
              ))}
              <td>
                <button type="button" onClick={() => removeRow(index)} aria-label={`Remove P${p.pid}`}>
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="process-table__foot">
        <button type="button" onClick={addRow}>Add process</button>
        {errors.length > 0 && (
          <p role="alert" className="process-table__error">
            {errors[0]!.code.replace(/_/g, ' ').toLowerCase()}
            {typeof errors[0]!.details.pid === 'number' ? ` (P${errors[0]!.details.pid})` : ''}
          </p>
        )}
      </div>
    </section>
  );
}
