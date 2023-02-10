import { logger } from './logger';

export let errors: string[] = [];
export let warnings: string[] = [];

export function logError(message: string, ...args: any[]) {
  errors.push(message);
  logger.error(`🛑 ${message}`, ...args);
}

export function logWarning(message: string) {
  warnings.push(message);
  logger.warn(`🟡 ${message}`);
}
