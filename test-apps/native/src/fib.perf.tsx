import {
  measureFunction,
  measureAsyncFunction,
} from '@callstack/reassure-measure';

function fib(n: number): number {
  if (n <= 1) {
    return n;
  }

  return fib(n - 1) + fib(n - 2);
}

jest.setTimeout(60_000);

describe('`fib` function', () => {
  test('fib(30)', async () => {
    await measureFunction(() => fib(30));
  });

  test('fib(30) async', async () => {
    await measureAsyncFunction(async () =>
      Promise.resolve().then(() => fib(30)),
    );
  });

  test('fib(31)', async () => {
    await measureFunction(() => fib(31));
  });

  test('fib(31) async', async () => {
    await measureAsyncFunction(async () =>
      Promise.resolve().then(() => fib(31)),
    );
  });

  test('fib(32)', async () => {
    await measureFunction(() => fib(32));
  });

  test('fib(32) async', async () => {
    await measureAsyncFunction(async () =>
      Promise.resolve().then(() => fib(32)),
    );
  });
});
