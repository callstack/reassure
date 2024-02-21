export function heading1(text: string) {
  return `# ${text}\n`;
}

export function heading2(text: string) {
  return `## ${text}\n`;
}

export function heading3(text: string) {
  return `### ${text}\n`;
}

export function bold(text: string) {
  return `**${text}**`;
}

export function italic(text: string) {
  return `*${text}*`;
}
