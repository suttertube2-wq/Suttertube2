
export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';

export interface VideoItem {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  platform: 'youtube' | 'facebook' | 'tiktok' | 'other';
  duration: string;
  timestamp: number;
  status: 'completed' | 'downloading' | 'failed';
  progress?: number;
  isPrivate?: boolean;
}

export interface Translation {
  title: string;
  subtitle: string;
  placeholder: string;
  downloadBtn: string;
  history: string;
  settings: string;
  noHistory: string;
  langName: string;
  themeName: string;
  copied: string;
  adTitle: string;
  errorUrl: string;
}
