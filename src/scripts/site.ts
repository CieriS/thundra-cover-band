/**
 * The whole client-side script of the site. Everything here is progressive
 * enhancement: with JavaScript off the pages stay fully usable.
 */
import { bookingMessage, italianDate } from '@/lib/contact';
import { countdown } from '@/lib/dates';
import { initProtection } from './protect';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const $$ = <T extends Element>(selector: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(selector));

/**
 * Reveal on scroll: one shared observer; each element is unobserved as soon as
 * it has been revealed.
 */
function initReveal() {
  const targets = $$<HTMLElement>('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    targets.forEach((target) => target.classList.add('is-in'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px', threshold: 0.05 },
  );
  targets.forEach((target) => observer.observe(target));
}

/** Full-screen menu on a native <dialog>: focus trap and Esc come for free. */
function initMenu() {
  const dialog = document.querySelector<HTMLDialogElement>('[data-menu]');
  const opener = document.querySelector<HTMLElement>('[data-menu-open]');
  if (!dialog || !opener || typeof dialog.showModal !== 'function') return;

  opener.setAttribute('role', 'button');
  opener.setAttribute('aria-expanded', 'false');
  opener.addEventListener('click', (event) => {
    event.preventDefault();
    dialog.showModal();
    opener.setAttribute('aria-expanded', 'true');
  });
  opener.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
      event.preventDefault();
      opener.click();
    }
  });
  dialog.addEventListener('close', () => opener.setAttribute('aria-expanded', 'false'));
  dialog.querySelector('[data-menu-close]')?.addEventListener('click', () => dialog.close());
  // In-page links must close the menu before the browser scrolls to the target.
  $$('[data-menu-link]', dialog).forEach((link) => link.addEventListener('click', () => dialog.close()));
}

/** Swaps a countdown value, animating the outgoing and incoming digits. */
function setDigits(holder: HTMLElement, value: string) {
  const current = holder.querySelector<HTMLElement>('.digit');
  if (!current || current.textContent === value) return;
  if (reduceMotion.matches || typeof current.animate !== 'function') {
    current.textContent = value;
    return;
  }
  const next = current.cloneNode() as HTMLElement;
  next.textContent = value;
  next.style.position = 'absolute';
  next.style.inset = '0';
  holder.append(next);
  const options: KeyframeAnimationOptions = { duration: 420, easing: 'cubic-bezier(0.2, 0.9, 0.2, 1)' };
  current.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(-100%)', opacity: 0 }], options);
  next.animate([{ transform: 'translateY(100%)', opacity: 0 }, { transform: 'none', opacity: 1 }], options).finished.then(
    () => {
      current.textContent = value;
      next.remove();
    },
    () => next.remove(),
  );
}

function initCountdown() {
  for (const root of $$<HTMLElement>('[data-countdown]')) {
    const target = new Date(root.dataset['target'] ?? '');
    if (Number.isNaN(target.getTime())) continue;
    const done = root.parentElement?.querySelector<HTMLElement>('[data-countdown-done]');

    const tick = () => {
      const left = countdown(target, new Date());
      if (left.done && done) {
        root.hidden = true;
        done.hidden = false;
        return false;
      }
      for (const holder of $$<HTMLElement>('[data-unit]', root)) {
        const value = left[holder.dataset['unit'] as 'days' | 'hours' | 'minutes'];
        setDigits(holder, String(value).padStart(2, '0'));
        const label = holder.parentElement?.querySelector<HTMLElement>('[data-label]');
        if (label) label.textContent = (value === 1 ? label.dataset['one'] : label.dataset['many']) ?? '';
      }
      return true;
    };

    if (!tick()) continue;
    // Align to the minute boundary, then tick once a minute.
    const timer = window.setTimeout(
      () => {
        tick();
        const interval = window.setInterval(() => !tick() && window.clearInterval(interval), 60_000);
      },
      60_000 - (Date.now() % 60_000),
    );
    window.addEventListener('pagehide', () => window.clearTimeout(timer), { once: true });
  }
}

/** Replaces a video facade with the youtube-nocookie player, only on request. */
function initVideos() {
  for (const trigger of $$<HTMLAnchorElement>('[data-video-embed]')) {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const frame = document.createElement('iframe');
      frame.src = trigger.dataset['videoEmbed'] ?? '';
      frame.title = trigger.dataset['videoTitle'] ?? 'Video';
      frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      frame.allowFullscreen = true;
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      trigger.replaceWith(frame);
      frame.focus();
    });
  }
}

