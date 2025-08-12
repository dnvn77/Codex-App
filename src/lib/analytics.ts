
"use client";

import { useTelegram, type ClientType } from "@/hooks/useTelegram";
import { useTheme } from "next-themes";

// Almacena el ID de sesión en sessionStorage para que persista solo durante la sesión del navegador.
let sessionId: string | null = null;

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

export async function logEvent(eventType: string, payload: EventPayload = {}) {
  if (typeof window === 'undefined') {
    return; // No registrar eventos en el lado del servidor
  }
  
  // No uses hooks directamente aquí, obtén los valores de otra manera si es necesario o pásalos como parámetros.
  // Para este caso, podemos obtener los valores necesarios sin hooks.
  const language = navigator.language;
  const theme = localStorage.getItem('theme') || 'system'; // Obtiene el tema de ShadCN
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
    console.log('Evento registrado:', eventData);
  }

  try {
    // La URL debe apuntar a tu backend de Firebase Functions.
    // Asegúrate de que esta URL sea la correcta para tu entorno.
    const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || 'http://127.0.0.1:5001/violet-vault-dev/us-central1/api/log-event';
    
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
