import { useRunnerState } from '../hooks/useRunnerState';
import { useSelectedEvent } from '../context/SelectedEventContext';

export function EventTimeline() {
  const { events, currentEventIndex } = useRunnerState();
  const { selected, select } = useSelectedEvent();

  return (
    <section className="timeline" aria-label="Event timeline" aria-live="polite">
      <h2>Event Timeline</h2>
      <ol className="timeline__list">
        {events.map((event, i) => {
          const isPast = i < currentEventIndex;
          const isSelected = selected === event;
          return (
            <li key={i}>
              <button
                type="button"
                className={`timeline__row ${isPast ? 'is-past' : ''} ${isSelected ? 'is-selected' : ''}`}
                aria-current={isSelected ? 'true' : undefined}
                onClick={() => select(event)}
              >
                <span className="timeline__time">t{event.time}</span>
                <span className="timeline__type">{event.type}</span>
                <span className="timeline__pid">{event.pid === null ? '—' : `P${event.pid}`}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
