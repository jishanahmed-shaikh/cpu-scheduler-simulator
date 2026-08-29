# Scheduling algorithms

Every scheduler implements:

```ts
interface Scheduler {
  name: string;
  preemptive: boolean;
  selectNext(readyQueue: Process[], currentTime: number): Process | null;
  shouldPreempt(running: Process, readyQueue: Process[], currentTime: number): boolean;
  explainSelection?(selected, readyQueue, currentTime): string; // for Learn/Inspector
  onDispatch?(p, t): void; onRelease?(p, t): void; reset?(): void; // lifecycle
}
```

`selectNext` returns `null` only for an empty queue. The engine — not the
scheduler — moves processes between the queue and the CPU.

## FCFS — First Come First Served

Non-preemptive. `selectNext` returns the minimum `arrivalTime`, tie-broken by
PID. `shouldPreempt` is always `false`.

## SJF — Shortest Job First

Non-preemptive. Minimum `burstTime`, then earliest arrival, then PID. Produces
the optimal average waiting time among non-preemptive policies for a fixed
arrival set.

## SRTF — Shortest Remaining Time First

Preemptive SJF. `shouldPreempt` returns `true` when any ready process has a
strictly smaller `remainingBurstTime` than the running process. `selectNext`
returns the minimum `remainingBurstTime`.

## Round Robin

Preemptive, fixed quantum in `[1, 1000]` (constructor throws `RangeError`
otherwise). `onDispatch` records when each PID last took the CPU; `shouldPreempt`
returns `true` once `currentTime − dispatchTime >= quantum`. Preempted and
newly arrived processes go to the back of the FIFO queue. With
`quantum >= max(burstTime)` the completion times match FCFS.

## Priority

`new PriorityScheduler(preemptive: boolean)`. Lowest `priority` number wins
(0 = most urgent), tie-broken by arrival then PID. When preemptive,
`shouldPreempt` returns `true` if a ready process has a strictly lower priority
number than the running one.

## Tie-breaking summary

| Scheduler | Primary | Secondary | Tertiary |
|---|---|---|---|
| FCFS | arrival | PID | — |
| SJF | burst | arrival | PID |
| SRTF | remaining | arrival | PID |
| RR | FIFO position | — | — |
| Priority | priority number | arrival | PID |
