export function header1(text: string) {
  return `# ${text}`;
}

export function header2(text: string) {
  return `## ${text}`;
}

export function header3(text: string) {
  return `### ${text}`;
}

export function bold(text: string) {
  return `**${text}**`;
}

export function italic(text: string) {
  return `*${text}*`;
}
