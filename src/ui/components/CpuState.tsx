import { useRunnerState } from '../hooks/useRunnerState';

export function CpuState() {
  const { cpuProcess, currentTime } = useRunnerState();
  return (
    <section className="cpu-state" aria-label="CPU state" aria-live="polite">
      <h2>CPU</h2>
      <div className={`cpu-state__box ${cpuProcess ? 'is-busy' : 'is-idle'}`}>
        {cpuProcess ? (
          <>
            <span className="cpu-state__pid">P{cpuProcess.pid}</span>
            <span className="cpu-state__meta">
              remaining {cpuProcess.remainingBurstTime} · priority {cpuProcess.priority}
            </span>
          </>
        ) : (
          <span className="cpu-state__pid">Idle</span>
        )}
      </div>
      <p className="cpu-state__clock">t = {currentTime}</p>
    </section>
  );
}
