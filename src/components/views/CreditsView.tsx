
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Star } from 'lucide-react';

interface CreditsViewProps {
  onBack: () => void;
}

const CreditItem = ({ label, value }: { label: string, value: string | number }) => (
    <div className="flex items-center justify-between py-3 border-b border-border/50">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-lg">{value}</span>
    </div>
);

export function CreditsView({ onBack }: CreditsViewProps) {
  // Mock data for demonstration
  const creditsConsumed = 1250;
  const creditsRemaining = 8750;
  const planName = "Plan Básico";

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="text-center">
        <Star className="mx-auto h-12 w-12 text-primary" />
        <CardTitle className="mt-2">Uso de Créditos</CardTitle>
        <CardDescription>Aquí puedes ver los créditos que has consumido hasta ahora.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
            <CreditItem label="Créditos Consumidos" value={creditsConsumed} />
            <CreditItem label="Créditos Restantes" value={creditsRemaining} />
            <CreditItem label="Plan Actual" value={planName} />
        </div>
        <div className="mt-6 text-center">
            <Button variant="link">Administrar Suscripción</Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="secondary" className="w-full" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Panel
        </Button>
      </CardFooter>
    </Card>
  );
}
