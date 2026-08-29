# Development guide

## Prerequisites

- Node.js 22+ and npm 10+
- Docker (optional, for the container workflows)

## Setup

```bash
npm install
npm run dev
```

Vite serves the app on <http://localhost:5173> with hot module reload.

## Everyday commands

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | type-check + production build to `dist/` |
| `npm run preview` | serve the production build on `:4173` |
| `npm run test` | run all tests once |
| `npm run test:watch` | tests in watch mode |
| `npm run typecheck` | `tsc -b --noEmit` |
| `npm run lint` | ESLint, zero warnings allowed |
| `npm run check:filesize` | fail if any code file exceeds 169 lines |
| `npm run validate` | typecheck + lint + test + filesize + build |

## Conventions

- **169-line limit** on every manually authored code file (`.ts`, `.tsx`,
  `.css`, `.mjs`). Split by responsibility when a file approaches it.
- **Core stays pure.** No React, DOM, `localStorage`, or `Math.random` under
  `src/core/`. The static import test enforces this.
- **Engine-derived data only.** UI components render `RunnerState`; they never
  compute schedule or metric values themselves.
- **Conventional commits.** Run `npm run validate` before a milestone commit
  and push only green milestones.
- **Tests with behaviour.** Any change to scheduling or metrics ships with a
  test; every fixed bug gets a regression test.

## Where things live

- New algorithm → `src/core/schedulers/`, register in `arbScheduler`,
  `allSchedulers`, and `createScheduler`, add known-answer + property tests.
- New metric → `src/core/engine/MetricsCalculator.ts` and its property test.
- New scenario → `src/core/scenarios/PredefinedScenarios.ts`.
- New panel → `src/ui/components/`, wire into `src/ui/App.tsx`.

## Decisions

Design decisions that deviate from or interpret the specification are recorded
in [docs/decisions/](decisions/).
