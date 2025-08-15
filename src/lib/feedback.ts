
"use client";

import type { ClientType } from "@/hooks/useTelegram";
import { getSupabase } from "./supabase";

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

    if (payload.question_id === 'overall_csat') {
        const feedbackGivenCount = parseInt(localStorage.getItem('feedback_given_count') || '0', 10);
        const newCount = feedbackGivenCount + 1;
        localStorage.setItem('feedback_given_count', String(newCount));
        
        const usageCount = localStorage.getItem('usage_count') || '0';
        localStorage.setItem('last_feedback_usage_count', usageCount);
        feedbackClient.markSessionAsAsked();
    }


    const sessionId = feedbackClient.ensureSessionId();
    const screenTimeSeconds = Math.round((Date.now() - screenTimeStart) / 1000);
    
    const fullPayload: Omit<FeedbackPayload, 'id' | 'server_received_at'> = {
      ...payload,
      session_id: sessionId,
      screen_time_seconds: screenTimeSeconds,
      ui_theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      language: navigator.language,
      device_type: (window as any).Telegram?.WebApp?.initData ? 'telegram_webapp' : /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      client_timestamp: new Date().toISOString(),
    };
    
    console.log('Logging feedback to Supabase:', fullPayload);
    
    const supabase = getSupabase();
    const { error } = await supabase.from('feedback_events').insert(fullPayload);

    if (error) {
      console.error('Supabase feedback insert error:', error);
    } else {
        console.log('Feedback event successfully logged to Supabase.');
        if (payload.question_id !== 'overall_csat') {
            feedbackClient.markSessionAsAsked();
        }
        screenTimeStart = Date.now(); // Reset timer after successful feedback
    }
  },
};

feedbackClient.ensureSessionId();

export { feedbackClient };
