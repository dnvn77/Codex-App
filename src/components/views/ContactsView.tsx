
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useTranslations } from "@/hooks/useTranslations";
import { Users } from "lucide-react";

export function ContactsView() {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t.contacts}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This is where your contacts will be displayed.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-muted-foreground">
          <Users className="h-16 w-16" />
        </CardContent>
      </Card>
    </div>
  )
}
