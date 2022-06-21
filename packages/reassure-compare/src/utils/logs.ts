export let errors: string[] = [];
export let warnings: string[] = [];

export function logError(message: string, ...args: any[]) {
  errors.push(message);
  console.error(`🛑 ${message}`, ...args);
}

export function logWarning(message: string) {
  warnings.push(message);
  console.warn(`🟡 ${message}`);
}
