

"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { MainNav } from '@/components/views/MainNav';
import { WalletView } from '@/components/views/WalletView';
import { SettingsView } from '@/components/views/SettingsView';
import { ChatView } from '@/components/views/ChatView';
import { ProfileView } from '@/components/views/ProfileView';
import { ContactsView } from '@/components/views/ContactsView';
import type { Wallet, StoredWallet, Asset } from '@/lib/types';
import { getStoredWallet, unlockWallet, clearStoredWallet } from '@/lib/wallet';
import { ConnectView } from '@/components/views/ConnectView';
import { LockView } from '@/components/views/LockView';
import { useToast } from '@/hooks/use-toast';
import { logEvent } from '@/lib/analytics';
import { fetchAssetPrices, type AssetPriceOutput } from '@/ai/flows/assetPriceFlow';

const ALL_EVM_ASSETS = [
    { name: 'Monad', ticker: 'MONAD', id: 9999 },
    { name: 'Ethereum', ticker: 'ETH', id: 1027 },
    { name: 'USD Coin', ticker: 'USDC', id: 3408 },
    { name: 'Tether', ticker: 'USDT', id: 825 },
    { name: 'Wrapped BTC', ticker: 'WBTC', id: 3717 },
    { name: 'Chainlink', ticker: 'LINK', id: 1975 },
    { name: 'Uniswap', ticker: 'UNI', id: 7083 },
    { name: 'Dai', ticker: 'DAI', id: 4943 },
    { name: 'Lido DAO', ticker: 'LDO', id: 22353 },
    { name: 'Arbitrum', ticker: 'ARB', id: 25163 },
    { name: 'Optimism', ticker: 'OP', id: 22312 },
    { name: 'Aave', ticker: 'AAVE', id: 7278 },
    { name: 'Maker', ticker: 'MKR', id: 1518 },
    { name: 'The Sandbox', ticker: 'SAND', id: 6210 },
    { name: 'Decentraland', ticker: 'MANA', id: 1966 },
    { name: 'Codex Token', ticker: 'CDX', id: 0 }
];


export default function Home() {
  const [activeView, setActiveView] = useState<'profile' | 'chats' | 'wallet' | 'settings' | 'contacts'>('wallet');
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [storedWalletInfo, setStoredWalletInfo] = useState<StoredWallet | null>(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [priceData, setPriceData] = useState<AssetPriceOutput>([]);
  const [assetStatus, setAssetStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const [mockBalances, setMockBalances] = useState<Record<string, number>>({});

  const { toast } = useToast();

  const updateAssetPrices = useCallback(async () => {
    setAssetStatus('loading');
    try {
        const fetchedPriceData = await fetchAssetPrices({ symbols: ALL_EVM_ASSETS.map(a => a.ticker) });
        setPriceData(fetchedPriceData);
        setAssetStatus('success');
    } catch (error) {
        console.error("Failed to fetch asset prices:", error);
        toast({
            title: "Error",
            description: 'Could not load asset prices. Please try again later.',
            variant: 'destructive',
        });
        setAssetStatus('error');
    }
  }, [toast]);

  useEffect(() => {
    if (wallet) {
      updateAssetPrices();
      // Set initial mock balances for non-native assets, native MONAD balance comes from wallet object
      setMockBalances(prev => ({
        ...prev,
        'USDC': 1520.75,
        'WBTC': 0.03,
        'CDX': 12500,
        'LINK': 150.2,
        'UNI': 300,
      }));
    }
  }, [wallet, updateAssetPrices]);

  useEffect(() => {
    if (priceData.length > 0 && wallet) {
        const combinedAssets = priceData.map(asset => ({
            ...asset,
            // Use real balance for MONAD from wallet object, otherwise use mock balances
            balance: asset.ticker === 'MONAD' ? wallet.balance : (mockBalances[asset.ticker] || 0),
            isFavorite: false,
        })).sort((a, b) => {
            const valueA = a.balance * a.priceUSD;
            const valueB = b.balance * a.priceUSD;
            if (valueB !== valueA) return valueB - valueA;
            return a.ticker.localeCompare(b.ticker);
        });
        setAssets(combinedAssets);
    }
  }, [priceData, mockBalances, wallet]);

  useEffect(() => {
    const stored = getStoredWallet();
    setStoredWalletInfo(stored);
  }, []);

  const handleLoginComplete = (newWallet: Wallet, isNewUser: boolean) => {
    setWallet(newWallet);
    const newStoredInfo = getStoredWallet();
    setStoredWalletInfo(newStoredInfo);
    
    if (isNewUser) {
        logEvent('first_login_complete');
        setIsFirstLogin(true);
        setActiveView('profile');
    } else {
       // On subsequent logins, ensure the wallet state has the real balance for MONAD
        setMockBalances(prev => ({ ...prev, 'MONAD': newWallet.balance }));
    }
  };
  
  const handleWalletUnlocked = (unlockedWallet: Wallet) => {
    if(unlockedWallet) {
        setWallet(unlockedWallet);
        // Also update balances on unlock
        setMockBalances(prev => ({ ...prev, 'MONAD': unlockedWallet.balance }));
    } else {
        toast({
            title: "Unlock Failed",
            description: "Could not unlock wallet.",
            variant: "destructive"
        });
    }
  }

  const handleDisconnect = () => {
    logEvent('wallet_disconnected');
    clearStoredWallet();
    setWallet(null);
    setStoredWalletInfo(null);
    setIsFirstLogin(false);
  }
  
  const handleProfileSaved = () => {
    setIsFirstLogin(false);
  }

  const handleTransactionSuccess = (ticker: string, amount: number, gasCost: number) => {
    // Update the main wallet object if MONAD balance changed
    setWallet(prevWallet => {
      if (!prevWallet) return null;
      let newBalance = prevWallet.balance;
      if (ticker === 'MONAD') {
          newBalance -= amount;
      }
      newBalance -= gasCost;

      return { ...prevWallet, balance: Math.max(0, newBalance) };
    });

    // Also update mock balances for other tokens
    setMockBalances(prevBalances => {
        const newBalances = { ...prevBalances };
        if (newBalances[ticker] !== undefined && ticker !== 'MONAD') {
            newBalances[ticker] = Math.max(0, newBalances[ticker] - amount);
        }
        return newBalances;
    });
  };

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
                onWalletUnlocked={handleLoginComplete}
                onDisconnect={handleDisconnect}
            />
        </main>
    )
  }
  
  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 p-2 md:p-4 overflow-y-auto mb-16">
        {activeView === 'profile' && <ProfileView wallet={wallet} showEditOnLoad={isFirstLogin} onProfileSaved={handleProfileSaved} />}
        {activeView === 'chats' && <ChatView wallet={wallet} assets={assets} onTransactionSuccess={handleTransactionSuccess} />}
        {activeView === 'wallet' && <WalletView wallet={wallet} assets={assets} onTransactionSuccess={handleTransactionSuccess} assetStatus={assetStatus} onRefreshPrices={updateAssetPrices} setMockBalances={setMockBalances} mockBalances={mockBalances} />}
        {activeView === 'settings' && <SettingsView onDisconnect={handleDisconnect} />}
        {activeView === 'contacts' && <ContactsView />}
      </main>
      <MainNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  )
}
