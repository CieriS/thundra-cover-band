/**
 * Flyer variants: one layout, different mood. A variant only sets colours, the typeface of
 * the night's title and how the lightning background is tinted.
 */
export const VARIANT_IDS = [
  'base',
  'halloween',
  'natale',
  'capodanno',
  'epifania',
  'summer',
  'winter',
  'matrimoni',
] as const;

export type VariantId = (typeof VARIANT_IDS)[number];

/** Typefaces available to the flyers. `display` is the site's own condensed face. */
export type FlyerFont = 'display' | 'creepster' | 'christmas' | 'limelight' | 'henny' | 'pacifico' | 'script';

export interface Variant {
  /** Colour of the date and of the accents. */
  accent: string;
  /** Colour and typeface of the night's title (e.g. "Halloween Party"). */
  title: string;
  titleFont: FlyerFont;
  /** Script faces must keep their lower case; the others are set in capitals. */
  titleUppercase: boolean;
  /** Tint of the lightning background: hue rotation in degrees and saturation multiplier. */
  hue: number;
  saturation: number;
}

export const FLYER_COLOURS = {
  band: '#07080d',
  bone: '#f5f2ea',
  mute: '#aab3c8',
  volt: '#7fd4ff',
  red: '#e0241a',
  gold: '#e6b65c',
  line: '#2a3555',
} as const;

export const variants: Record<VariantId, Variant> = {
  base: { accent: FLYER_COLOURS.red, title: FLYER_COLOURS.bone, titleFont: 'display', titleUppercase: true, hue: 0, saturation: 1 },
  halloween: { accent: FLYER_COLOURS.red, title: '#ff7a1a', titleFont: 'creepster', titleUppercase: true, hue: 0, saturation: 1 },
  natale: { accent: '#e53935', title: '#f3d27a', titleFont: 'christmas', titleUppercase: false, hue: 0, saturation: 0.75 },
  capodanno: { accent: FLYER_COLOURS.gold, title: '#fff1c9', titleFont: 'limelight', titleUppercase: true, hue: 185, saturation: 0.9 },
  epifania: { accent: FLYER_COLOURS.red, title: '#c9a6ff', titleFont: 'henny', titleUppercase: false, hue: 60, saturation: 1 },
  summer: { accent: '#ff7a1a', title: '#ffd23f', titleFont: 'pacifico', titleUppercase: false, hue: 165, saturation: 1.1 },
  winter: { accent: FLYER_COLOURS.red, title: '#cfe9ff', titleFont: 'display', titleUppercase: true, hue: 0, saturation: 0.55 },
  matrimoni: { accent: FLYER_COLOURS.gold, title: '#f3e3c3', titleFont: 'script', titleUppercase: false, hue: 0, saturation: 0.2 },
};
