
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { sendTransaction, resolveEnsName, unlockWallet, getFavoriteAssets, setFavoriteAssets } from '@/lib/wallet';
import type { Wallet, Transaction, Asset } from '@/lib/types';
import { fetchAssetPrices } from '@/ai/flows/assetPriceFlow';
import { Send, Copy, LogOut, Loader2, AlertTriangle, BellRing, CheckCircle, XCircle, QrCode, Star, Eye, EyeOff, Info, Search, ShieldCheck, ShieldAlert, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
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
} from "@/components/ui/alert-dialog";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { QRScanner } from '@/components/shared/QRScanner';
import { useTranslations } from '@/hooks/useTranslations';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { AssetList } from '@/components/shared/AssetList';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { FavoriteAssetChart } from '@/components/shared/FavoriteAssetChart';
import { DetailedAssetChart } from '@/components/shared/DetailedAssetChart';
import { TransactionHistory } from '@/components/shared/TransactionHistory';
import { logEvent } from '@/lib/analytics';
import { useFeedback } from '@/hooks/useFeedback';

interface DashboardViewProps {
  wallet: Wallet;
  onTransactionSent: (transaction: Transaction) => void;
  onDisconnect: () => void;
  onShowCredits: () => void;
}

const ALL_EVM_ASSETS: Omit<Asset, 'balance' | 'priceUSD' | 'change24h' | 'isFavorite' | 'icon'>[] = [
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
    { name: 'Strawberry Token', ticker: 'STRW', id: 0 }
];

const GasFeeDisplay = ({ gasCost, averageGas, isLoading, t }: { gasCost: number; averageGas: number; isLoading: boolean, t: any }) => {
  const colorClass = gasCost > averageGas ? 'text-destructive' : gasCost < averageGas ? 'text-green-500' : 'text-foreground';

  if (isLoading) {
    return (
      <div className="text-xs text-muted-foreground text-right space-y-1">
        <p>{t.calculatingGas}</p>
        <p>{t.averageFee}: ...</p>
      </div>
    )
  }

  return (
    <div className="text-xs text-muted-foreground text-right space-y-1">
      <p>
        {t.estGasFee}: <span className={cn("font-semibold", colorClass)}>{gasCost.toFixed(5)} ETH</span>
      </p>
      <p>
        {t.averageFee}: <span>{averageGas.toFixed(5)} ETH</span>
      </p>
    </div>
  );
};

