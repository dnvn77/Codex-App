
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
    
    if (currentView === 'dashboard' && usageCount >= 3) {
      triggerFeedbackEvent('repeated_usage_n');
      // Prevent re-triggering in the same session for this condition.
      localStorage.setItem('usage_count', '0'); 
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
    switch (props.questionId) {
        case 'seed_clarity':
            modalProps = { ...props, titleKey: 'seedClarityTitle', questionKey: 'seedClarityQuestion', options: t.feedback.options.seedClarity };
            break;
        case 'send_flow_feeling':
            modalProps = { ...props, titleKey: 'sendFlowFeelingTitle', questionKey: 'sendFlowFeelingQuestion', options: t.feedback.options.sendFlowFeeling };
            break;
        case 'receive_flow_ease':
            modalProps = { ...props, titleKey: 'receiveFlowEaseTitle', questionKey: 'receiveFlowEaseQuestion', options: t.feedback.options.receiveFlowEase };
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
