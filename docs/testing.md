# Testing

```bash
npm run test           # all tests once
npm run test:watch     # watch mode
npm run test:coverage   # V8 coverage for src/core and src/game
```

Framework: [Vitest](https://vitest.dev) + [fast-check](https://fast-check.io)
for property-based tests, [React Testing Library](https://testing-library.com)
for components, `jsdom` environment.

## Layout

```
src/tests/
  core/        engine, schedulers, rng, scenarios, static import check
  game/        runner, controllers, scoring, leaderboard, explainer
  ui/          smoke + component tests
  helpers/     generators (fast-check arbitraries), runAll, summary
```

## Property-based tests

Each maps to a correctness property. 100 generated cases each. Tagged in the
source as `// Feature: cpu-scheduler-game, Property N: ...`.

| # | What it proves |
|---|---|
| 1 | Generated processes stay in range; `remainingBurstTime === burstTime` |
| 2 | Duplicate-PID workloads are rejected with no events |
| 3, 5, 7, 11 | `selectNext` picks the right process for FCFS / SJF / SRTF / Priority |
| 4, 13 | FCFS, SJF, non-preemptive Priority never preempt |
| 6, 8, 12 | SRTF / RR / preemptive Priority preempt under the right condition |
| 14 | Two identical runs are deeply equal |
| 15, 16 | Event times are non-decreasing and same-time order is fixed |
| 17, 18 | Every Gantt segment matches an event pair and covers its burst |
| 19, 20 | Per-process and aggregate metric formulas hold |
| 21 | `SeededRNG.nextInt` stays within `[min, max]` |
| 22, 23 | Challenge and Optimize scoring formulas |
| 24 | Leaderboard keeps the top-10 sorted invariant |
| 25 | Result survives a JSON round-trip |

## Known-answer tests

At least three per scheduler with hand-computed Gantt charts and metrics,
including the specified `SJF` average waiting time of 7 and `SRTF` average
waiting time of 6.5.

## Smoke tests

- 1000-process run completes well under 5 seconds
- all six scenarios simulate under every scheduler
- `<App />` mounts in `jsdom` with no `console.error`

## Adding a regression test

Reproduce the bug as a known-answer case in the matching
`src/tests/core/schedulers/*.known.test.ts` (or a new file), then fix the code.
