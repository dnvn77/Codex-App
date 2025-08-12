
"use client";

import { create } from 'zustand';
import { feedbackClient, type FeedbackPayload } from '@/lib/feedback';

interface FeedbackState {
  currentFeedback: { type: 'choice' | 'rating'; props: any } | null;
  triggerFeedbackEvent: (eventName: string, props?: any) => void;
  submitFeedback: (payload: Omit<FeedbackPayload, 'session_id' | 'client_timestamp' | 'screen_time_seconds' | 'ui_theme' | 'language' | 'device_type'>) => void;
  dismissFeedback: () => void;
}

const useFeedbackStore = create<FeedbackState>((set, get) => ({
  currentFeedback: null,
  triggerFeedbackEvent: (eventName, props = {}) => {
    // Only trigger if no other feedback is active and we should ask this session
    if (get().currentFeedback || !feedbackClient.shouldAskThisSession()) {
      return;
    }
    
    switch (eventName) {
      case 'seed_confirmed':
        set({ currentFeedback: { type: 'choice', props: {
          questionId: 'seed_clarity',
          eventType: 'seed_confirmed',
          screen: 'seed_confirm_done',
          title: "🔐 One last step",
          question: "You just confirmed your security phrase. Was this step clear?",
          options: [
            { value: 'muy_claro', label: 'Yes, very clear' },
            { value: 'entendi_pero_dificil', label: 'I understood, but it was difficult' },
            { value: 'no_entendi_bien', label: 'I did not understand it well' },
          ],
        }}});
        break;
      case 'tx_sent_first_time':
        set({ currentFeedback: { type: 'choice', props: {
          questionId: 'send_flow_feeling',
          eventType: 'tx_sent_first_time',
          screen: 'receipt_sent',
          title: "💸 Your transaction is on its way!",
          question: "How did you feel about the sending process?",
          options: [
            { value: 'claro_confiado', label: 'Clear and confident' },
            { value: 'dude_en_algunos_pasos', label: 'I had doubts on some steps' },
            { value: 'confuso', label: 'It was confusing' },
          ],
        }}});
        break;
      case 'funds_received_first_time':
         set({ currentFeedback: { type: 'choice', props: {
            questionId: 'receive_flow_ease',
            eventType: 'funds_received_first_time',
            screen: 'receipt_received',
            title: "🎉 You received your first transfer!",
            question: "How easy was it to receive it?",
            options: [
                { value: 'super_facil', label: 'Super easy' },
                { value: 'bien_mejorable', label: 'Good, but could be better' },
                { value: 'dificil', label: 'It was difficult' },
            ],
         }}});
         break;
      case 'repeated_usage_n':
        set({ currentFeedback: { type: 'rating', props: {
            questionId: 'overall_csat',
            eventType: `repeated_usage_${localStorage.getItem('usage_count') || 3}`,
            screen: 'dashboard',
            title: "🍓 You've used Violet Vault a few times.",
            question: "How would you rate your overall experience?",
        }}});
        break;
    }
  },
  submitFeedback: (payload) => {
    feedbackClient.logFeedback(payload);
    set({ currentFeedback: null });
  },
  dismissFeedback: () => {
    feedbackClient.markSessionAsAsked();
    set({ currentFeedback: null });
  },
}));

export const useFeedback = useFeedbackStore;
