"use client";

import { useState, useEffect } from 'react';
import type { WebApp } from '@twa-dev/sdk';

export function useTelegram() {
  const [app, setApp] = useState<WebApp | null>(null);

  useEffect(() => {
    const loadTelegram = async () => {
      try {
        const Twa = await import('@twa-dev/sdk');
        if (Twa.default) {
          Twa.default.ready();
          setApp(Twa.default);
        }
      } catch (error) {
        console.error('Telegram SDK could not be loaded.', error);
      }
    };
    
    loadTelegram();
  }, []);

  return {
    isReady: !!app,
    initData: app?.initData,
    initDataUnsafe: app?.initDataUnsafe,
    user: app?.initDataUnsafe?.user,
    webApp: app,
  };
}
