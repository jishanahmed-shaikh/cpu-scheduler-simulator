# Simulation engine

## Discrete-event loop

`src/core/engine/simulationLoop.ts` never ticks by 1. At each iteration it:

1. If the CPU is idle and the ready queue is empty, emits `IDLE_START`, jumps
   time to the next arrival, and emits `IDLE_END`.
2. Admits every process whose `arrivalTime <= now` (emitting `ARRIVE`, and for
   a zero-burst process an immediate `COMPLETE`).
3. Asks the active scheduler `shouldPreempt`; if true, closes the current Gantt
   segment, emits `PREEMPT`, and returns the running process to the queue.
4. If the CPU is free, asks `selectNext`, emits `START`, and records the
   dispatch.
5. Advances time to the nearest of: completion, next arrival (preemptive
   schedulers only), or quantum expiry (Round Robin). Emits `COMPLETE` when the
   remaining burst hits zero.

The event log is the single source of truth. Gantt segments are emitted only
as `START → COMPLETE | PREEMPT` pairs.

## Event ordering

Events at the same timestamp are ordered:

```
IDLE_END < ARRIVE < COMPLETE < PREEMPT < IDLE_START < START
```

then by ascending PID. `MinHeapEventQueue` encodes the same comparator for
callers that need a priority queue directly.

## Determinism

Given identical `processes` and `scheduler`, two runs produce deeply equal
`events`, `ganttChart`, and `metrics`. Property 14 checks this across 100
generated workloads per scheduler. Schedulers must be pure; Round Robin clears
its per-PID dispatch map in `reset()` at the start of every run.

## Validation

`validateWorkload` runs before any scheduling and rejects the whole workload
on: empty input, duplicate PID, negative/fractional burst, or any field out of
range. A `burstTime` of exactly 0 is allowed — see
[decisions/0001-zero-burst-handling.md](decisions/0001-zero-burst-handling.md).

## Metrics

All values come from the event log and the original process definitions:

- `waitingTime = turnaroundTime − burstTime`
- `turnaroundTime = completionTime − arrivalTime`
- `responseTime = firstCpuTime − arrivalTime` (or `turnaroundTime` if the
  process never ran)
- `throughput = processes / makespan`, `undefined` when `makespan === 0`
- `cpuUtilization = busyTime / makespan`, `undefined` when `makespan === 0`
- `contextSwitches` = count of `START` events whose PID differs from the
  previously started PID
- `makespan = lastCompletion − firstArrival`

Processes whose turnaround is below their burst, or whose waiting time is
negative, are flagged in `metricWarnings` and excluded from the averages. For a
correct scheduler these never fire.
