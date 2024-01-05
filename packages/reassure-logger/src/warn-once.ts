import { warn } from './logger';

const warned = new Set<string>();

export function warnOnce(message: string, ...args: unknown[]) {
  if (warned.has(message)) {
    return;
  }

  warn(message, ...args);
  warned.add(message);
}
