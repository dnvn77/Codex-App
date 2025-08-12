
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFeedback } from "@/hooks/useFeedback";
import { Star, X } from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface FeedbackRatingModalProps {
  questionId: string;
  eventType: string;
  screen: string;
  title: string;
  question: string;
}

export const FeedbackRatingModal: React.FC<FeedbackRatingModalProps> = ({
  questionId,
  eventType,
  screen,
  title,
  question,
}) => {
  const { submitFeedback, dismissFeedback } = useFeedback();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = () => {
    if (rating > 0) {
      submitFeedback({
        question_id: questionId,
        event_type: eventType,
        screen: screen,
        rating: rating,
      });
    }
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
          <div className="flex justify-center items-center gap-2 my-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "h-8 w-8 cursor-pointer transition-colors",
                  (hoverRating || rating) >= star
                    ? "text-primary fill-current"
                    : "text-muted-foreground"
                )}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              />
            ))}
          </div>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={rating === 0}
          >
            Enviar Calificación
          </Button>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Tu respuesta es anónima y solo se usa para mejorar la app.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
