
"use client";

import { useState, useEffect } from 'react';
import type { WebApp } from '@twa-dev/sdk';

export type ClientType = 'telegram_webapp' | 'browser';

export function useTelegram() {
  const [app, setApp] = useState<WebApp | null>(null);
  const [clientType, setClientType] = useState<ClientType>('browser');

  useEffect(() => {
    const loadTelegram = async () => {
      try {
        const Twa = await import('@twa-dev/sdk');
        if (Twa.default && Twa.default.initData) {
          Twa.default.ready();
          setApp(Twa.default);
          setClientType('telegram_webapp');
        } else {
          setClientType('browser');
        }
      } catch (error) {
        console.error('Telegram SDK could not be loaded.', error);
        setClientType('browser');
      }
    };
    
    loadTelegram();
  }, []);

  return {
    isReady: !!app || clientType === 'browser',
    initData: app?.initData,
    initDataUnsafe: app?.initDataUnsafe,
    user: app?.initDataUnsafe?.user,
    webApp: app,
    clientType,
  };
}
