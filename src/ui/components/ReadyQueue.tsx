import { useRunnerState } from '../hooks/useRunnerState';

export function ReadyQueue() {
  const { readyQueue } = useRunnerState();
  return (
    <section className="ready-queue" aria-label="Ready queue" aria-live="polite">
      <h2>Ready Queue</h2>
      {readyQueue.length === 0 ? (
        <p className="ready-queue__empty">Empty</p>
      ) : (
        <ol className="ready-queue__list">
          {readyQueue.map((p) => (
            <li key={p.pid} className="ready-queue__item">
              <span className="ready-queue__pid">P{p.pid}</span>
              <span className="ready-queue__meta">
                burst {p.burstTime} · arr {p.arrivalTime} · pri {p.priority}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
