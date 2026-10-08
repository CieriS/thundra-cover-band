/**
 * Image manifest: every image that is not owned by a content collection is
 * registered here, together with the placeholders used as fallbacks when a
 * collection entry has no photo yet. No external URLs, ever.
 */
import type { ImageMetadata } from 'astro';
import band from '@/assets/demo/band.jpg';
import booking from '@/assets/demo/booking.jpg';
import gallery1 from '@/assets/demo/gallery-1.jpg';
import gallery2 from '@/assets/demo/gallery-2.jpg';
import gallery3 from '@/assets/demo/gallery-3.jpg';
import gallery4 from '@/assets/demo/gallery-4.jpg';
import gallery5 from '@/assets/demo/gallery-5.jpg';
import gallery6 from '@/assets/demo/gallery-6.jpg';
import heroDesktop from '@/assets/demo/hero-desktop.jpg';
import heroMobile from '@/assets/demo/hero-mobile.jpg';
import member1 from '@/assets/placeholders/member-1.jpg';
import member2 from '@/assets/placeholders/member-2.jpg';
import member3 from '@/assets/placeholders/member-3.jpg';
import member4 from '@/assets/placeholders/member-4.jpg';
import member5 from '@/assets/placeholders/member-5.jpg';
import social1 from '@/assets/demo/social-1.jpg';
import social2 from '@/assets/demo/social-2.jpg';
import social3 from '@/assets/demo/social-3.jpg';
import social4 from '@/assets/demo/social-4.jpg';
import videoPoster from '@/assets/demo/video-poster.jpg';

export interface SiteImage {
  src: ImageMetadata;
  alt: string;
  /** True while the file is a generated placeholder waiting for a real photo. */
  placeholder: boolean;
}

/**
 * The band logo is used only from src/assets/brand/ and is never redrawn.
 * Drop `logo.svg` (or .png/.webp/.avif) there and it is picked up on the next build;
 * until then the band name is shown as plain text.
 */
const logoFiles = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/brand/logo.{svg,png,webp,avif,jpg}',
  { eager: true },
);
export const logo: ImageMetadata | null = Object.values(logoFiles)[0]?.default ?? null;

// [DEMO] On this branch the images are stock photos (src/assets/demo/CREDITS.md), shown as if
// they were final: no "placeholder" tag. They do not portray the band and must be replaced.
const placeholder = (src: ImageMetadata, alt: string): SiteImage => ({
  src,
  alt,
  placeholder: false,
});

export const images = {
  hero: {
    mobile: placeholder(heroMobile, 'Mani alzate sotto il palco tra fumo e luci rosse'), // [DA COMPILARE] foto 9:16
    desktop: placeholder(heroDesktop, 'Chitarristi in controluce sul palco, tra luci calde e fumo'), // [DA COMPILARE] foto 16:9
  },
  band: placeholder(band, 'La band sul palco di un club, luci rosse e blu, pubblico in primo piano'), // [DA COMPILARE] foto di gruppo 3:2
  booking: placeholder(booking, 'Sala piena di pubblico davanti al palco'), // [DA COMPILARE] foto 3:2
  social: [
    placeholder(social1, 'Foto dal profilo social di Thundra'), // [DA COMPILARE] 4 foto 1:1
    placeholder(social2, 'Foto dal profilo social di Thundra'),
    placeholder(social3, 'Foto dal profilo social di Thundra'),
    placeholder(social4, 'Foto dal profilo social di Thundra'),
  ],
} as const;

/** Fallbacks for collection entries that have no image yet. */
export const fallbacks = {
  member: [member1, member2, member3, member4, member5],
  gallery: [gallery1, gallery2, gallery3, gallery4, gallery5, gallery6],
  videoPoster,
} as const;

/** Picks a fallback deterministically so the same entry always gets the same file. */
export function pickFallback(list: readonly ImageMetadata[], index: number): ImageMetadata {
  const image = list[index % list.length];
  if (!image) throw new Error('Empty fallback image list');
  return image;
}
