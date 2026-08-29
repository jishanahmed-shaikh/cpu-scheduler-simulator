import { useRef, useState } from 'react';
import { useRunnerState } from '../../hooks/useRunnerState';
import { useSelectedEvent } from '../../context/SelectedEventContext';
import { colorForPid, axisTicks, visibleTimeRange } from './ganttHelpers';

const PX_PER_UNIT = 22;
const VIRTUALISE_ABOVE = 200;

export function GanttChart() {
  const { ganttSegments, events } = useRunnerState();
  const { select } = useSelectedEvent();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);

  const makespan = ganttSegments.reduce((max, s) => Math.max(max, s.endTime), 0);
  const width = Math.max(1, makespan) * PX_PER_UNIT;
  const clientWidth = scrollRef.current?.clientWidth ?? 800;

  let shown = ganttSegments;
  if (ganttSegments.length > VIRTUALISE_ABOVE) {
    const { start, end } = visibleTimeRange(scrollLeft, clientWidth, PX_PER_UNIT);
    shown = ganttSegments.filter((s) => s.startTime < end && s.endTime > start);
  }

  const startEventFor = (pid: number, time: number) =>
    events.find((e) => e.type === 'START' && e.pid === pid && e.time === time) ?? null;

  return (
    <section className="gantt" aria-label="Gantt chart" aria-live="polite">
      <h2>Gantt Chart</h2>
      <div
        className="gantt__scroll"
        ref={scrollRef}
        onScroll={(e) => setScrollLeft(e.currentTarget.scrollLeft)}
      >
        <div className="gantt__track" style={{ width }}>
          {shown.map((seg, i) => (
            <button
              key={`${seg.pid}-${seg.startTime}-${i}`}
              type="button"
              className="gantt__segment"
              style={{
                left: seg.startTime * PX_PER_UNIT,
                width: (seg.endTime - seg.startTime) * PX_PER_UNIT,
                background: colorForPid(seg.pid),
              }}
              title={`P${seg.pid}: ${seg.startTime}–${seg.endTime}`}
              onClick={() => select(startEventFor(seg.pid, seg.startTime))}
            >
              P{seg.pid}
            </button>
          ))}
        </div>
        <div className="gantt__axis" style={{ width }}>
          {axisTicks(makespan).map((t) => (
            <span key={t} className="gantt__tick" style={{ left: t * PX_PER_UNIT }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
