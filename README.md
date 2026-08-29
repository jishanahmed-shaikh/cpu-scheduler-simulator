# CPU Scheduler Game

An offline, deterministic CPU-scheduling simulator and learning game. A pure
TypeScript discrete-event engine implements FCFS, SJF, SRTF, Round Robin, and
Priority scheduling; a React interface visualises the CPU, ready queue, Gantt
chart, and metrics in real time. Three game modes — Learn, Challenge, and
Optimize — sit on top of the same engine.

Everything runs locally. No AI, no external APIs, no network calls after
`npm install`.

## Demo

<!-- Screenshot / GIF placeholder: add docs/media/overview.png -->
Run it locally with the quick start below.

## Features

- Deterministic discrete-event simulation — same workload + config ⇒ same result
- Five scheduling algorithms, preemptive and non-preemptive variants
- Live Gantt chart (virtualised past 200 segments), ready-queue and CPU views
- Per-process and aggregate metrics derived only from the engine event log
- Learn mode: step through every scheduling decision with an explanation
- Challenge mode: predict the next process; timed + streak scoring; leaderboard
- Optimize mode: pick the algorithm that minimises a target metric
- Seeded workload generation and six predefined edge-case scenarios
- Keyboard-navigable, screen-reader labelled, reduced-motion aware

## Supported algorithms

| Algorithm | Preemptive | Selection key | Tie-break |
|---|---|---|---|
| FCFS | no | earliest arrival | lowest PID |
| SJF | no | smallest burst time | arrival, then PID |
| SRTF | yes | smallest remaining time | arrival, then PID |
| Round Robin | yes | FIFO order, fixed quantum | queue order |
| Priority | optional | lowest priority number | arrival, then PID |

## Architecture overview

Three concentric layers, each independently testable:

```
src/core/   pure engine — models, schedulers, simulation loop, metrics, RNG
src/game/   pure controllers — runner, Learn/Challenge/Optimize, leaderboard
src/ui/     React 18 — components that only read engine-derived state
```

`src/core/` never imports React, the DOM, `localStorage`, or `Math.random`
(enforced by a static test). See [docs/architecture.md](docs/architecture.md).

## Quick start

```bash
git clone https://github.com/jishanahmed-shaikh/cpu-scheduler-simulator.git
cd cpu-scheduler-simulator

docker compose up --build
```

Open <http://localhost:8080>.

## Manual development

Requires Node.js 22+.

```bash
npm install
npm run dev        # Vite dev server on http://localhost:5173
```

## Docker development

```bash
docker compose up --build                       # production build on :8080
docker compose --profile dev up --build         # hot-reload dev on :5173
```

More detail in [docs/docker.md](docs/docker.md).

## Production build

```bash
npm run build      # type-checks then emits static assets to dist/
npm run preview    # serve dist/ on http://localhost:4173
```

## Deployment

The build is a static SPA — any static host works. `vercel.json` is included
for a one-click Vercel deploy with a custom domain. See
[docs/deployment.md](docs/deployment.md).

## Testing

```bash
npm run test           # unit + property-based tests (Vitest + fast-check)
npm run test:coverage  # with V8 coverage for core/ and game/
npm run validate       # typecheck + lint + test + file-length + build
```

92 tests, including 17 property-based tests (100 generated cases each) that
verify determinism, event ordering, Gantt/burst coverage, metric formulas,
and the scoring/leaderboard invariants. See [docs/testing.md](docs/testing.md).

## Project structure

```
src/
  core/        models/ schedulers/ engine/ rng/ scenarios/
  game/        SimulationRunner, mode controllers, LeaderboardService
  ui/          context/ hooks/ components/ styles/
  tests/       core/ game/ ui/ helpers/
docs/          architecture, simulation, scheduling-algorithms, testing, docker
scripts/       check-file-lengths.mjs
```

## Scheduling metrics

| Metric | Definition |
|---|---|
| Waiting time | turnaround − burst |
| Turnaround time | completion − arrival |
| Response time | first CPU time − arrival |
| Throughput | processes / makespan |
| CPU utilisation | busy time / makespan (0–1) |
| Context switches | START events whose PID differs from the previous |
| Makespan | last completion − first arrival |

## Determinism

The engine advances time to the next event (arrival, completion, quantum
expiry, preemption) rather than ticking. Same-time events are ordered
`ARRIVE < COMPLETE < PREEMPT < IDLE_START`, then by ascending PID. Workload
generation uses a seeded Mulberry32 PRNG. Given the same workload, scheduler,
and configuration, every run produces identical events, Gantt segments, and
metrics.

## Development conventions

- No manually authored code file exceeds 169 lines (`npm run check:filesize`)
- Core scheduling logic stays independent of the UI
- Tests are required for scheduling behaviour and metrics
- Conventional commits; milestones are pushed only after `npm run validate`

## License

MIT. See [LICENSE](LICENSE).
