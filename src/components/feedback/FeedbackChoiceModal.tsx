
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFeedback } from "@/hooks/useFeedback";
import { X } from "lucide-react";
import React, { useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";

interface FeedbackChoiceModalProps {
  questionId: string;
  eventType: string;
  screen: string;
  titleKey: string;
  questionKey: string;
  options: { value: string; labelKey: string; icon?: string }[];
}

export const FeedbackChoiceModal: React.FC<FeedbackChoiceModalProps> = ({
  questionId,
  eventType,
  screen,
  titleKey,
  questionKey,
  options,
}) => {
  const { submitFeedback, dismissFeedback } = useFeedback();
  const [selected, setSelected] = useState<string | null>(null);
  const t = useTranslations();

  const handleSubmit = (choice: string) => {
    setSelected(choice);
    setTimeout(() => {
      submitFeedback({
        question_id: questionId,
        event_type: eventType,
        screen: screen,
        response_choice: choice,
      });
    }, 300); // Short delay for visual feedback
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-12 duration-500">
      <Card className="max-w-xl mx-auto shadow-2xl relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7"
          onClick={dismissFeedback}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">{t.closeButtonLabel}</span>
        </Button>
        <CardHeader>
          <CardTitle className="text-lg">{(t.feedback as any)[titleKey]}</CardTitle>
          <CardDescription>{(t.feedback as any)[questionKey]}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            {options.map((option) => (
              <Button
                key={option.value}
                variant={selected === option.value ? "default" : "secondary"}
                className="w-full justify-center flex-1"
                onClick={() => handleSubmit(option.value)}
              >
                {option.icon && <span className="mr-2">{option.icon}</span>}
                {(t.feedback.options as any)[option.labelKey]}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            {t.feedback.anonymousDisclaimer}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

    