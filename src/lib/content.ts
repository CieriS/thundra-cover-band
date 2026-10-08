/** Adapter over the content collections: loads, sorts and splits entries at build time. */
import { getCollection, type CollectionEntry } from 'astro:content';
import { site } from '@/config/site';
import { dayInTimeZone } from './dates';
import { nextEvent, splitEvents } from './events';

export type EventEntry = CollectionEntry<'events'>;

const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;

/** Build-time "today" in the band's time zone: the past/upcoming split depends on it. */
export function today(): string {
  return dayInTimeZone(new Date(), site.timeZone);
}

/** Every date except the private ones: those get a flyer but no page and no listing. */
export async function getPublicEvents() {
  return (await getCollection('events')).filter((event) => !event.data.private);
}

export async function getEvents() {
  const { upcoming, past } = splitEvents(await getPublicEvents(), today());
  return { upcoming, past, next: nextEvent(upcoming) };
}

export async function getMembers() {
  return (await getCollection('members')).sort(byOrder);
}

export async function getGallery() {
  return (await getCollection('gallery')).sort(byOrder);
}

export async function getVideos() {
  return (await getCollection('videos')).sort(byOrder);
}

export async function getSetlist() {
  const [setlist] = await getCollection('setlist');
  return setlist;
}

export async function getReviews() {
  return (await getCollection('reviews')).sort(byOrder);
}
