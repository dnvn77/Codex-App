
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTranslations } from "@/hooks/useTranslations";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface SettingsViewProps {
  onDisconnect: () => void;
}

export function SettingsView({ onDisconnect }: SettingsViewProps) {
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
       <Card>
        <CardHeader>
          <CardTitle>{t.account.title}</CardTitle>
          <CardDescription>
            {t.account.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                <LogOut className="mr-2 h-4 w-4" />
                {t.account.logoutButton}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t.account.logoutConfirmTitle}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t.account.logoutConfirmDescription}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t.cancelButton}</AlertDialogCancel>
                <AlertDialogAction onClick={onDisconnect} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {t.account.logoutButton}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
