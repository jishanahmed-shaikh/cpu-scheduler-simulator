import type { Process } from '../models/Process';
import type { GanttSegment } from '../models/GanttSegment';
import type { SimulationEvent, StartDetails } from '../models/SimulationEvent';
import type { Scheduler } from '../schedulers/Scheduler';
import { byArrivalThenPid } from '../schedulers/Scheduler';

export interface LoopOutput {
  events: SimulationEvent[];
  ganttChart: GanttSegment[];
}

function quantumOf(scheduler: Scheduler): number | undefined {
  const q = (scheduler as { quantum?: unknown }).quantum;
  return typeof q === 'number' ? q : undefined;
}

/**
 * Deterministic discrete-event scheduling loop. Advances time to the next
 * meaningful event (arrival, completion, quantum expiry, preemption) and
 * derives every Gantt segment from the emitted START/PREEMPT/COMPLETE pairs.
 */
export function runSimulationLoop(processes: Process[], scheduler: Scheduler): LoopOutput {
  scheduler.reset?.();
  const events: SimulationEvent[] = [];
  const ganttChart: GanttSegment[] = [];
  const arrivals = [...processes].sort(byArrivalThenPid);
  const readyQueue: Process[] = [];
  const quantum = quantumOf(scheduler);
  const activeCount = processes.filter((p) => p.burstTime > 0).length;

  let time = 0;
  let cursor = 0;
  let running: Process | null = null;
  let dispatchAt = 0;
  let segStart = 0;
  let completed = 0;
  const firstStart = new Set<number>();

  const emit = (
    type: SimulationEvent['type'],
    pid: number | null,
    at: number,
    details: Record<string, unknown>,
  ): void => {
    events.push({ time: at, type, pid, details });
  };

  const admit = (upTo: number): void => {
    while (cursor < arrivals.length && arrivals[cursor]!.arrivalTime <= upTo) {
      const p = arrivals[cursor++]!;
      emit('ARRIVE', p.pid, p.arrivalTime, {
        arrivalTime: p.arrivalTime,
        burstTime: p.burstTime,
        priority: p.priority,
      });
      if (p.burstTime === 0) {
        emit('COMPLETE', p.pid, p.arrivalTime, {
          burstTime: 0,
          turnaroundTime: 0,
          waitingTime: 0,
        });
      } else {
        readyQueue.push(p);
      }
    }
  };

  const closeSegment = (endTime: number): void => {
    if (running && endTime > segStart) {
      ganttChart.push({ pid: running.pid, startTime: segStart, endTime });
    }
  };

  while (completed < activeCount) {
    if (running === null && readyQueue.length === 0) {
      if (cursor >= arrivals.length) break;
      const nextT = arrivals[cursor]!.arrivalTime;
      if (nextT > time) {
        emit('IDLE_START', null, time, { nextArrivalTime: nextT });
        time = nextT;
        emit('IDLE_END', null, time, {});
      } else {
        time = Math.max(time, nextT);
      }
      admit(time);
      continue;
    }

    admit(time);

    if (running !== null && scheduler.shouldPreempt(running, readyQueue, time)) {
      closeSegment(time);
      emit('PREEMPT', running.pid, time, { remainingBurstTime: running.remainingBurstTime });
      scheduler.onRelease?.(running, time);
      readyQueue.push(running);
      running = null;
    }

    if (running === null) {
      const next = scheduler.selectNext(readyQueue, time);
      if (next === null) continue;
      readyQueue.splice(readyQueue.indexOf(next), 1);
      running = next;
      dispatchAt = time;
      segStart = time;
      if (!firstStart.has(next.pid)) firstStart.add(next.pid);
      scheduler.onDispatch?.(next, time);
      const reason = scheduler.explainSelection?.(next, readyQueue, time) ?? 'it was selected by the scheduler';
      const details: StartDetails = {
        remainingBurstTime: next.remainingBurstTime,
        reason,
        arrivalTime: next.arrivalTime,
        priority: next.priority,
      };
      emit('START', next.pid, time, { ...details });
    }

    let stop = time + running.remainingBurstTime;
    const nextArrival = arrivals[cursor]?.arrivalTime ?? Infinity;
    if (scheduler.preemptive && nextArrival < stop) stop = nextArrival;
    if (quantum !== undefined && dispatchAt + quantum < stop) stop = dispatchAt + quantum;

    running.remainingBurstTime -= stop - time;
    time = stop;
    admit(time);

    if (running.remainingBurstTime === 0) {
      closeSegment(time);
      emit('COMPLETE', running.pid, time, {
        burstTime: running.burstTime,
        turnaroundTime: time - running.arrivalTime,
        waitingTime: time - running.arrivalTime - running.burstTime,
      });
      scheduler.onRelease?.(running, time);
      running = null;
      completed += 1;
    }
  }

  return { events, ganttChart };
}
