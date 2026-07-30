export type FontOption = 'Caveat' | 'Permanent Marker' | 'Dancing Script' | 'Plus Jakarta Sans' | 'Space Grotesk' | 'Fira Code';

export type TemplateTheme = 'ulearn_dark' | 'purple_gradient' | 'deep_midnight' | 'cyber_neon';

export type ControlTab = 'photo_name' | 'photo_transform' | 'filters' | 'font_style';

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  brightness: number;
  contrast: number;
  saturation: number;
  badge?: string;
  previewBg: string;
}

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'normal',
    name: 'Normal',
    description: 'Original colors & balanced contrast',
    brightness: 100,
    contrast: 100,
    saturation: 100,
    previewBg: 'bg-gradient-to-tr from-slate-400 to-indigo-500',
  },
  {
    id: 'bw',
    name: 'Monochrome B&W',
    description: 'Classic high contrast black & white',
    brightness: 105,
    contrast: 130,
    saturation: 0,
    badge: 'Popular',
    previewBg: 'bg-gradient-to-tr from-black via-zinc-600 to-white',
  },
  {
    id: 'vintage',
    name: 'Vintage Film',
    description: 'Warm retro tones with soft shadows',
    brightness: 110,
    contrast: 90,
    saturation: 75,
    previewBg: 'bg-gradient-to-tr from-amber-800 via-amber-500 to-amber-200',
  },
  {
    id: 'sepia',
    name: 'Classic Sepia',
    description: 'Nostalgic golden aged photograph',
    brightness: 105,
    contrast: 115,
    saturation: 35,
    badge: 'Classic',
    previewBg: 'bg-gradient-to-tr from-yellow-950 via-amber-700 to-amber-300',
  },
  {
    id: 'vivid',
    name: 'Vivid Pop',
    description: 'High saturation and bold punchy contrast',
    brightness: 108,
    contrast: 125,
    saturation: 165,
    badge: 'Vibrant',
    previewBg: 'bg-gradient-to-tr from-rose-500 via-purple-600 to-cyan-400',
  },
  {
    id: 'noir',
    name: 'Noir High Contrast',
    description: 'Deep moody darks with sharp highlights',
    brightness: 95,
    contrast: 150,
    saturation: 110,
    previewBg: 'bg-gradient-to-tr from-black via-neutral-800 to-neutral-200',
  },
  {
    id: 'cool',
    name: 'Cool Atmosphere',
    description: 'Subtle desaturated blue moody tint',
    brightness: 102,
    contrast: 110,
    saturation: 65,
    previewBg: 'bg-gradient-to-tr from-slate-900 via-blue-800 to-sky-300',
  },
  {
    id: 'warm_sun',
    name: 'Warm Sunlit',
    description: 'Golden radiance and gentle warmth',
    brightness: 115,
    contrast: 105,
    saturation: 125,
    previewBg: 'bg-gradient-to-tr from-amber-600 via-orange-400 to-yellow-200',
  },
  {
    id: 'soft_portrait',
    name: 'Soft Portrait',
    description: 'Gentle softened contrast for clean skin',
    brightness: 112,
    contrast: 85,
    saturation: 90,
    previewBg: 'bg-gradient-to-tr from-rose-300 via-pink-200 to-stone-100',
  },
];

export interface PosterData {
  // User Photo & Name
  photoUrl: string | null;
  userName: string;
  userSubtext: string;
  
  // Name Typography
  fontFamily: FontOption;
  textColor: string;
  fontSize: number; // in px on canvas scale
  nameOffsetY: number; // fine tuning vertical position in white space
  
  // Photo Transform & Adjustments
  photoScale: number;
  photoX: number;
  photoY: number;
  photoRotate: number;
  brightness: number; // 0 to 200 (100 = default)
  contrast: number; // 0 to 200 (100 = default)
  saturation: number; // 0 to 200 (100 = default)

  // Template Customization
  headerText: string;
  chapterName: string;
  chapterCode: string;
  bannerText1: string;
  bannerText2: string;
  calloutText: string;
  quoteText: string;
  theme: TemplateTheme;
  showPaperclip: boolean;
  showPurpleAccents: boolean;
}

export type ArchiveUploadStatus = 'pending' | 'uploaded' | 'failed';

export interface ArchivedFrame {
  id: string;
  createdAt: string;
  userName: string;
  userSubtext: string;
  chapterName: string;
  chapterCode: string;
  thumbnailUrl: string; // Local preview data URL in memory; persisted metadata uses a public URL when available
  posterData: PosterData;
  downloadCount: number;
  imageUrl?: string;
  storagePath?: string;
  uploadStatus?: ArchiveUploadStatus;
  lastUploadError?: string | null;
  syncedAt?: string;
}

export const DEFAULT_POSTER_DATA: PosterData = {
  photoUrl: null,
  userName: 'YOUR NAME HERE',
  userSubtext: 'CSE • BATCH OF 2028',
  
  fontFamily: 'Caveat',
  textColor: '#1e1b4b', // deep navy purple
  fontSize: 48,
  nameOffsetY: 0,
  
  photoScale: 1.0,
  photoX: 0,
  photoY: 0,
  photoRotate: 0,
  brightness: 100,
  contrast: 100,
  saturation: 100,

  headerText: 'WELCOME TO THE FUTURE, FRESHERS!',
  chapterName: 'μlearn',
  chapterCode: 'MBCCET',
  bannerText1: 'Kickstart Your Tech &',
  bannerText2: 'Learning Journey with μlearn MBCCET',
  calloutText: 'Join Now!',
  quoteText: '"Level Up Your Skills from Day 1!"',
  theme: 'ulearn_dark',
  showPaperclip: true,
  showPurpleAccents: true,
};
