export const command = 'test';
export const describe =
  'runs complete performance testing cycle: measure baseline & current performance, then compare results';

export function handler(argv: any) {
  console.log('Running test command', argv);
}
