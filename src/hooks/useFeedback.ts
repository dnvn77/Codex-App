
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
        }}});
        break;
      case 'tx_sent_first_time':
        set({ currentFeedback: { type: 'choice', props: {
          questionId: 'send_flow_feeling',
          eventType: 'tx_sent_first_time',
          screen: 'receipt_sent',
        }}});
        break;
      case 'funds_received_first_time':
         set({ currentFeedback: { type: 'choice', props: {
            questionId: 'receive_flow_ease',
            eventType: 'funds_received_first_time',
            screen: 'receipt_received',
         }}});
         break;
      case 'repeated_usage_n':
        const usageCount = parseInt(localStorage.getItem('usage_count') || '3', 10);
        set({ currentFeedback: { type: 'rating', props: {
            questionId: 'overall_csat',
            eventType: `repeated_usage_${usageCount}`,
            screen: 'dashboard',
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
