
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { setConsent, logEvent } from "@/lib/analytics";

interface ConsentBannerProps {
  onChoiceMade: () => void;
}

export function ConsentBanner({ onChoiceMade }: ConsentBannerProps) {
  
  const handleConsent = (consent: boolean) => {
    setConsent(consent);
    logEvent('analytics_consent_given', { consent });
    onChoiceMade();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-xl mx-auto shadow-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Tu Privacidad es Importante</CardTitle>
          <CardDescription>
            Utilizamos análisis anónimos para ayudarnos a mejorar tu experiencia en la aplicación. No recopilamos información personal. ¿Estás de acuerdo?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button className="w-full" onClick={() => handleConsent(true)}>Aceptar</Button>
            <Button className="w-full" variant="secondary" onClick={() => handleConsent(false)}>Rechazar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
