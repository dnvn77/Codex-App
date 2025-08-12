
"use client";

import type { ClientType } from "@/hooks/useTelegram";
import { supabase } from '@/lib/supabase';


const SESSION_ID_KEY = "feedback_session_id";
const SESSION_ASKED_KEY = "feedback_session_asked";

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
    // Para depuración, podemos permitir preguntar siempre.
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
    
    // --- Validaciones Frontend ---
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(fullPayload.session_id)) {
        console.error("Feedback Error: Invalid session_id format.");
        return;
    }
    if (fullPayload.response_choice === undefined && fullPayload.rating === undefined) {
        console.error("Feedback Error: Either 'response_choice' or 'rating' must be provided.");
        return;
    }
    const payloadString = JSON.stringify(fullPayload);
    if (new Blob([payloadString]).size > 2048) {
        console.error("Feedback Error: Payload exceeds 2KB limit.");
        return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Feedback event sent to Supabase:', fullPayload);
    }

    try {
      const { error } = await supabase.from('feedback_events').insert([fullPayload]);
      if (error) {
        console.error('Error logging feedback to Supabase:', error);
      }
    } catch (error) {
      console.error('Failed to log feedback:', error);
    } finally {
        feedbackClient.markSessionAsAsked();
        screenTimeStart = Date.now();
    }
  },
};

feedbackClient.ensureSessionId();

export { feedbackClient };
