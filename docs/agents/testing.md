# Testing Patterns

Jest is the test runner (via Turbo).

- Place unit tests next to changed code: `*.test.ts` or `*.test.tsx`
- Use `__tests__/` only in packages that already follow that convention
- Performance benchmarks in the native app use `*.perf.tsx`

Run the narrowest relevant test first, then `yarn test` or `yarn validate` before handing off.
