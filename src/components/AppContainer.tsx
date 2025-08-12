
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ConnectView } from '@/components/views/ConnectView';
import { DashboardView } from '@/components/views/DashboardView';
import { ReceiptView } from '@/components/views/ReceiptView';
import { LockView } from '@/components/views/LockView';
import { CreditsView } from '@/components/views/CreditsView';
import { Loader2, Send, Twitter, Mail } from 'lucide-react';
import type { Wallet, StoredWallet, Transaction } from '@/lib/types';
import { useTelegram } from '@/hooks/useTelegram';
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';
import { getStoredWallet, clearStoredWallet, unlockWallet } from '@/lib/wallet';
import { Button } from './ui/button';
import { logEvent, hasMadeConsentChoice } from '@/lib/analytics';
import { ConsentBanner } from './shared/ConsentBanner';
import { FeedbackOrchestrator } from './feedback/FeedbackOrchestrator';

type View = 'connect' | 'dashboard' | 'receipt' | 'lock' | 'credits';
type Status = 'validating' | 'ready' | 'error';

const AppFooter = () => (
  <footer className="w-full max-w-md mx-auto text-center py-4 mt-4 border-t border-border/50">
    <p className="text-sm text-muted-foreground mb-2">Need help? Contact us.</p>
    <div className="flex justify-center items-center gap-4">
      <Button variant="ghost" size="icon" asChild>
        <a href="https://t.me/your_telegram_contact" target="_blank" rel="noopener noreferrer">
          <Send />
        </a>
      </Button>
      <Button variant="ghost" size="icon" asChild>
        <a href="https://x.com/your_x_contact" target="_blank" rel="noopener noreferrer">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </a>
      </Button>
      <Button variant="ghost" size="icon" asChild>
        <a href="mailto:contact@yourdomain.com">
          <Mail />
        </a>
      </Button>
    </div>
  </footer>
);


export function AppContainer() {
  const [view, setView] = useState<View>('connect');
  const [status, setStatus] = useState<Status>('validating');
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [storedWalletInfo, setStoredWalletInfo] = useState<StoredWallet | null>(null);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [showConsentBanner, setShowConsentBanner] = useState(false);
  
  const screenTimeStartRef = useRef<number>(Date.now());

  const { isReady, initData } = useTelegram();

  const handleLock = () => {
    if (view !== 'lock' && view !== 'connect') {
      const screenTimeSeconds = (Date.now() - screenTimeStartRef.current) / 1000;
      logEvent('lock_screen_activated', { current_screen: view, screen_time_seconds: parseFloat(screenTimeSeconds.toFixed(2)) });
      setWallet(null); // Clear active wallet state
      setView('lock');
    }
  };
  
  const handleViewChange = (newView: View) => {
    const screenTimeSeconds = (Date.now() - screenTimeStartRef.current) / 1000;
    logEvent('view_changed', { previous_screen: view, new_screen: newView, screen_time_seconds: parseFloat(screenTimeSeconds.toFixed(2)) });
    screenTimeStartRef.current = Date.now();
    setView(newView);
  }

  useInactivityTimeout(handleLock);


  useEffect(() => {
    // This effect simulates backend validation of Telegram's initData.
    // In a real app, you would send `initData` to your backend for secure verification.
    if (isReady) {
      console.log('Telegram Web App is ready.');

      if (!hasMadeConsentChoice()) {
        setShowConsentBanner(true);
      }

      // Simulate validation delay
      setTimeout(() => {
        if (initData) {
          console.log('initData received, proceeding.');
        } else {
          console.warn('Running outside of Telegram or initData is not available.');
        }

        const storedWallet = getStoredWallet();
        setStoredWalletInfo(storedWallet);
        if (storedWallet) {
          handleViewChange('lock');
        } else {
          handleViewChange('connect');
        }
        
        logEvent('app_loaded', { initial_view: storedWallet ? 'lock' : 'connect' });

        setStatus('ready');
      }, 1000);
    }
  }, [isReady, initData]);

  const handleWalletConnected = (newWallet: Wallet) => {
    setWallet(newWallet);
    const storedInfo = getStoredWallet();
    setStoredWalletInfo(storedInfo);
    handleViewChange('dashboard');
  };

  const handleWalletUnlocked = async (password: string) => {
    const unlockedWallet = await unlockWallet(password);
    if(unlockedWallet) {
        setWallet(unlockedWallet);
        handleViewChange('dashboard');
    }
  }

  const handleTransactionSent = (sentTransaction: Transaction) => {
    if (sentTransaction.wallet) {
      setWallet(sentTransaction.wallet);
    }
    setTransaction(sentTransaction);
    handleViewChange('receipt');
  };

  const handleBackToDashboard = () => {
    setTransaction(null);
    handleViewChange('dashboard');
  };
  
  const handleShowCredits = () => {
    handleViewChange('credits');
  }

  const handleDisconnect = () => {
    logEvent('wallet_disconnected');
    setWallet(null);
    setStoredWalletInfo(null);
    clearStoredWallet();
    handleViewChange('connect');
  };

  if (status === 'validating') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 text-center h-[100dvh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Initializing Violet Vault...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center text-destructive-foreground bg-destructive p-4 rounded-lg">
        <p>Could not validate session. Please try again through your Telegram app.</p>
      </div>
    );
  }
  
  const showFooter = status === 'ready' && (view === 'dashboard' || view === 'credits' || view === 'receipt');

  return (
    <>
      <div className="w-full">
        {view === 'connect' && <ConnectView onWalletConnected={handleWalletConnected} />}
        {view === 'lock' && storedWalletInfo && (
          <LockView 
            storedWallet={storedWalletInfo}
            onWalletUnlocked={handleWalletUnlocked}
            onDisconnect={handleDisconnect}
            onWalletConnected={handleWalletConnected} // for password reset
          />
        )}
        {view === 'dashboard' && wallet && (
          <DashboardView
            wallet={wallet}
            onTransactionSent={handleTransactionSent}
            onDisconnect={handleDisconnect}
            onShowCredits={handleShowCredits}
          />
        )}
        {view === 'receipt' && transaction && (
          <ReceiptView transaction={transaction} onBack={handleBackToDashboard} />
        )}
        {view === 'credits' && (
          <CreditsView onBack={handleBackToDashboard} />
        )}
      </div>
      {showFooter && <AppFooter />}
      {showConsentBanner && <ConsentBanner onChoiceMade={() => setShowConsentBanner(false)} />}
      <FeedbackOrchestrator />
    </>
  );
}
