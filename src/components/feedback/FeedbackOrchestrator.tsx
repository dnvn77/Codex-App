
"use client";

import { useFeedback } from "@/hooks/useFeedback";
import { FeedbackChoiceModal } from "./FeedbackChoiceModal";
import { FeedbackRatingModal } from "./FeedbackRatingModal";
import { useEffect } from "react";
import { useTranslations } from "@/hooks/useTranslations";

interface FeedbackOrchestratorProps {
  currentView: string;
}

export const FeedbackOrchestrator = ({ currentView }: FeedbackOrchestratorProps) => {
  const { currentFeedback, triggerFeedbackEvent } = useFeedback();
  const t = useTranslations();

  // This effect listens to view changes to trigger surveys.
  useEffect(() => {
    // Note: The logic for "first time" events should ideally be managed
    // on the backend or more robustly in localStorage to avoid re-triggering.
    // For this implementation, we'll keep it simple.
    const usageCount = parseInt(localStorage.getItem('usage_count') || '0', 10);
    const feedbackGivenCount = parseInt(localStorage.getItem('feedback_given_count') || '0', 10);

    let shouldTrigger = false;
    if (feedbackGivenCount === 0) {
      // Ask on the first 3 uses if no feedback has been given yet
      if (usageCount > 0 && usageCount <= 3) {
        // We use a unique key to ensure we only ask once per usage number (1, 2, 3)
        const key = `feedback_asked_for_usage_${usageCount}`;
        if (!localStorage.getItem(key)) {
            shouldTrigger = true;
            localStorage.setItem(key, 'true');
        }
      }
    } else {
      // After first feedback, ask every 35 uses
      // We check if the current usage count is a multiple of 35 since the last feedback
      const lastFeedbackUsage = parseInt(localStorage.getItem('last_feedback_usage_count') || '0', 10);
      if (usageCount >= lastFeedbackUsage + 35) {
        shouldTrigger = true;
      }
    }
    
    if (currentView === 'dashboard' && shouldTrigger) {
      triggerFeedbackEvent('repeated_usage_n');
    }
    
    // Check for first fund receipt
    if (currentView === 'receipt' && !localStorage.getItem('has_received_funds')) {
      triggerFeedbackEvent('funds_received_first_time');
      localStorage.setItem('has_received_funds', 'true');
    }

  }, [currentView, triggerFeedbackEvent]);


  if (!currentFeedback) {
    return null;
  }

  const { type, props } = currentFeedback;

  if (type === "choice") {
    let modalProps: any;
    const options = (t.feedback.options as any)[`${props.questionId}`];
    if(!options) return null;

    switch (props.questionId) {
        case 'seed_clarity':
            modalProps = { ...props, titleKey: 'seedClarityTitle', questionKey: 'seedClarityQuestion', options: options };
            break;
        case 'send_flow_feeling':
            modalProps = { ...props, titleKey: 'sendFlowFeelingTitle', questionKey: 'sendFlowFeelingQuestion', options: options };
            break;
        case 'receive_flow_ease':
            modalProps = { ...props, titleKey: 'receiveFlowEaseTitle', questionKey: 'receiveFlowEaseQuestion', options: options };
            break;
        default:
            return null;
    }
    return <FeedbackChoiceModal {...modalProps} />;
  }

  if (type === "rating") {
    return <FeedbackRatingModal 
        {...props} 
        title={t.feedback.overallCsatTitle} 
        question={t.feedback.overallCsatQuestion} 
    />;
  }

  return null;
};
