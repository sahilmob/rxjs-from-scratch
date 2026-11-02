# RxJS from scratch

An AI-assisted learning project exploring how observables, subscriptions, and operators work beneath the RxJS API. This is a partial implementation, not a replacement for RxJS.

## Implemented so far

- Observable and Subscriber primitives, subscription teardown, and typed pipe composition.
- Creation functions and operators for transforming, combining, and flattening streams.
- Subjects and a Vitest suite for the exercises.

The code is in [my_rxjs](my_rxjs). The `rxjs` submodule is upstream reference material, not my implementation.

## Not finished

`mergeMap` explicitly throws an unimplemented error; its exercise tests are skipped. Other skipped tests and runtime issues remain. API coverage is incomplete, and passing tests do not establish RxJS compatibility.

## Run

From the repository root, with Node.js and npm installed:

```bash
npm ci
npm test
npm run test:watch
```