/** Gallery lightbox on a native <dialog>: focus trap, Esc, arrow keys, swipe-free. */
function initLightbox() {
  const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox-dialog]');
  const links = $$<HTMLAnchorElement>('[data-lightbox]');
  const image = dialog?.querySelector<HTMLImageElement>('[data-lightbox-image]');
  if (!dialog || !image || links.length === 0 || typeof dialog.showModal !== 'function') return;

  const caption = dialog.querySelector<HTMLElement>('[data-lightbox-caption]');
  const count = dialog.querySelector<HTMLElement>('[data-lightbox-count]');
  let index = 0;

  const show = (next: number) => {
    index = (next + links.length) % links.length;
    const link = links[index];
    if (!link) return;
    image.src = link.href;
    image.alt = link.dataset['alt'] ?? '';
    if (caption) caption.textContent = link.dataset['caption'] ?? '';
    if (count) count.textContent = `${index + 1} / ${links.length}`;
  };

  links.forEach((link, position) =>
    link.addEventListener('click', (event) => {
      // Let modified clicks open the image in a new tab as usual.
      if (event.metaKey || event.ctrlKey || event.shiftKey) return;
      event.preventDefault();
      show(position);
      dialog.showModal();
    }),
  );
  dialog.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => show(index - 1));
  dialog.querySelector('[data-lightbox-next]')?.addEventListener('click', () => show(index + 1));
  dialog.querySelector('[data-lightbox-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(index - 1);
    if (event.key === 'ArrowRight') show(index + 1);
  });
  // Back to the thumbnail that opened it.
  dialog.addEventListener('close', () => links[index]?.focus());
}

/** Rebuilds the WhatsApp message from the booking fields right before submit. */
function initBookingForm() {
  for (const form of $$<HTMLFormElement>('[data-booking-form]')) {
    const text = form.querySelector<HTMLInputElement>('[data-booking-text]');
    if (!text) continue;
    form.addEventListener('submit', () => {
      const value = (name: string) =>
        form.querySelector<HTMLInputElement>(`[data-booking-field="${name}"]`)?.value ?? '';
      text.value = bookingMessage({
        venue: value('venue'),
        city: value('city'),
        date: italianDate(value('date')),
        contact: value('contact'),
      });
    });
  }
}

/** The marquee is pure CSS; on a fine pointer it slows down while hovered. */
function initMarquee() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  for (const marquee of $$<HTMLElement>('[data-marquee]')) {
    const setRate = (rate: number) =>
      marquee.getAnimations({ subtree: true }).forEach((animation) => animation.updatePlaybackRate(rate));
    marquee.addEventListener('pointerenter', () => setRate(0.3));
    marquee.addEventListener('pointerleave', () => setRate(1));
  }
}

/**
 * Optional hero background loop. Sources are attached only when motion is
 * allowed and the connection is neither slow nor in data-saver mode; otherwise
 * the poster image underneath is all that loads.
 */
function initHeroVideo() {
  const video = document.querySelector<HTMLVideoElement>('[data-hero-video]');
  if (!video || reduceMotion.matches) return;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
    .connection;
  if (connection?.saveData || /(^|-)(2g|3g)$/.test(connection?.effectiveType ?? '')) return;

  const variant = window.matchMedia('(min-width: 48rem)').matches ? 'desktop' : 'mobile';
  for (const format of ['webm', 'mp4'] as const) {
    const src = video.dataset[`${variant}${format === 'webm' ? 'Webm' : 'Mp4'}`];
    if (!src) continue;
    const source = document.createElement('source');
    source.src = src;
    source.type = `video/${format}`;
    video.append(source);
  }
  video.muted = true;
  video.addEventListener('canplay', () => video.classList.add('is-ready'), { once: true });
  video.load();
  video.play().catch(() => undefined);
}

(window as Window & { __siteReady?: boolean }).__siteReady = true;
initProtection();
initReveal();
initMenu();
initCountdown();
initVideos();
initLightbox();
initBookingForm();
initMarquee();
initHeroVideo();
