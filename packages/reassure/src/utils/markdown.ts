export function collapsibleSection(title: string, content: string) {
  return `<details>\n<summary>${title}</summary>\n\n${content}\n</details>\n\n`;
}
