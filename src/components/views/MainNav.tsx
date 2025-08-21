
"use client";

import { useTranslations } from "@/hooks/useTranslations";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { MessageSquare, Wallet, Settings } from "lucide-react";

interface MainNavProps {
  activeView: 'wallet' | 'chat' | 'settings';
  setActiveView: (view: 'wallet' | 'chat' | 'settings') => void;
}

export function MainNav({ activeView, setActiveView }: MainNavProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-col">
      <SidebarHeader>
        {/* Can add a logo here if needed */}
      </SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={activeView === 'chat'}
            onClick={() => setActiveView('chat')}
            tooltip={t.chat}
          >
            <MessageSquare />
            <span>{t.chat}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={activeView === 'wallet'}
            onClick={() => setActiveView('wallet')}
            tooltip={t.wallet}
          >
            <Wallet />
            <span>{t.wallet}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={activeView === 'settings'}
            onClick={() => setActiveView('settings')}
            tooltip={t.settings}
          >
            <Settings />
            <span>{t.settings}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  )
}
