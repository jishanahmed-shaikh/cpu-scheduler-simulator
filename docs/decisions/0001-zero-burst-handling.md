# 0001 — Zero-burst process handling

## Status

Accepted.

## Context

The specification is internally inconsistent about a process with
`burstTime === 0`:

- Requirement 1.1 declares `burstTime ∈ [1, 9999]`, and Requirement 1.5 says an
  out-of-range field rejects the **entire workload**.
- Requirement 1.3 says a zero or negative burst rejects **that process** and
  excludes it from scheduling.
- Requirement 11.1 requires a predefined scenario that *contains* a zero-burst
  process, and Requirement 11.4 says such a process "completes at its arrival
  time" and is excluded from CPU segments — i.e. it is simulated, not rejected.

11.1 and 11.4 are the most specific and testable, and a hard rejection would
make the mandated `ZERO_BURST` scenario impossible.

## Decision

- `burstTime === 0` is **valid**. The process is admitted, emits `ARRIVE` and an
  immediate `COMPLETE` at its arrival time, never occupies the CPU, produces no
  Gantt segment, and contributes `turnaroundTime = waitingTime = responseTime =
  0`.
- `burstTime < 0`, a fractional burst, or a burst above the maximum still
  rejects the whole workload (`INVALID_BURST_TIME` / `FIELD_OUT_OF_RANGE`).

This satisfies Requirements 1.2, 1.3 (the process gets no CPU time — it is
"excluded from scheduling"), 1.5, 11.1, 11.3, and 11.4 simultaneously.

## Consequences

`throughput` and `cpuUtilization` are `undefined` when every process is
zero-burst (makespan 0), matching Requirement 9.4/9.5.
