
"use client";

import { useFeedback } from "@/hooks/useFeedback";
import { FeedbackChoiceModal } from "./FeedbackChoiceModal";
import { FeedbackRatingModal } from "./FeedbackRatingModal";

export const FeedbackOrchestrator = () => {
  const { currentFeedback } = useFeedback();

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
