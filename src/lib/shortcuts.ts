/**
 * Decides which keyboard shortcuts the site swallows as a copy deterrent.
 * Pure, so the rule is tested: navigation and assistive keys must never be blocked.
 */

export interface KeyPress {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

/** With Ctrl/Cmd: copy, cut, select all, save, view source, print. */
const WITH_MODIFIER = new Set(['c', 'x', 'a', 's', 'u', 'p']);
/** With Ctrl/Cmd + Shift (or Cmd + Alt on macOS): developer tools. */
const DEV_TOOLS = new Set(['i', 'j', 'c']);

/**
 * True when the key press should be cancelled.
 * Never blocked: Tab, Enter, Space, Escape, arrows, Page Up/Down, Home/End (scrolling and
 * keyboard navigation), zoom (Ctrl/Cmd with +, - or 0), reload, back/forward, find.
 * Inside a form field nothing is blocked: people must be able to edit what they type.
 */
export function isBlockedShortcut(press: KeyPress, inEditableField: boolean): boolean {
  if (inEditableField) return false;
  const key = press.key.toLowerCase();
  if (key === 'f12') return true;
  const modifier = press.ctrlKey || press.metaKey;
  if (!modifier) return false;
  if ((press.shiftKey || press.altKey) && DEV_TOOLS.has(key)) return true;
  return !press.shiftKey && !press.altKey && WITH_MODIFIER.has(key);
}
