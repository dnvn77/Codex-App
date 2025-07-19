
"use client";

import React, { useState, useEffect } from 'react';
import { ConnectView } from '@/components/views/ConnectView';
import { DashboardView } from '@/components/views/DashboardView';
import { ReceiptView } from '@/components/views/ReceiptView';
import { LockView } from '@/components/views/LockView';
import { Loader2 } from 'lucide-react';
import type { Wallet, StoredWallet } from '@/lib/types';
import { useTelegram } from '@/hooks/useTelegram';
import { getStoredWallet, clearStoredWallet, updateStoredWalletBalance } from '@/lib/wallet';
import { Chatbot } from '@/components/shared/Chatbot';

type View = 'connect' | 'dashboard' | 'receipt' | 'lock';
type Status = 'validating' | 'ready' | 'error';

export function AppContainer() {
  const [view, setView] = useState<View>('connect');
  const [status, setStatus] = useState<Status>('validating');
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [storedWalletInfo, setStoredWalletInfo] = useState<StoredWallet | null>(null);
  const [transaction, setTransaction] = useState<any | null>(null);

  const { isReady, initData } = useTelegram();

  useEffect(() => {
    // This effect simulates backend validation of Telegram's initData.
    // In a real app, you would send `initData` to your backend for secure verification.
    if (isReady) {
      console.log('Telegram Web App is ready.');
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
          setView('lock');
        } else {
          setView('connect');
        }

        setStatus('ready');
      }, 1000);
    }
  }, [isReady, initData]);

  const handleWalletConnected = (newWallet: Wallet) => {
    setWallet(newWallet);
    const storedInfo = getStoredWallet();
    setStoredWalletInfo(storedInfo);
    setView('dashboard');
  };

  const handleWalletUnlocked = (unlockedWallet: Wallet) => {
    setWallet(unlockedWallet);
    setView('dashboard');
  }

  const handleTransactionSent = (sentTransaction: any) => {
    if (wallet) {
      // Update wallet balance after transaction
      const newBalance = wallet.balance - sentTransaction.amount;
      setWallet({ ...wallet, balance: newBalance });
      // Persist the new balance to localStorage
      updateStoredWalletBalance(newBalance);
    }
    setTransaction(sentTransaction);
    setView('receipt');
  };

  const handleBackToDashboard = () => {
    setTransaction(null);
    setView('dashboard');
  };

  const handleDisconnect = () => {
    setWallet(null);
    setStoredWalletInfo(null);
    clearStoredWallet();
    setView('connect');
  };

  if (status === 'validating') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Initializing Strawberry Wallet...</p>
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
          />
        )}
        {view === 'receipt' && transaction && (
          <ReceiptView transaction={transaction} onBack={handleBackToDashboard} />
        )}
      </div>
       {status === 'ready' && <Chatbot />}
    </>
  );
}
