
"use client";

import { useTelegram, type ClientType } from "@/hooks/useTelegram";
import { useTheme } from "next-themes";

// Almacena el ID de sesión en sessionStorage para que persista solo durante la sesión del navegador.
let sessionId: string | null = null;
const CONSENT_STORAGE_KEY = 'user_analytics_consent';

export function getSessionId(): string {
  if (typeof window === 'undefined') {
    return 'server_side_id';
  }

  if (!sessionId) {
    sessionId = sessionStorage.getItem('anonymous_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('anonymous_session_id', sessionId);
    }
  }
  return sessionId;
}

interface EventPayload {
  [key: string]: any;
}

export function hasConsent(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(CONSENT_STORAGE_KEY) === 'true';
}

export function setConsent(consent: boolean) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CONSENT_STORAGE_KEY, String(consent));
}

export function hasMadeConsentChoice(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(CONSENT_STORAGE_KEY) !== null;
}


export async function logEvent(eventType: string, payload: EventPayload = {}) {
  if (typeof window === 'undefined' || !hasConsent()) {
    return; // No registrar eventos si no hay consentimiento o es del lado del servidor
  }
  
  const language = navigator.language;
  const theme = localStorage.getItem('theme') || 'system';
  const clientType: ClientType = (window as any).Telegram?.WebApp?.initData ? 'telegram_webapp' : 'browser';
  const deviceType = /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop';

  const eventData = {
    session_id: getSessionId(),
    event_type: eventType,
    timestamp: new Date().toISOString(),
    screen: window.location.pathname,
    device_type: clientType === 'telegram_webapp' ? 'telegram_webapp' : deviceType,
    language,
    ui_theme: theme,
    ...payload,
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('Evento registrado (con consentimiento):', eventData);
  }

  try {
    const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
    if (!endpoint) {
        console.error('Analytics endpoint is not configured.');
        return;
    }
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
      mode: 'cors'
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Failed to log event:', response.status, errorBody);
    }
  } catch (error) {
    console.error('Error logging event:', error);
  }
}