export function DashboardView({ wallet, onTransactionSent, onDisconnect, onShowCredits }: DashboardViewProps) {
  const { toast } = useToast();
  const t = useTranslations();
  const { triggerFeedbackEvent } = useFeedback();

  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAssetTicker, setSelectedAssetTicker] = useState('ETH');
  const [isSending, setIsSending] = useState(false);
  const [amountError, setAmountError] = useState('');
  
  const [showHighGasConfirm, setShowHighGasConfirm] = useState(false);
  const [showGasNotifyPrompt, setShowGasNotifyPrompt] = useState(false);
  const [notificationAddress, setNotificationAddress] = useState('');
  const [notificationAmount, setNotificationAmount] = useState('');

  const [gasCost, setGasCost] = useState(0.00042);
  const [averageGas, setAverageGas] = useState(0.00045);
  const [isCalculatingGas, setIsCalculatingGas] = useState(true);

  const [ensResolution, setEnsResolution] = useState<{status: 'idle' | 'loading' | 'success' | 'error', address: string | null}>({ status: 'idle', address: null });
  const [isScannerOpen, setScannerOpen] = useState(false);
  
  const [showBalances, setShowBalances] = useState(true);
  const [hideZeroBalances, setHideZeroBalances] = useState(true);
  
  const [assets, setAssets] = useState<Asset[]>([]); 
  const [assetStatus, setAssetStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [favoriteAssets, setFavoriteAssetsState] = useState<Set<string>>(new Set());
  
  const [isAssetSelectorOpen, setAssetSelectorOpen] = useState(false);
  
  const [isAmountConfirmOpen, setAmountConfirmOpen] = useState(false);
  const [isPasswordConfirmOpen, setPasswordConfirmOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const [detailedChartAsset, setDetailedChartAsset] = useState<Asset | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [mockBalances, setMockBalances] = useState<Record<string, number>>({
    'ETH': wallet.balance,
    'USDC': 2500.50,
    'WBTC': 0.05,
    'USDT': 1234.56,
    'LINK': 350.75,
    'UNI': 500.00,
    'DAI': 1500.00,
    'STRW': 50000,
  });

  const userAssetSymbols = useMemo(() => {
    const symbols = new Set(Object.keys(mockBalances));
    symbols.add('ETH');
    return Array.from(symbols);
  }, [mockBalances]);
  
  const updateAssetPrices = useCallback(async () => {
    setAssetStatus('loading');
    try {
        const priceData = await fetchAssetPrices({ symbols: userAssetSymbols });
        const currentFavorites = getFavoriteAssets();
        
        const finalAssets = priceData.map(asset => ({
            ...asset,
            balance: mockBalances[asset.ticker] || 0,
            isFavorite: currentFavorites.has(asset.ticker),
        })).sort((a, b) => {
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            const valueA = a.balance * a.priceUSD;
            const valueB = b.balance * a.priceUSD;
            return valueB - valueA;
        });

        setAssets(finalAssets);
        setAssetStatus('success');
    } catch (error) {
        console.error("Failed to fetch asset prices:", error);
        toast({
            title: t.error,
            description: 'Could not load asset prices. Please try again later.',
            variant: 'destructive',
        });
        setAssetStatus('error');
    }
  }, [userAssetSymbols, toast, t, mockBalances]);

  useEffect(() => {
    updateAssetPrices();
  }, [updateAssetPrices]);

  useEffect(() => {
    setFavoriteAssetsState(getFavoriteAssets());
  }, []);
  
  const assetsForCarousel = useMemo(() => {
    return assets.filter(a => favoriteAssets.has(a.ticker));
  }, [assets, favoriteAssets]);

  const handleToggleFavorite = useCallback((ticker: string) => {
    const newFavorites = new Set(favoriteAssets);
    if (newFavorites.has(ticker)) {
      newFavorites.delete(ticker);
      logEvent('favorite_asset_removed', { ticker });
    } else {
      newFavorites.add(ticker);
      logEvent('favorite_asset_added', { ticker });
    }
    setFavoriteAssets(Array.from(newFavorites));
    setFavoriteAssetsState(newFavorites);
    
    // Re-sort assets to reflect new favorite status
    setAssets(prevAssets => {
      return [...prevAssets].sort((a, b) => {
        const aIsFav = newFavorites.has(a.ticker);
        const bIsFav = newFavorites.has(b.ticker);
        if (aIsFav && !bIsFav) return -1;
        if (!aIsFav && bIsFav) return 1;
        const valueA = a.balance * a.priceUSD;
        const valueB = b.balance * b.priceUSD;
        return valueB - valueA;
      });
    });

  }, [favoriteAssets]);
  
  const totalBalanceUSD = useMemo(() => {
    return assets.reduce((total, asset) => {
        const valueInUSD = asset.balance * asset.priceUSD;
        return total + valueInUSD;
    }, 0);
  }, [assets]);

  const selectedAsset = useMemo(() => {
    return assets.find(a => a.ticker === selectedAssetTicker) || null;
  }, [assets, selectedAssetTicker]);

  const maxSendableAmount = useMemo(() => {
    if (!selectedAsset || typeof selectedAsset.balance !== 'number') return 0;
    
    if (selectedAsset.ticker === 'ETH') {
      const max = selectedAsset.balance - gasCost;
      return max > 0 ? max : 0;
    }
    return selectedAsset.balance;
  }, [selectedAsset, gasCost]);


  useEffect(() => {
    setIsCalculatingGas(true);
    const timer = setTimeout(() => {
      if (toAddress && parseFloat(amount) > 0) {
        const baseGas = selectedAssetTicker === 'ETH' ? 0.00030 : 0.00050;
        const newGas = baseGas + Math.random() * 0.00030;
        const newAvg = 0.00045 + (Math.random() - 0.5) * 0.00005;
        setGasCost(newGas);
        setAverageGas(newAvg);
      } else {
        setGasCost(0.00042);
        setAverageGas(0.00045);
      }
      setIsCalculatingGas(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [toAddress, amount, selectedAssetTicker]);
  
  useEffect(() => {
    const handleEnsLookup = async () => {
      let query = toAddress.trim();
      if (!query) {
        setEnsResolution({ status: 'idle', address: null });
        return;
      }

      if (!query.startsWith('0x') && !query.endsWith('.eth')) {
        query += '.eth';
      }
      
      if (query.endsWith('.eth')) {
        setEnsResolution({ status: 'loading', address: null });
        const resolvedAddress = await resolveEnsName(query);
        if (resolvedAddress) {
          setEnsResolution({ status: 'success', address: resolvedAddress });
        } else {
          setEnsResolution({ status: 'error', address: null });
        }
      } else {
        setEnsResolution({ status: 'idle', address: null });
      }
    };

    const debounceTimer = setTimeout(() => {
      handleEnsLookup();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [toAddress]);


  const handleCopyAddress = () => {
    navigator.clipboard.writeText(wallet.address);
    toast({
      title: t.addressCopiedTitle,
      description: t.addressCopiedDesc,
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value;
    setAmount(newAmount);
    
    const numericAmount = parseFloat(newAmount);
    const balance = selectedAsset?.balance || 0;
    const ethBalance = mockBalances['ETH'] || 0;

    if (isNaN(numericAmount) || numericAmount < 0) {
        setAmountError(t.invalidNumberError);
    } else if (numericAmount > balance) {
        setAmountError(t.insufficientTokenBalanceError(selectedAsset?.ticker || 'tokens'));
    } else if (gasCost > ethBalance) {
        setAmountError(t.insufficientGasError);
    } else {
        setAmountError('');
    }
};

  const handleSetMaxAmount = () => {
    if (!selectedAsset) return;
    const maxAmountStr = maxSendableAmount.toFixed(8).replace(/\.?0+$/, '');
    setAmount(maxAmountStr);
    handleAmountChange({ target: { value: maxAmountStr } } as React.ChangeEvent<HTMLInputElement>);
  };


  const executeSend = async () => {
    setAmountConfirmOpen(false);
    setPasswordConfirmOpen(false);
    setShowHighGasConfirm(false);

    const finalAddress = ensResolution.status === 'success' ? ensResolution.address : toAddress;

    if (!finalAddress || !amount || amountError || !selectedAsset) {
      toast({ title: t.invalidInfoTitle, description: t.invalidInfoDesc, variant: 'destructive' });
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(finalAddress)) {
      toast({ title: t.invalidAddressTitle, description: t.invalidAddressDesc, variant: 'destructive' });
      return;
    }

    setIsSending(true);
    const txSentFirstTime = !localStorage.getItem('has_sent_tx');

    logEvent('send_transaction_start', {
      asset: selectedAsset.ticker,
      amount: parseFloat(amount),
      gas_cost_eth: gasCost,
      is_ens: ensResolution.status === 'success',
    });

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const tx = sendTransaction(wallet, finalAddress, parseFloat(amount), selectedAsset.ticker, selectedAsset.icon);
      
      setMockBalances(prevBalances => {
          const newBalances = { ...prevBalances };
          const sentAmount = parseFloat(amount);

          if (newBalances[selectedAsset.ticker] !== undefined) {
              newBalances[selectedAsset.ticker] = Math.max(0, newBalances[selectedAsset.ticker] - sentAmount);
          }

          if (newBalances['ETH'] !== undefined) {
              newBalances['ETH'] = Math.max(0, newBalances['ETH'] - gasCost);
          }
          
          const updatedWallet: Wallet = {
              ...wallet,
              balance: newBalances['ETH']
          };
          
          onTransactionSent({ ...tx, wallet: updatedWallet });

          return newBalances;
      });

      if (txSentFirstTime) {
        localStorage.setItem('has_sent_tx', 'true');
        triggerFeedbackEvent('tx_sent_first_time');
      }

      logEvent('send_transaction_success', { tx_hash: tx.txHash });
      setToAddress('');
      setAmount('');
    } catch (error) {
      const err = error as Error;
      logEvent('send_transaction_fail', { error_message: err.message, error_code: 'tx_failed' });
      toast({ title: t.txFailedTitle, description: err.message, variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendClick = () => {
    const numericAmount = parseFloat(amount) || 0;
    if (!selectedAsset) return;
    
    const usdValue = numericAmount * selectedAsset.priceUSD;

    const ethBalance = mockBalances['ETH'] || 0;
    if (numericAmount > (selectedAsset.balance || 0)) {
        setAmountError(t.insufficientTokenBalanceError(selectedAsset.ticker));
        toast({ title: t.error, description: t.insufficientTokenBalanceError(selectedAsset.ticker), variant: 'destructive' });
        return;
    }
    if (gasCost > ethBalance) {
        setAmountError(t.insufficientGasError);
        toast({ title: t.error, description: t.insufficientGasError, variant: 'destructive' });
        return;
    }

    if (usdValue >= 3000) {
        logEvent('send_tx_password_required_prompt', { amount_usd: usdValue });
        setPasswordConfirmOpen(true);
    } else if (usdValue >= 1000) {
        logEvent('send_tx_amount_confirm_prompt', { amount_usd: usdValue });
        setAmountConfirmOpen(true);
    } else {
        if (gasCost > averageGas) {
            logEvent('send_tx_high_gas_prompt');
            setShowHighGasConfirm(true);
        } else {
            executeSend();
        }
    }
  };
  
  const handlePasswordConfirm = async () => {
    setIsSending(true);
    setConfirmPasswordError('');
    try {
        await unlockWallet(confirmPassword);
        setPasswordConfirmOpen(false);
        setConfirmPassword('');
        await executeSend();
    } catch (e) {
        setConfirmPasswordError(t.wrongPasswordError);
    } finally {
        setIsSending(false);
    }
  };
  
  const handleHighGasCancel = () => {
    setShowHighGasConfirm(false);
    setTimeout(() => {
      setNotificationAddress(toAddress);
      setNotificationAmount(amount);
      setShowGasNotifyPrompt(true);
    }, 150);
  };

  const handleSetupGasNotification = () => {
    logEvent('gas_notification_setup');
    toast({
        title: t.gasAlertSetTitle,
        description: t.gasAlertSetDesc(notificationAmount, selectedAssetTicker, notificationAddress),
    });
    setShowGasNotifyPrompt(false);
    setNotificationAddress('');
    setNotificationAmount('');
  };

  const handleQrScan = (data: string | null) => {
    if (data) {
        logEvent('qr_code_scanned');
        setScannerOpen(false);
        let address = data;
        if (address.startsWith('ethereum:')) {
            address = address.split(':')[1];
        }
        if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
            setToAddress(address);
            toast({
                title: t.addressScannedTitle,
                description: t.addressScannedDesc,
            });
        } else {
            logEvent('qr_code_scan_fail', { reason: 'invalid_address', error_code: 'invalid_qr' });
            toast({
                title: t.invalidQrTitle,
                description: t.invalidQrDesc,
                variant: 'destructive',
            });
        }
    } else {
      setScannerOpen(false);
    }
  };


  const truncatedAddress = `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;
  
  const isSendDisabled = useMemo(() => {
    const addressInvalid = ensResolution.status === 'error' || (!toAddress.endsWith('.eth') && !/^0x[a-fA-F0-9]{40}$/.test(toAddress) && ensResolution.status !== 'success');
    return isSending || !toAddress || !amount || !!amountError || parseFloat(amount) <= 0 || isCalculatingGas || ensResolution.status === 'loading' || addressInvalid;
  }, [isSending, toAddress, amount, amountError, isCalculatingGas, ensResolution]);

  const allAssetsWithIcons = useMemo(() => {
    return ALL_EVM_ASSETS.map(asset => ({
        ...asset,
        icon: `/icons/${asset.ticker.toLowerCase()}.svg`
    }));
  }, []);

  return (
    <>
      <Card className="w-full shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{t.dashboardTitle}</CardTitle>
              <CardDescription>{t.dashboardDesc}</CardDescription>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={onShowCredits}>
                <Star className="mr-2 h-4 w-4"/>
                Créditos
              </Button>
              <Button variant="ghost" size="sm" onClick={onDisconnect}>
                <LogOut className="mr-2 h-4 w-4"/>
                {t.disconnectButton}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
                <div className="flex justify-between items-center mb-2">
                    <div />
                    <Button variant="ghost" size="icon" onClick={() => { logEvent('balance_visibility_toggled', { visible: !showBalances }); setShowBalances(!showBalances); }} className="h-8 w-8">
                      {showBalances ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                </div>
               <div className='flex justify-between items-center'>
                <div>
                  <Label>{t.totalBalanceLabel}</Label>
                   <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">
                       {showBalances ? `$${totalBalanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••'}
                    </p>
                  </div>
                </div>
              </div>

               <div className="flex items-center justify-between">
                <Label>{t.yourWalletAddressLabel}</Label>
                <div className="flex items-center">
                  <Dialog>
                    <DialogTrigger asChild>
                       <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => logEvent('show_qr_code_clicked')}>
                         <QrCode className="h-5 w-5" />
                       </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xs">
                       <DialogHeader>
                         <DialogTitle>{t.receiveFundsTitle}</DialogTitle>
                       </DialogHeader>
                       <div className="flex flex-col items-center justify-center p-4 gap-4">
                         <div className="p-2 bg-white rounded-lg">
                            <Image 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${wallet.address}`}
                              width={200}
                              height={200}
                              alt="Wallet Address QR Code"
                              data-ai-hint="qr code"
                            />
                         </div>
                         <p className="text-xs text-muted-foreground break-all text-center">{wallet.address}</p>
                         <Button onClick={handleCopyAddress} className="w-full">
                           <Copy className="mr-2 h-4 w-4" />
                           {t.copyAddressButton}
                         </Button>
                       </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyAddress}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm font-mono text-primary text-right">{truncatedAddress}</p>
            </div>
             <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full" onClick={() => logEvent('transaction_history_opened')}>
                        <History className="mr-2 h-4 w-4" />
                        Transaction History
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Transaction History</DialogTitle>
                        <DialogDescription>
                            Your recent transaction activity from the network.
                        </DialogDescription>
                    </DialogHeader>
                    <TransactionHistory walletAddress={wallet.address} />
                </DialogContent>
            </Dialog>

            {assetsForCarousel.length > 0 && (
                <Carousel
                    opts={{
                    align: "start",
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                    {assetsForCarousel.map((asset) => (
                        <CarouselItem key={asset.ticker} className="md:basis-1/2 lg:basis-1/3">
                            <div className="p-1">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button className="w-full" onClick={() => setDetailedChartAsset(asset)}>
                                             <FavoriteAssetChart asset={asset} />
                                        </button>
                                    </DialogTrigger>
                                </Dialog>
                            </div>
                        </CarouselItem>
                    ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            )}
            
            <Separator />
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">{t.assetsTitle}</h3>
                 <div className="flex items-center space-x-2">
                  <Label htmlFor="hide-zero" className="text-sm text-muted-foreground">{t.hideZeroBalancesLabel}</Label>
                  <Switch
                    id="hide-zero"
                    checked={hideZeroBalances}
                    onCheckedChange={(checked) => { logEvent('hide_zero_balances_toggled', { enabled: checked }); setHideZeroBalances(checked); }}
                  />
                </div>
              </div>
              {assetStatus === 'loading' && (
                <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                    <p className="text-muted-foreground mt-2">Cargando precios...</p>
                </div>
              )}
              {assetStatus === 'error' && (
                <div className="text-center py-8 text-destructive">
                    <AlertTriangle className="h-8 w-8 mx-auto" />
                    <p className="mt-2">No se pudieron cargar los activos.</p>
                </div>
              )}
              {assetStatus === 'success' && (
                <AssetList 
                  assets={assets} 
                  showBalances={showBalances} 
                  hideZeroBalances={hideZeroBalances} 
                  t={t} 
                  onRefresh={updateAssetPrices} 
                  isRefreshing={assetStatus === 'loading'}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}
            </div>

            <Separator />

            <div className="space-y-2 pt-4">
               <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium">{t.sendTxTitle}</h3>
                <GasFeeDisplay gasCost={gasCost} averageGas={averageGas} isLoading={isCalculatingGas} t={t} />
               </div>
              <div className="space-y-1">
                <Label htmlFor="toAddress">{t.destinationAddressLabel}</Label>
                <div className="flex items-center gap-2">
                    <Input
                      id="toAddress"
                      placeholder="0x... or vitalik.eth"
                      value={toAddress}
                      onChange={(e) => setToAddress(e.target.value)}
                      disabled={isSending}
                      className="flex-grow"
                    />
                    <Dialog open={isScannerOpen} onOpenChange={setScannerOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" disabled={isSending} onClick={() => logEvent('qr_scanner_opened')}>
                          <QrCode className="h-5 w-5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-sm">
                        <DialogHeader>
                          <DialogTitle>{t.scanQrTitle}</DialogTitle>
                        </DialogHeader>
                        <QRScanner onScan={handleQrScan} t={t} />
                      </DialogContent>
                    </Dialog>
                </div>
                 {ensResolution.status !== 'idle' && (
                  <div className="text-xs pt-1 flex items-center gap-2">
                    {ensResolution.status === 'loading' && <> <Loader2 className="h-3 w-3 animate-spin"/>{t.resolvingEns}</>}
                    {ensResolution.status === 'success' && <><CheckCircle className="h-4 w-4 text-green-500" /> <span className="font-mono text-muted-foreground">{ensResolution.address}</span></>}
                    {ensResolution.status === 'error' && <><XCircle className="h-4 w-4 text-destructive" /> <span className="text-destructive">{t.ensResolutionError}</span></>}
                  </div>
                )}
              </div>

               <div className="grid grid-cols-5 gap-2 items-end pt-2">
                <div className="col-span-3 space-y-1 pt-6">
                  <div className="flex justify-between items-end">
                    <Label htmlFor="amount">{t.amountLabel}</Label>
                    <button onClick={handleSetMaxAmount} className="text-xs text-primary hover:underline" disabled={isCalculatingGas}>
                      {t.maxAmountLabel}: {maxSendableAmount.toFixed(5)}
                    </button>
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.01"
                    value={amount}
                    onChange={handleAmountChange}
                    disabled={isSending}
                  />
                </div>

                <div className="col-span-2 space-y-1">
                    <div className="h-6 flex items-end">
                      <Label htmlFor="asset">{t.assetLabel}</Label>
                    </div>
                     <Popover open={isAssetSelectorOpen} onOpenChange={setAssetSelectorOpen}>
                        <PopoverTrigger asChild>
                            <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={isAssetSelectorOpen}
                            className="w-full justify-between h-10"
                            disabled={isSending}
                            >
                            <div className="flex items-center gap-2">
                                {selectedAsset ? (
                                    <Image src={selectedAsset.icon} alt={selectedAsset.name} width={20} height={20} className="rounded-full" />
                                ) : <div className="w-5 h-5"/>}
                                {selectedAsset ? selectedAsset.ticker : t.selectAssetLabel}
                            </div>
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                            <Command>
                            <CommandInput placeholder={t.searchAssetPlaceholder} />
                            <CommandList>
                                <CommandEmpty>{t.noAssetFound}</CommandEmpty>
                                <CommandGroup>
                                {allAssetsWithIcons.map((asset) => (
                                    <CommandItem
                                    key={asset.ticker}
                                    value={asset.name}
                                    onSelect={() => {
                                        logEvent('asset_selected_for_send', { asset: asset.ticker });
                                        setSelectedAssetTicker(asset.ticker);
                                        setAssetSelectorOpen(false);
                                    }}
                                    >
                                     <CheckCircle
                                        className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedAssetTicker === asset.ticker ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                     <div className="flex items-center gap-2">
                                        <Image src={asset.icon} alt={asset.name} width={20} height={20} className="rounded-full" />
                                        <span>{asset.ticker}</span>
                                      </div>
                                    </CommandItem>
                                ))}
                                </CommandGroup>
                            </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
              </div>
              <div>
                {amountError && <p className="text-sm font-medium text-destructive">{amountError}</p>}
                {selectedAssetTicker !== 'ETH' && (
                    <div className="mt-2 text-xs text-muted-foreground flex items-start gap-2 p-2 bg-muted rounded-md">
                        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <p>{t.tokenPortalInfo}</p>
                    </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSendClick} disabled={isSendDisabled}>
              {isSending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.sendingButton}</>
              ) : (
                  <><Send className="mr-2 h-4 w-4" /> {t.sendPrivatelyButton}</>
              )}
          </Button>
        </CardFooter>
        
        <AlertDialog open={showHighGasConfirm} onOpenChange={setShowHighGasConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="text-destructive" />
                {t.highGasWarningTitle}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t.highGasWarningDesc}
                <div className="grid grid-cols-2 gap-x-4 my-4 text-foreground">
                    <span className="font-semibold">{t.averageFee}:</span>
                    <span className="font-mono text-right">{averageGas.toFixed(5)} ETH</span>
                    <span className="font-semibold text-destructive">{t.currentFee}:</span>
                    <span className="font-mono text-right text-destructive">{gasCost.toFixed(5)} ETH</span>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleHighGasCancel}>{t.cancelButton}</AlertDialogCancel>
              <AlertDialogAction onClick={executeSend} className={cn(buttonVariants({variant: "destructive"}))}>
                {t.sendAnywayButton}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <AlertDialog open={isAmountConfirmOpen} onOpenChange={setAmountConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <ShieldAlert className="text-primary" />
                Confirm Transaction
              </AlertDialogTitle>
              <AlertDialogDescription>
                You are about to send a significant amount. Please confirm the details below.
                <div className="my-4 space-y-2 text-foreground break-all">
                  <p><b>Amount:</b> {parseFloat(amount).toLocaleString()} {selectedAsset?.ticker}</p>
                  <p><b>Value:</b> ~${(parseFloat(amount) * (selectedAsset?.priceUSD || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p><b>To:</b> {ensResolution.status === 'success' ? `${toAddress} (${ensResolution.address})` : toAddress}</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => { setAmountConfirmOpen(false); gasCost > averageGas ? setShowHighGasConfirm(true) : executeSend(); }}>
                Confirm & Send
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isPasswordConfirmOpen} onOpenChange={setPasswordConfirmOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="text-destructive" />
                        Password Required for High-Value Transaction
                    </DialogTitle>
                    <DialogDescription>
                        For your security, please enter your password to authorize this transaction of ~${(parseFloat(amount) * (selectedAsset?.priceUSD || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="confirm_password">Password</Label>
                    <Input 
                        id="confirm_password" 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setConfirmPasswordError('');
                        }}
                    />
                    {confirmPasswordError && <p className="text-destructive text-sm mt-1">{confirmPasswordError}</p>}
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handlePasswordConfirm} disabled={isSending || !confirmPassword}>
                        {isSending ? <Loader2 className="animate-spin" /> : 'Authorize & Send'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
        <AlertDialog open={showGasNotifyPrompt} onOpenChange={setShowGasNotifyPrompt}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                      <BellRing className="text-primary"/>
                      {t.getNotifiedTitle}
                  </DialogTitle>
                  <AlertDialogDescription>
                      {t.getNotifiedDesc}
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>{t.noThanksButton}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSetupGasNotification}>
                      {t.yesNotifyMeButton}
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
      
       <Dialog open={!!detailedChartAsset} onOpenChange={() => setDetailedChartAsset(null)}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>
                    {detailedChartAsset?.name} ({detailedChartAsset?.ticker})
                </DialogTitle>
            </DialogHeader>
            <div className="h-96 w-full">
                {detailedChartAsset && <DetailedAssetChart asset={detailedChartAsset} />}
            </div>
        </DialogContent>
    </Dialog>
    </>
  );
}
