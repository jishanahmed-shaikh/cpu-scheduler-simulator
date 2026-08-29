# Architecture

The application is three concentric layers. Each inner layer is usable and
testable without the layers outside it.

```
┌─ src/ui  (React 18) ─────────────────────────────┐
│  components read RunnerState, call controllers   │
│  ┌─ src/game  (pure TypeScript) ───────────────┐ │
│  │  SimulationRunner, Learn/Challenge/Optimize │ │
│  │  controllers, LeaderboardService, scoring   │ │
│  │  ┌─ src/core  (pure, no browser/RNG) ─────┐ │ │
│  │  │  Process model, Scheduler interface +  │ │ │
│  │  │  5 implementations, SimulationEngine,  │ │ │
│  │  │  MetricsCalculator, SeededRNG,         │ │ │
│  │  │  scenarios, workload generator         │ │ │
│  │  └───────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

## Core (`src/core/`)

- **models/** — `Process`, `SimulationEvent`, `GanttSegment`, result types.
- **schedulers/** — `Scheduler` interface (`selectNext`, `shouldPreempt`, plus
  optional `onDispatch` / `onRelease` / `reset` lifecycle hooks used by Round
  Robin). One file per algorithm.
- **engine/** — `validateWorkload`, `simulationLoop` (the discrete-event loop),
  `SimulationEngine` (validation + loop + metrics), `MetricsCalculator`,
  `MinHeapEventQueue`, `serialize`.
- **rng/** — Mulberry32 `SeededRNG`.
- **scenarios/** — six predefined scenarios and a seeded workload generator.

`src/core/` imports nothing from React, the DOM, `localStorage`, or
`Math.random`. `src/tests/core/staticImportCheck.test.ts` fails the build if
that ever changes.

## Game (`src/game/`)

- **SimulationRunner** — owns a cursor over the precomputed event log and a
  cached `RunnerState` snapshot. Exposes `play/pause/step/reset/seekTo/setSpeed`
  and a `stateChange` subscription. `runnerState.deriveState` replays
  `events[0..index]` to rebuild the CPU / ready queue / Gantt / partial metrics.
- **LearnModeController / ChallengeModeController / OptimizeModeController** —
  stateful controllers that consume core types and expose plain getters.
- **LeaderboardService** — top-10 per `algorithm:mode` key, `localStorage` with
  an in-memory fallback.
- **scoring.ts** — the Challenge and Optimize scoring formulas as pure
  functions.

## UI (`src/ui/`)

- **context/** — `SimulationProvider` holds stable controller instances and the
  `processes` / `choice` / `activeMode` state; `SelectedEventProvider` tracks
  the inspected event.
- **hooks/** — `useRunnerState` (a `useSyncExternalStore` bridge to the
  runner), `useKeyboardShortcuts`.
- **components/** — one responsibility each; none exceeds 169 lines. Business
  logic lives in the game/core layers.

## Data flow

1. The UI edits `processes` or the scheduler `choice`.
2. `SimulationProvider` calls `runner.load({ processes, scheduler })`, which
   runs the full simulation once and resets the cursor.
3. Playback / stepping advances the cursor; the runner recomputes its snapshot
   and notifies subscribers.
4. Components re-render from the new snapshot. The Gantt chart and metrics are
   always a pure function of the engine's output — never fabricated.
