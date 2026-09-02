export const FESTIVE_THEME_IDS = [
  'none',
  'diwali',
  'newyear',
  'holi',
  'christmas',
  'eid',
  'independence',
  'valentine',
] as const;

export type FestiveThemeId = (typeof FESTIVE_THEME_IDS)[number];

export interface FestiveThemeMeta {
  id: FestiveThemeId;
  name: string;
  description: string;
  season: string;
}

export const FESTIVE_THEMES: FestiveThemeMeta[] = [
  {
    id: 'none',
    name: 'Default',
    description: 'No festive overlay — brand colors only',
    season: 'Year-round',
  },
  {
    id: 'diwali',
    name: 'Diwali',
    description: 'Diyas, sparks, and a warm festive glow',
    season: 'Oct–Nov · India',
  },
  {
    id: 'newyear',
    name: 'New Year',
    description: 'Confetti bursts and celebration sparkles',
    season: '31 Dec – 1 Jan',
  },
  {
    id: 'holi',
    name: 'Holi',
    description: 'Color powder bursts across the page',
    season: 'Mar · India',
  },
  {
    id: 'christmas',
    name: 'Christmas',
    description: 'Gentle falling snowflakes',
    season: 'December',
  },
  {
    id: 'eid',
    name: 'Eid',
    description: 'Crescent moons and starlight',
    season: 'Lunar calendar',
  },
  {
    id: 'independence',
    name: 'Independence Day',
    description: 'Tricolor ribbons for 15 August',
    season: '15 Aug · India',
  },
  {
    id: 'valentine',
    name: 'Valentine’s Day',
    description: 'Floating hearts',
    season: '14 February',
  },
];

export function isFestiveThemeId(value: string): value is FestiveThemeId {
  return (FESTIVE_THEME_IDS as readonly string[]).includes(value);
}
