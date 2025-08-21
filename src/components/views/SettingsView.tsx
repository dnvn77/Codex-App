
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTranslations } from "@/hooks/useTranslations";


export function SettingsView() {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t.settings}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t.appearance}</CardTitle>
          <CardDescription>
            {t.themeDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="theme-toggle" className="text-base">
              {t.theme}
            </Label>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
