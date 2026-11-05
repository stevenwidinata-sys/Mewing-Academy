import { useEffect } from 'react';
import { useSettings } from '../state/settings';
import { music } from './music';

/** Starts/stops the chiptune when the setting changes. Browsers only allow
 *  audio after a user gesture, so it waits for the first click or key. */
export function useMusic() {
  const { settings } = useSettings();
  useEffect(() => {
    if (!settings.music) {
      music.stop();
      return;
    }
    const begin = () => music.start(settings.musicVolume);
    begin();
    window.addEventListener('pointerdown', begin, { once: true });
    window.addEventListener('keydown', begin, { once: true });
    return () => {
      window.removeEventListener('pointerdown', begin);
      window.removeEventListener('keydown', begin);
    };
  }, [settings.music, settings.musicVolume]);
  useEffect(() => music.stop, []);
}
