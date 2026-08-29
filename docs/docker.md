# Docker

## Production-style run

```bash
docker compose up --build
```

- Builds the multi-stage `Dockerfile` (`deps` → `build` → `nginx` runtime).
- Serves the static `dist/` bundle from nginx on <http://localhost:8080>.
- Includes a `HEALTHCHECK` that curls `/`.

## Hot-reload development

```bash
docker compose --profile dev up --build
```

- Uses `Dockerfile.dev` (Vite dev server, port 5173).
- Bind-mounts `./src` and `./index.html` for live reload.

## Images directly

```bash
docker build --target runtime -t cpu-scheduler-game .
docker run --rm -p 8080:80 cpu-scheduler-game
```

## Notes

- `.dockerignore` keeps `node_modules`, `dist`, `coverage`, and `.git` out of
  the build context.
- No environment variables are required. `.env.example` documents that.
- Docker is optional — `npm run dev` / `npm run build` work without it.
