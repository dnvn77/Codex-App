
"use client";

import { useState, useEffect } from 'react';
import { AppContainer } from '@/components/AppContainer';
import { ConnectView } from '@/components/views/ConnectView';
import type { Wallet, StoredWallet } from '@/lib/types';
import { getStoredWallet } from '@/lib/wallet';
import { SidebarProvider, Sidebar, SidebarContent, SidebarInset } from '@/components/ui/sidebar';
import { MainNav } from '@/components/views/MainNav';
import { WalletView } from '@/components/views/WalletView';
import { SettingsView } from '@/components/views/SettingsView';
import { ChatView } from '@/components/views/ChatView';

export default function Home() {
  const [activeView, setActiveView] = useState<'wallet' | 'chat' | 'settings'>('wallet');
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [storedWalletInfo, setStoredWalletInfo] = useState<StoredWallet | null>(null);

  useEffect(() => {
    // Access localStorage only on the client side
    setStoredWalletInfo(getStoredWallet());
  }, []);


  const handleWalletConnected = (newWallet: Wallet) => {
    setWallet(newWallet);
    setStoredWalletInfo(getStoredWallet());
  };

  const handleDisconnect = () => {
    setWallet(null);
    setStoredWalletInfo(null);
    // You might want to also call clearStoredWallet() here
  }

  if (!storedWalletInfo) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center p-4">
        <ConnectView onWalletConnected={handleWalletConnected} />
      </main>
    );
  }
  
  if (!wallet) {
    // This assumes you'll have a lock screen component that can unlock the wallet
    // For now, we'll show the AppContainer which should handle the lock view
    return (
        <main className="flex min-h-[100dvh] flex-col items-center justify-center p-4">
          <AppContainer />
        </main>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
            <MainNav activeView={activeView} setActiveView={setActiveView} />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 md:p-6">
            {activeView === 'wallet' && <WalletView wallet={wallet} onDisconnect={handleDisconnect} />}
            {activeView === 'chat' && <ChatView />}
            {activeView === 'settings' && <SettingsView />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
