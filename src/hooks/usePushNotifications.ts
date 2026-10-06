import { useState, useEffect, useCallback } from 'react';

// Web Audio API chime generator for pleasant notification feedback
function playChime(urgent = false) {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = urgent ? 'triangle' : 'sine';
    if (urgent) {
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.25);
    } else {
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
    }

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  } catch (e) {
    console.debug('Audio chime not supported or muted', e);
  }
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false;
    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      return res === 'granted';
    } catch {
      return false;
    }
  };

  const sendPush = useCallback(
    (title: string, body: string, category: 'urgent' | 'jadwal' | 'pengumuman' | 'akademik' = 'pengumuman') => {
      // Play chime audio
      playChime(category === 'urgent');

      if (isSupported && Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body,
            icon: '/icon.svg',
            badge: '/icon.svg',
            tag: `pkbm-${Date.now()}`,
          });
        } catch (e) {
          console.debug('Native Notification failed, falling back to UI', e);
        }
      }
    },
    [isSupported]
  );

  return {
    isSupported,
    permission,
    requestPermission,
    sendPush,
  };
}
