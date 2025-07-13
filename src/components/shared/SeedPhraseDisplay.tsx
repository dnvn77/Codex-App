"use client";

import { Check, Clipboard, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { useState } from 'react';

interface SeedPhraseDisplayProps {
  seedPhrase: string;
}

export function SeedPhraseDisplay({ seedPhrase }: SeedPhraseDisplayProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const words = seedPhrase.split(' ');

  const handleCopy = () => {
    navigator.clipboard.writeText(seedPhrase);
    setCopied(true);
    toast({
      title: "Copied to clipboard!",
      description: "Your seed phrase has been copied.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="text-destructive" />
          Your Secret Phrase
        </CardTitle>
        <CardDescription>
          Write this down and store it somewhere safe. This is the only time you will see it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 rounded-lg border bg-secondary/30 p-4 mb-4">
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-accent"
            aria-label="Copy seed phrase"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
          </button>
          {words.map((word, index) => (
            <div key={index} className="flex items-center gap-2">
              <Badge variant="outline" className="text-muted-foreground w-6 h-6 flex-shrink-0 justify-center">{index + 1}</Badge>
              <span className="font-medium">{word}</span>
            </div>
          ))}
        </div>
        <div className="text-xs text-destructive p-3 bg-destructive/10 rounded-lg">
          <strong>NEVER</strong> share this phrase with anyone. Anyone with this phrase can take your assets forever.
        </div>
      </CardContent>
    </Card>
  );
}
