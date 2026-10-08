/** Replaces `{key}` tokens in a template. Unknown tokens are left as they are, so a typo stays visible. */
export function fill(template: string, values: Readonly<Record<string, string>>): string {
  return template.replace(/\{(\w+)\}/g, (token, key: string) => values[key] ?? token);
}
