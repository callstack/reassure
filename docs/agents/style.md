# Coding Style

## File naming

- kebab-case for all source files: `measure-function.tsx`
- PascalCase only for React components

## Module structure

Prefer small modules. Each package exports through its `src/index.ts` — add new public symbols there explicitly.

## Formatter config

Oxfmt is the formatter. Keep shared whitespace, quote, and line-length settings in `.editorconfig` when possible; use `.oxfmtrc.json` only for options EditorConfig cannot express. Run `yarn lint` to enforce code formatting.
