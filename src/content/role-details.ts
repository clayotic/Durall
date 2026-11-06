/**
 * A role's details as typed in the admin panel, one item per line:
 *
 *   Required Qualifications:     a line ending in ":" is a heading
 *   - Bachelor of Architecture   a line starting "- " is a list item
 *   anything else                a paragraph
 *
 * Read into blocks the page renders as elements, never as HTML.
 */
export type RoleBlock =
  { kind: "heading" | "paragraph"; text: string } | { kind: "list"; items: string[] };

export function roleDetails(text: string): RoleBlock[] {
  const blocks: RoleBlock[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const item = /^[-•]\s+(.*)$/.exec(line)?.[1];
    const last = blocks.at(-1);
    if (item !== undefined) {
      if (last?.kind === "list") last.items.push(item);
      else blocks.push({ kind: "list", items: [item] });
    } else {
      blocks.push({ kind: line.endsWith(":") ? "heading" : "paragraph", text: line });
    }
  }
  return blocks;
}
