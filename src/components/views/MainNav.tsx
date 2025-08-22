
"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { Button } from "@/components/ui/button";
import { MessageSquare, Wallet, Settings, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface MainNavProps {
  activeView: 'profile' | 'chats' | 'wallet' | 'settings' | 'contacts';
  setActiveView: (view: 'profile' | 'chats' | 'wallet' | 'settings' | 'contacts') => void;
}

export function MainNav({ activeView, setActiveView }: MainNavProps) {
  const t = useTranslations();

  const navItems = [
    { view: 'profile', icon: User, label: t.profile },
    { view: 'chats', icon: MessageSquare, label: t.chat },
    { view: 'wallet', icon: Wallet, label: t.wallet },
    { view: 'settings', icon: Settings, label: t.settings },
    { view: 'contacts', icon: Users, label: t.contacts },
  ] as const;

  return (
    <footer className="sticky bottom-0 z-10 w-full border-t bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-center">
        <div className="flex items-center gap-1 rounded-full bg-secondary p-1">
          {navItems.map((item) => (
            <Button
              key={item.view}
              variant="ghost"
              size="sm"
              className={cn(
                "h-auto rounded-full px-3 md:px-3 py-1.5 text-xs font-normal transition-colors",
                activeView === item.view
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "text-muted-foreground hover:bg-secondary-foreground/10"
              )}
              onClick={() => setActiveView(item.view)}
            >
              <item.icon className="h-4 w-4 md:mr-1.5" />
              <span className="hidden md:inline">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </footer>
  );
}
