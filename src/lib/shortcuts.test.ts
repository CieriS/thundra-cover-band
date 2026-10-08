import { describe, expect, test } from 'bun:test';
import { isBlockedShortcut, type KeyPress } from './shortcuts';

const press = (key: string, modifiers: Partial<KeyPress> = {}): KeyPress => ({
  key,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  altKey: false,
  ...modifiers,
});

describe('isBlockedShortcut', () => {
  test.each(['c', 'x', 'a', 's', 'u', 'p', 'C', 'S'])('blocks Ctrl/Cmd + %s', (key) => {
    expect(isBlockedShortcut(press(key, { ctrlKey: true }), false)).toBe(true);
    expect(isBlockedShortcut(press(key, { metaKey: true }), false)).toBe(true);
  });

  test('blocks the developer tools shortcuts', () => {
    expect(isBlockedShortcut(press('F12'), false)).toBe(true);
    expect(isBlockedShortcut(press('I', { ctrlKey: true, shiftKey: true }), false)).toBe(true);
    expect(isBlockedShortcut(press('j', { ctrlKey: true, shiftKey: true }), false)).toBe(true);
    expect(isBlockedShortcut(press('i', { metaKey: true, altKey: true }), false)).toBe(true);
  });

  test.each([
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'PageUp',
    'PageDown',
    'Home',
    'End',
    ' ',
    'Tab',
    'Enter',
    'Escape',
  ])('never blocks the navigation key %p', (key) => {
    expect(isBlockedShortcut(press(key), false)).toBe(false);
    expect(isBlockedShortcut(press(key, { shiftKey: true }), false)).toBe(false);
  });

  test.each(['+', '-', '=', '0', 'r', 'f', 'l', 't', 'w', 'ArrowLeft'])(
    'never blocks zoom, reload, find and browser navigation: Ctrl/Cmd + %s',
    (key) => {
      expect(isBlockedShortcut(press(key, { ctrlKey: true }), false)).toBe(false);
      expect(isBlockedShortcut(press(key, { metaKey: true }), false)).toBe(false);
    },
  );

  test('plain letters are never blocked', () => {
    expect(isBlockedShortcut(press('c'), false)).toBe(false);
    expect(isBlockedShortcut(press('a', { shiftKey: true }), false)).toBe(false);
  });

  test('nothing is blocked while typing in a form field', () => {
    expect(isBlockedShortcut(press('a', { ctrlKey: true }), true)).toBe(false);
    expect(isBlockedShortcut(press('c', { metaKey: true }), true)).toBe(false);
    expect(isBlockedShortcut(press('F12'), true)).toBe(false);
  });
});
