
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFeedback } from "@/hooks/useFeedback";
import { X } from "lucide-react";
import React, { useState } from "react";

interface FeedbackChoiceModalProps {
  questionId: string;
  eventType: string;
  screen: string;
  title: string;
  question: string;
  options: { value: string; label: string; icon?: string }[];
}

export const FeedbackChoiceModal: React.FC<FeedbackChoiceModalProps> = ({
  questionId,
  eventType,
  screen,
  title,
  question,
  options,
}) => {
  const { submitFeedback, dismissFeedback } = useFeedback();
  const [selected, setSelected] = useState<string | null>(null);

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
          <span className="sr-only">Cerrar</span>
        </Button>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{question}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            {options.map((option) => (
              <Button
                key={option.value}
                variant={selected === option.value ? "default" : "secondary"}
                className="w-full justify-start sm:justify-center"
                onClick={() => handleSubmit(option.value)}
              >
                {option.icon && <span className="mr-2">{option.icon}</span>}
                {option.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Tu respuesta es anónima y solo se usa para mejorar la app.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
