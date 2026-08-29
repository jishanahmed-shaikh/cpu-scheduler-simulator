# Deployment

The app is a static single-page build (`npm run build` → `dist/`). It needs no
server runtime, environment variables, or network access, so any static host
works.

## Vercel (current setup)

Live at <https://cpu-scheduler.jishanahmed.in>.

`vercel.json` pins the Vite framework preset, the build command, long-lived
cache headers for `/assets/*`, an SPA fallback rewrite, and basic security
headers.

1. Vercel dashboard → **Add New → Project** → import this repository.
2. Framework preset **Vite** is auto-detected (build `npm run build`, output
   `dist`). Deploy.
3. Project **Settings → Domains** → add `cpu-scheduler.jishanahmed.in`.
   Because `jishanahmed.in` uses Vercel nameservers, the DNS record and TLS
   certificate are created automatically — no registrar changes needed. On a
   registrar-managed zone you would instead add
   `CNAME  cpu-scheduler  →  cname.vercel-dns.com`.

Every push to `main` triggers a fresh production deploy. Pull requests get
preview deployments.

## Any other static host

Cloudflare Pages, Netlify, GitHub Pages, S3 + CloudFront, or the bundled nginx
image (`docker compose up --build`) all serve `dist/` unchanged. If the app is
hosted under a sub-path rather than a domain root, set
`base: '/that/path/'` in `vite.config.ts` before building.

## SPA fallback

The app has no client-side router, so a fallback is optional. `vercel.json`
still rewrites unknown paths to `index.html` so a mistyped deep link shows the
app instead of a raw 404. The nginx config does the same via `try_files`.
