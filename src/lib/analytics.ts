
"use client";

import type { ClientType } from "@/hooks/useTelegram";

// Almacena el ID de sesión en sessionStorage para que persista solo durante la sesión del navegador.
let sessionId: string | null = null;
const CONSENT_STORAGE_KEY = 'user_analytics_consent';

// Determina la URL base de la API. En desarrollo, podría ser localhost.
// Asegúrate de que tu emulador de functions esté corriendo o usa la URL de producción.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';


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
    if (!hasConsent()) console.log('Analytics consent not given. Skipping event logging.');
    return;
  }
  
  const language = navigator.language;
  const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const clientType: ClientType = (window as any).Telegram?.WebApp?.initData ? 'telegram_webapp' : 'browser';
  const deviceType = /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop';

  const eventData = {
    session_id: getSessionId(),
    event_type: eventType,
    client_timestamp: new Date().toISOString(),
    screen: window.location.pathname,
    device_type: clientType === 'telegram_webapp' ? 'telegram_webapp' : deviceType,
    language,
    ui_theme: theme,
    ...payload,
  };

  // Log the event being sent for debugging purposes
  console.log('Logging analytic event via API:', eventData);

  try {
    const response = await fetch(`${API_BASE_URL}/events/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error('API Error logging event:', errorBody);
    } else {
        console.log('Analytics event successfully queued via API.');
    }
  } catch (error) {
    console.error('FATAL: Exception during analytics API call:', error);
  }
}
