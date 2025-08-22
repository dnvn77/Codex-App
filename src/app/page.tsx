
"use client";

import { useState, useEffect } from 'react';
import { MainNav } from '@/components/views/MainNav';
import { WalletView } from '@/components/views/WalletView';
import { SettingsView } from '@/components/views/SettingsView';
import { ChatView } from '@/components/views/ChatView';
import { ProfileView } from '@/components/views/ProfileView';
import { ContactsView } from '@/components/views/ContactsView';
import type { Wallet, StoredWallet } from '@/lib/types';
import { getStoredWallet, unlockWallet, clearStoredWallet } from '@/lib/wallet';
import { ConnectView } from '@/components/views/ConnectView';
import { LockView } from '@/components/views/LockView';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [activeView, setActiveView] = useState<'profile' | 'chats' | 'wallet' | 'settings' | 'contacts'>('wallet');
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [storedWalletInfo, setStoredWalletInfo] = useState<StoredWallet | null>(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // This now correctly runs only on the client
    const stored = getStoredWallet();
    setStoredWalletInfo(stored);
    
    // Check if this is the very first time (no wallet stored)
    // This helps decide the initial state without causing hydration issues
    if (!stored) {
        // This is a new user, so any subsequent wallet connection will be a "first login"
        sessionStorage.setItem('isNewUser', 'true');
    }
  }, []);

  const handleLoginComplete = (newWallet: Wallet) => {
    setWallet(newWallet);
    setStoredWalletInfo(getStoredWallet());
    
    const isNew = sessionStorage.getItem('isNewUser');
    if (isNew) {
        setIsFirstLogin(true);
        setActiveView('profile'); // Switch to profile to show the edit modal
        sessionStorage.removeItem('isNewUser');
    }
  };
  
  const handleWalletUnlocked = async (password: string) => {
    try {
        const unlockedWallet = await unlockWallet(password);
        if(unlockedWallet) {
            setWallet(unlockedWallet);
        } else {
            toast({
                title: "Unlock Failed",
                description: "Could not unlock wallet.",
                variant: "destructive"
            });
        }
    } catch (error) {
        toast({
            title: "Unlock Failed",
            description: (error as Error).message,
            variant: "destructive"
        });
    }
  }

  const handleDisconnect = () => {
    clearStoredWallet();
    setWallet(null);
    setStoredWalletInfo(null);
    setIsFirstLogin(false);
    sessionStorage.setItem('isNewUser', 'true');
  }
  
  const handleProfileSaved = () => {
    setIsFirstLogin(false);
  }

  if (!storedWalletInfo) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center p-4">
        <ConnectView onLoginComplete={handleLoginComplete} />
      </main>
    );
  }
  
  if (!wallet) {
    return (
         <main className="flex min-h-[100dvh] flex-col items-center justify-center p-4">
            <LockView 
                storedWallet={storedWalletInfo}
                onWalletUnlocked={handleWalletUnlocked}
                onDisconnect={handleDisconnect}
            />
        </main>
    )
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 md:p-6 mb-16">
        {activeView === 'profile' && <ProfileView wallet={wallet} showEditOnLoad={isFirstLogin} onProfileSaved={handleProfileSaved} />}
        {activeView === 'chats' && <ChatView wallet={wallet}/>}
        {activeView === 'wallet' && <WalletView wallet={wallet} onDisconnect={handleDisconnect}/>}
        {activeView === 'settings' && <SettingsView />}
        {activeView === 'contacts' && <ContactsView />}
      </main>
      <MainNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  )
}
