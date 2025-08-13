
"use client";

import type { ClientType } from "@/hooks/useTelegram";

const SESSION_ID_KEY = "feedback_session_id";
const SESSION_ASKED_KEY = "feedback_session_asked";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';


// Este tipo debe coincidir con el esquema de Zod en el backend
export interface FeedbackPayload {
  session_id: string;
  event_type: string;
  screen: string;
  question_id: string;
  response_choice?: string;
  rating?: number;
  screen_time_seconds: number;
  ui_theme: string;
  language: string;
  device_type: ClientType | 'desktop' | 'mobile';
  client_timestamp: string;
}

let screenTimeStart = Date.now();

const feedbackClient = {
  ensureSessionId: (): string => {
    if (typeof window === 'undefined') return 'server-session';
    let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  },

  shouldAskThisSession: (): boolean => {
    if (typeof window === 'undefined') return false;
    if (process.env.NODE_ENV === 'development') return true;
    const asked = sessionStorage.getItem(SESSION_ASKED_KEY);
    return asked !== 'true';
  },

  markSessionAsAsked: () => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(SESSION_ASKED_KEY, 'true');
  },

  logFeedback: async (payload: Omit<FeedbackPayload, 'session_id' | 'client_timestamp' | 'screen_time_seconds' | 'ui_theme' | 'language' | 'device_type'>) => {
    if (typeof window === 'undefined') return;

    const sessionId = feedbackClient.ensureSessionId();
    const screenTimeSeconds = Math.round((Date.now() - screenTimeStart) / 1000);
    
    const fullPayload: FeedbackPayload = {
      ...payload,
      session_id: sessionId,
      screen_time_seconds: screenTimeSeconds,
      ui_theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      language: navigator.language,
      device_type: (window as any).Telegram?.WebApp?.initData ? 'telegram_webapp' : /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      client_timestamp: new Date().toISOString(),
    };
    
    // Log the event being sent for debugging purposes
    console.log('Logging feedback via API:', fullPayload);

    try {
      const response = await fetch(`${API_BASE_URL}/feedback/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullPayload),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        console.error('API Error logging feedback:', errorBody);
      } else {
        console.log('Feedback event successfully queued via API.');
        feedbackClient.markSessionAsAsked();
        screenTimeStart = Date.now();
      }
    } catch (error) {
      console.error('FATAL: Exception during feedback API call:', error);
    }
  },
};

feedbackClient.ensureSessionId();

export { feedbackClient };
