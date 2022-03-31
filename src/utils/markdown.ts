export function expandableSection(title: string, content: string) {
  return `
    <details>
      <summary>${title}</summery>

      ${content}
    </details>

  `;
}
