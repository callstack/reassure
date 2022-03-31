export function expandableSection(title: string, content: string) {
  return `<details>\n<summary>${title}</summery>\n\n${content}\n</details>\n\n`;
}
