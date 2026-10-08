/**
 * Copy deterrent: no image dragging, no context menu on images, no copy/save
 * shortcuts. It discourages casual copying, it cannot prevent it.
 * Text selection is switched off in CSS (global.css, "Copy deterrent").
 * Keyboard navigation, scrolling keys, zoom and form fields are never touched.
 */
import { isBlockedShortcut } from '@/lib/shortcuts';

const EDITABLE = 'input, textarea, select, [contenteditable="true"]';
const isImage = (target: EventTarget | null) =>
  target instanceof Element && target.closest('img, picture, video, svg') !== null;

export function initProtection() {
  document.addEventListener('dragstart', (event) => {
    if (isImage(event.target)) event.preventDefault();
  });
  document.addEventListener('contextmenu', (event) => {
    if (isImage(event.target)) event.preventDefault();
  });
  document.addEventListener('copy', (event) => {
    if (!(event.target instanceof Element && event.target.closest(EDITABLE))) event.preventDefault();
  });
  document.addEventListener('keydown', (event) => {
    const inField = event.target instanceof Element && event.target.closest(EDITABLE) !== null;
    if (isBlockedShortcut(event, inField)) event.preventDefault();
  });
}
