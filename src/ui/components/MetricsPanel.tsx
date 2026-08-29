import { useRunnerState } from '../hooks/useRunnerState';

const fmt = (n: number | undefined, digits = 2) =>
  n === undefined || Number.isNaN(n) ? '—' : n.toFixed(digits);

export function MetricsPanel() {
  const { partialMetrics: m, status } = useRunnerState();
  const rows = m.perProcess ?? [];
  const waits = rows.map((r) => r.waitingTime);
  const maxWait = waits.length ? Math.max(...waits) : null;
  const minWait = waits.length ? Math.min(...waits) : null;

  return (
    <section className="metrics" aria-label="Scheduling metrics" aria-live="polite">
      <h2>Metrics</h2>
      <table>
        <thead>
          <tr>
            <th scope="col">PID</th>
            <th scope="col">Waiting</th>
            <th scope="col">Turnaround</th>
            <th scope="col">Response</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={4}>{status === 'idle' ? 'Not started' : 'Computing…'}</td></tr>
          )}
          {rows.map((r) => {
            const cls =
              maxWait !== null && r.waitingTime === maxWait && maxWait !== minWait
                ? 'is-max'
                : minWait !== null && r.waitingTime === minWait && maxWait !== minWait
                  ? 'is-min'
                  : '';
            return (
              <tr key={r.pid} className={cls}>
                <td>P{r.pid}</td>
                <td>{r.waitingTime}</td>
                <td>{r.turnaroundTime}</td>
                <td>{r.responseTime}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <dl className="metrics__aggregates">
        <div><dt>Throughput</dt><dd>{fmt(m.throughput, 3)}</dd></div>
        <div><dt>CPU utilisation</dt><dd>{m.cpuUtilization === undefined ? '—' : `${(m.cpuUtilization * 100).toFixed(1)}%`}</dd></div>
        <div><dt>Context switches</dt><dd>{m.contextSwitches ?? '—'}</dd></div>
        <div><dt>Makespan</dt><dd>{m.makespan ?? '—'}</dd></div>
        <div><dt>Avg waiting</dt><dd>{fmt(m.averageWaitingTime)}</dd></div>
        <div><dt>Avg turnaround</dt><dd>{fmt(m.averageTurnaroundTime)}</dd></div>
      </dl>
    </section>
  );
}
