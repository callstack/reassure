# Repository Guidelines

Reassure is a performance testing toolkit for React and React Native, structured as a Yarn 4/Turbo monorepo.

**Use Yarn, not npm.**

## Key commands

- `yarn validate` — lint + typecheck + tests (run before handing off any change)
- `yarn build` — build all packages
- `yarn test` — run package Jest suites
- `yarn test:test-app` — run the native test app Jest suite
- `yarn typecheck` — TypeScript checks only
- `cd test-apps/native && yarn reassure` — run performance benchmarks

## Agent scope rules

- Edit only `src/`, tests, and `docusaurus/`. Never modify generated `lib/` unless doing a release task.
- When behavior changes, update source, tests, and docs together.
- Preserve existing package patterns; keep edits scoped to the relevant package.

## Further reading

- [Project structure](docs/agents/structure.md)
- [Coding style](docs/agents/style.md)
- [Testing patterns](docs/agents/testing.md)
- [Git & PR workflow](docs/agents/git-workflow.md)
