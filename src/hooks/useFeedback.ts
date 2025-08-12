
"use client";

import { create } from 'zustand';
import { feedbackClient, type FeedbackPayload } from '@/lib/feedback';

interface FeedbackState {
  currentFeedback: { type: 'choice' | 'rating'; props: any } | null;
  triggerFeedback: (type: 'choice' | 'rating', props: any) => void;
  submitFeedback: (payload: Omit<FeedbackPayload, 'session_id' | 'client_timestamp' | 'screen_time_seconds' | 'ui_theme' | 'language' | 'device_type'>) => void;
  dismissFeedback: () => void;
}

const useFeedbackStore = create<FeedbackState>((set) => ({
  currentFeedback: null,
  triggerFeedback: (type, props) => {
    if (feedbackClient.shouldAskThisSession()) {
      set({ currentFeedback: { type, props } });
    }
  },
  submitFeedback: (payload) => {
    feedbackClient.logFeedback(payload);
    set({ currentFeedback: null });
  },
  dismissFeedback: () => {
    // We still log a "dismissed" event to know the user saw it
    // but we don't send the full payload. This is optional.
    set({ currentFeedback: null });
  },
}));

// Custom hook to be used in components
export const useFeedback = () => {
  const state = useFeedbackStore();
  
  // Expose a function to easily trigger events from anywhere
  const triggerFeedbackEvent = (eventName: string, props = {}) => {
    switch (eventName) {
      case 'seed_confirmed':
        state.triggerFeedback('choice', {
          questionId: 'seed_clarity',
          eventType: 'seed_confirmed',
          screen: 'seed_confirm_done',
          title: "🔐 Un último paso",
          question: "¿Fue claro el proceso para confirmar tu frase de seguridad?",
          options: [
            { value: 'muy_claro', label: 'Sí, muy claro' },
            { value: 'entendi_pero_dificil', label: 'Entendí, pero fue difícil' },
            { value: 'no_entendi_bien', label: 'No lo entendí bien' },
          ],
        });
        break;
      case 'tx_sent_first_time':
        state.triggerFeedback('choice', {
          questionId: 'send_flow_feeling',
          eventType: 'tx_sent_first_time',
          screen: 'receipt_sent',
          title: "💸 ¡Envío en camino!",
          question: "¿Cómo te sentiste con el proceso de envío?",
          options: [
            { value: 'claro_confiado', label: 'Claro y confiado' },
            { value: 'dude_en_algunos_pasos', label: 'Dudé en algunos pasos' },
            { value: 'confuso', label: 'Fue confuso' },
          ],
        });
        break;
      // Add other events here
    }
  };

  return { ...state, triggerFeedbackEvent };
};
