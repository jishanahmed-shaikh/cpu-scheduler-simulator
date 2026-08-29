import { useSelectedEvent } from '../context/SelectedEventContext';
import { inspectEvent, formatDecisionExplanation } from '../../game/explanations/DecisionExplainer';

export function DecisionInspector() {
  const { selected } = useSelectedEvent();

  return (
    <section className="inspector" aria-label="Decision inspector" aria-live="polite">
      <h2>Decision Inspector</h2>
      {!selected && (
        <p className="inspector__hint">
          Click a Gantt segment or a timeline event to see why the scheduler made that choice.
        </p>
      )}

      {selected && selected.type !== 'START' && (
        <div className="inspector__body">
          <p><strong>{selected.type}</strong> at t = {selected.time}
            {selected.pid !== null && <> · P{selected.pid}</>}</p>
          <pre>{JSON.stringify(selected.details, null, 2)}</pre>
        </div>
      )}

      {selected && selected.type === 'START' && renderStart(selected)}
    </section>
  );
}

function renderStart(event: Parameters<typeof inspectEvent>[0]) {
  const result = inspectEvent(event);
  if (!result.ok) {
    return (
      <p role="alert" className="inspector__error">
        This event is missing required fields: {result.missingFields.join(', ')}.
      </p>
    );
  }
  const { data } = result;
  return (
    <div className="inspector__body">
      <p className="inspector__explanation">{formatDecisionExplanation(event)}</p>
      <dl>
        <div><dt>PID</dt><dd>P{data.pid}</dd></div>
        <div><dt>Remaining burst</dt><dd>{data.remainingBurstTime}</dd></div>
        <div><dt>Arrival time</dt><dd>{data.arrivalTime}</dd></div>
        <div><dt>Priority</dt><dd>{data.priority}</dd></div>
        <div><dt>Chosen at</dt><dd>t = {event.time}</dd></div>
      </dl>
    </div>
  );
}
