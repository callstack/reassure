export const command = 'measure';
export const describe = 'runs performance tests to gather measurements';

export function handler(argv: any) {
  console.log('Running measure command', argv);
}
