# Project Structure

Reassure is a Yarn 4/Turbo monorepo. Packages live in `packages/*`:

- `packages/reassure` — public entry package and CLI shim
- `packages/measure` — render/function measurement APIs
- `packages/compare` — result comparison and reporting utilities
- `packages/cli` — command implementation for `reassure`
- `packages/logger` — shared logging
- `packages/danger` — Danger integration

Each package keeps source in `src/` and builds to `lib/`. Tests are colocated as `*.test.ts` / `*.test.tsx`, or under `__tests__/` where that package already uses that convention.

Documentation lives in `docusaurus/`. The React Native validation app is in `test-apps/native/`, including `.perf.tsx` benchmark examples.
