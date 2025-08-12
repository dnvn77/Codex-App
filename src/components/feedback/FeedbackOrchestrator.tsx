
"use client";

import { useFeedback } from "@/hooks/useFeedback";
import { FeedbackChoiceModal } from "./FeedbackChoiceModal";
import { FeedbackRatingModal } from "./FeedbackRatingModal";
import { useEffect } from "react";
import { getStoredWallet } from "@/lib/wallet";

interface FeedbackOrchestratorProps {
  currentView: string;
}

export const FeedbackOrchestrator = ({ currentView }: FeedbackOrchestratorProps) => {
  const { currentFeedback, triggerFeedbackEvent } = useFeedback();

  // This effect listens to view changes to trigger surveys.
  useEffect(() => {
    // Note: The logic for "first time" events should ideally be managed
    // on the backend or more robustly in localStorage to avoid re-triggering.
    // For this implementation, we'll keep it simple.

    // This is a placeholder for tracking usage count.
    // In a real app, you'd increment this on certain actions.
    const usageCount = parseInt(localStorage.getItem('usage_count') || '0');

    if (currentView === 'dashboard' && usageCount >= 3) {
      triggerFeedbackEvent('repeated_usage_n');
      // Prevent re-triggering in the same session for this condition.
      localStorage.setItem('usage_count', '0'); 
    }
  }, [currentView, triggerFeedbackEvent]);


  if (!currentFeedback) {
    return null;
  }

  const { type, props } = currentFeedback;

  if (type === "choice") {
    return <FeedbackChoiceModal {...props} />;
  }

  if (type === "rating") {
    return <FeedbackRatingModal {...props} />;
  }

  return null;
};
