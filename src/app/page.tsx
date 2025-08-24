
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { MainNav } from '@/components/views/MainNav';
import { WalletView } from '@/components/views/WalletView';
import { SettingsView } from '@/components/views/SettingsView';
import { ChatView } from '@/components/views/ChatView';
import { ProfileView } from '@/components/views/ProfileView';
import { ContactsView } from '@/components/views/ContactsView';
import type { Wallet, StoredWallet, Asset } from '@/lib/types';
import { getStoredWallet, clearStoredWallet, clearMockBalances } from '@/lib/wallet';
import { ConnectView } from '@/components/views/ConnectView';
import { LockView } from '@/components/views/LockView';
import { useToast } from '@/hooks/use-toast';
import { logEvent } from '@/lib/analytics';
import { fetchAssetPrices, type AssetPriceOutput } from '@/ai/flows/assetPriceFlow';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

const FeeScheduleDialog = ({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) => {
    const feeTiers = [
        { range: "< $10", rate: "3.0%" },
        { range: "$10 - $99.99", rate: "2.5%" },
        { range: "$100 - $999.99", rate: "2.0%" },
        { range: "$1,000 - $9,999.99", rate: "1.5%" },
        { range: "≥ $10,000", rate: "1.0%" },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Fee Schedule</DialogTitle>
                    <DialogDescription>
                        Here are the commissions for private transactions sent through Codex. These fees help maintain the privacy infrastructure.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-2">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Transaction Amount (USD)</TableHead>
                                <TableHead className="text-right">Commission Rate</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {feeTiers.map((tier) => (
                                <TableRow key={tier.range}>
                                    <TableCell>{tier.range}</TableCell>
                                    <TableCell className="text-right font-mono">{tier.rate}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)} className="w-full">Got it</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export default function Home() {
  const [activeView, setActiveView] = useState<'profile' | 'chats' | 'wallet' | 'settings' | 'contacts'>('wallet');
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [storedWalletInfo, setStoredWalletInfo] = useState<StoredWallet | null>(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [priceData, setPriceData] = useState<AssetPriceOutput>([]);
  const [assetStatus, setAssetStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [mockBalances, setMockBalances] = useState<Record<string, number>>({});
  const [showFeeSchedule, setShowFeeSchedule] = useState(false);
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

  // Effect to load initial state from localStorage
  useEffect(() => {
    const stored = getStoredWallet();
    setStoredWalletInfo(stored);
    
    const initialBalances = JSON.parse(localStorage.getItem('codex_mock_balances') || '{}');
    if (stored && initialBalances) {
      setMockBalances(initialBalances);
    }
  }, []);

  // Effect to combine price data with balances to create the final asset list.
  useEffect(() => {
    if (priceData.length > 0 && wallet) {
      const combinedAssets = priceData.map(asset => {
        let balance = 0;
        // For MONAD, the source of truth is always the wallet object from the backend.
        if (asset.ticker === 'MONAD') {
          balance = wallet.balance;
        } else {
          // Other tokens use mock balances from localStorage.
          balance = mockBalances[asset.ticker] || 0;
        }
        return { ...asset, balance };
      }).sort((a, b) => {
        const valueA = a.balance * a.priceUSD;
        const valueB = b.balance * b.priceUSD;
        if (valueB !== valueA) return valueB - valueA;
        return a.ticker.localeCompare(b.ticker);
      });
      setAssets(combinedAssets);
    }
  }, [priceData, wallet, mockBalances]);

  const handleLoginComplete = (newWallet: Wallet, isNewUser: boolean) => {
    setWallet(newWallet);
    const newStoredInfo = getStoredWallet();
    setStoredWalletInfo(newStoredInfo);
    
    // --- THIS IS THE FIX ---
    // Ensure mock balances are initialized for new users,
    // and correctly set the REAL MONAD balance for everyone.
    const currentMockBalances = JSON.parse(localStorage.getItem('codex_mock_balances') || '{}');
    
    let finalBalances = { ...currentMockBalances };

    if (isNewUser || Object.keys(currentMockBalances).length === 0) {
      const initialMockBalances = {
        'ETH': 0.7964,
        'USDC': 1520.75,
        'WBTC': 0.03,
        'CDX': 12500,
        'LINK': 150.2,
        'UNI': 300,
      };
      finalBalances = { ...initialMockBalances, ...currentMockBalances };
    }
    
    // The most important part: ALWAYS use the real MONAD balance from the wallet object.
    finalBalances['MONAD'] = newWallet.balance;
    
    setMockBalances(finalBalances);
    localStorage.setItem('codex_mock_balances', JSON.stringify(finalBalances));
    // --- END FIX ---

    updateAssetPrices(); 

    // Check for first login to show fee schedule
    const isFirstLoginEver = localStorage.getItem('codex_first_login_complete') !== 'true';
    if (isFirstLoginEver) {
      setShowFeeSchedule(true);
      localStorage.setItem('codex_first_login_complete', 'true');
    }

    if (isNewUser) {
        logEvent('first_login_complete');
        setIsFirstLogin(true);
        setActiveView('profile');
    }
  };

  const handleDisconnect = () => {
    logEvent('wallet_disconnected');
    clearStoredWallet();
    clearMockBalances();
    setWallet(null);
    setStoredWalletInfo(null);
    setIsFirstLogin(false);
  }
  
  const handleProfileSaved = () => {
    setIsFirstLogin(false);
  }

  const handleTransactionSuccess = (ticker: string, amount: number, gasCost: number) => {
    setWallet(prevWallet => {
      if (!prevWallet) return null;
      
      let newMonadBalance = prevWallet.balance;
      const newMockBalances = { ...mockBalances };

      if (ticker === 'MONAD') {
          newMonadBalance -= (amount + gasCost);
      } else {
          newMonadBalance -= gasCost;
          if (newMockBalances[ticker] !== undefined) {
              newMockBalances[ticker] = Math.max(0, newMockBalances[ticker] - amount);
          }
      }
      
      setMockBalances(newMockBalances);
      localStorage.setItem('codex_mock_balances', JSON.stringify(newMockBalances));

      return { ...prevWallet, balance: Math.max(0, newMonadBalance) };
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
    <>
      <FeeScheduleDialog open={showFeeSchedule} onOpenChange={setShowFeeSchedule} />
      <div className="flex flex-col h-screen">
        <main className="flex-1 px-4 py-6 md:p-4 overflow-y-auto mb-16">
          {activeView === 'profile' && <ProfileView wallet={wallet} showEditOnLoad={isFirstLogin} onProfileSaved={handleProfileSaved} />}
          {activeView === 'chats' && <ChatView wallet={wallet} assets={assets} onTransactionSuccess={handleTransactionSuccess} />}
          {activeView === 'wallet' && <WalletView wallet={wallet} assets={assets} onTransactionSuccess={handleTransactionSuccess} assetStatus={assetStatus} onRefreshPrices={updateAssetPrices} setMockBalances={setMockBalances} mockBalances={mockBalances} />}
          {activeView === 'settings' && <SettingsView onDisconnect={handleDisconnect} />}
          {activeView === 'contacts' && <ContactsView />}
        </main>
        <MainNav activeView={activeView} setActiveView={setActiveView} />
      </div>
    </>
  )
}
