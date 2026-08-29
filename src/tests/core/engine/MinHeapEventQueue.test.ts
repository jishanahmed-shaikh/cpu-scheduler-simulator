import { describe, expect, it } from 'vitest';
import { MinHeapEventQueue } from '../../../core/engine/MinHeapEventQueue';
import type { EventType, SimulationEvent } from '../../../core/models/SimulationEvent';

const ev = (time: number, type: EventType, pid: number | null): SimulationEvent => ({
  time,
  type,
  pid,
  details: {},
});

function drain(queue: MinHeapEventQueue): SimulationEvent[] {
  const out: SimulationEvent[] = [];
  while (!queue.isEmpty()) out.push(queue.pop()!);
  return out;
}

describe('MinHeapEventQueue', () => {
  it('pops events in ascending time order', () => {
    const q = new MinHeapEventQueue();
    [ev(5, 'ARRIVE', 1), ev(1, 'ARRIVE', 2), ev(3, 'ARRIVE', 3)].forEach((e) => q.push(e));
    expect(drain(q).map((e) => e.time)).toEqual([1, 3, 5]);
  });

  it('orders equal-time events ARRIVE < COMPLETE < PREEMPT < IDLE_START', () => {
    const q = new MinHeapEventQueue();
    [
      ev(2, 'IDLE_START', null),
      ev(2, 'PREEMPT', 1),
      ev(2, 'COMPLETE', 1),
      ev(2, 'ARRIVE', 1),
    ].forEach((e) => q.push(e));
    expect(drain(q).map((e) => e.type)).toEqual(['ARRIVE', 'COMPLETE', 'PREEMPT', 'IDLE_START']);
  });

  it('breaks ties within a type by ascending PID', () => {
    const q = new MinHeapEventQueue();
    [ev(1, 'ARRIVE', 9), ev(1, 'ARRIVE', 2), ev(1, 'ARRIVE', 5)].forEach((e) => q.push(e));
    expect(drain(q).map((e) => e.pid)).toEqual([2, 5, 9]);
  });

  it('peek returns without removing; isEmpty reflects state', () => {
    const q = new MinHeapEventQueue();
    expect(q.isEmpty()).toBe(true);
    q.push(ev(1, 'ARRIVE', 1));
    expect(q.peek()?.pid).toBe(1);
    expect(q.isEmpty()).toBe(false);
    q.pop();
    expect(q.isEmpty()).toBe(true);
  });
});
