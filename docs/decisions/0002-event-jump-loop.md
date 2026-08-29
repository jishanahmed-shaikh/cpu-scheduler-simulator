# 0002 — Analytic event-jump loop instead of a heap-driven loop

## Status

Accepted.

## Context

The design sketches the engine as draining a `MinHeapEventQueue` of future
events. Requirements 8.1 and 8.6 only require that the engine "advance time to
the next event rather than incrementing by 1" and run in roughly `O(n log n)`.

## Decision

`simulationLoop.ts` keeps arrivals in an array sorted once (`O(n log n)`) and,
at each step, jumps `currentTime` to the analytic minimum of:

- the running process's completion time,
- the next arrival time (for preemptive schedulers only),
- the Round Robin quantum expiry.

`MinHeapEventQueue` is still implemented and unit-tested; it encodes the exact
same same-timestamp comparator and is available to any caller that wants a
literal event queue.

## Rationale

- The loop is short (one file, well under the 169-line limit) and easy to read.
- It is fully deterministic and passes every ordering, determinism, and
  Gantt-coverage property test.
- The 1000-process smoke test completes in a few milliseconds.

## Consequences

Non-preemptive runs skip straight to completion, so mid-run arrivals are
emitted (in order, at their real timestamps) just before the `COMPLETE` event.
Event-time monotonicity and the fixed same-time order still hold.
