import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang } from '../../../shared/types';
import { t, type StringKey } from '../i18n/strings';

export type Theme = 'arcade';
export type FingerMode = 'point' | 'count';
export type TextSize = 'normal' | 'large' | 'xlarge';

export interface Settings {
  lang: Lang;
  highContrast: boolean;
  reduceMotion: boolean;
  readableFont: boolean;
  textSize: TextSize;
  sound: boolean;
  fingerMode: FingerMode;
}

const DEFAULTS: Settings = {
  lang: 'en',
  highContrast: false,
  reduceMotion: false,
  readableFont: false,
  textSize: 'normal',
  sound: true,
  fingerMode: 'point',
};

const KEY = 'mewing.settings.v1';

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    /* ignore corrupt storage */
  }
  // Respect the OS "reduce motion" preference on first visit.
  const prefersReduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  return { ...DEFAULTS, reduceMotion: prefersReduced };
}

interface Ctx {
  settings: Settings;
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  tr: (key: StringKey) => string;
}

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(load);

  const set = useCallback<Ctx['set']>((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(settings));
    const root = document.documentElement;
    root.lang = settings.lang;
    root.dataset.contrast = settings.highContrast ? 'high' : 'normal';
    root.dataset.motion = settings.reduceMotion ? 'reduced' : 'full';
    root.dataset.font = settings.readableFont ? 'readable' : 'pixel';
    root.dataset.textSize = settings.textSize;
  }, [settings]);

  const tr = useCallback((key: StringKey) => t(key, settings.lang), [settings.lang]);

  const value = useMemo<Ctx>(() => ({ settings, set, tr }), [settings, set, tr]);
  return <SettingsContext value={value}>{children}</SettingsContext>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): Ctx {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
