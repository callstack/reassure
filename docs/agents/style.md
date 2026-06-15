# Coding Style

## File naming

- kebab-case for all source files: `measure-function.tsx`
- PascalCase only for React components

## Module structure

Prefer small modules. Each package exports through its `src/index.ts` — add new public symbols there explicitly.

## Prettier config

Single quotes, trailing commas (ES5), `printWidth: 120`. Run `yarn lint` to enforce.
