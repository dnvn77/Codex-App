
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { sendTransaction, resolveEnsName, fetchAssetPrices } from '@/lib/wallet';
import type { Wallet, Transaction, Asset } from '@/lib/types';
import { Send, Copy, LogOut, Loader2, AlertTriangle, BellRing, CheckCircle, XCircle, QrCode, Star, Eye, EyeOff } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { QRScanner } from '@/components/shared/QRScanner';
import { useTranslations } from '@/hooks/useTranslations';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { AssetList } from '@/components/shared/AssetList';

interface DashboardViewProps {
  wallet: Wallet;
  onTransactionSent: (transaction: Transaction) => void;
  onDisconnect: () => void;
  onShowCredits: () => void;
}

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
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [amountError, setAmountError] = useState('');
  
  const [isConfirmingTx, setIsConfirmingTx] = useState(false);
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

  const assetSymbols = useMemo(() => ['ETH', 'USDC', 'WBTC', 'STRW'], []);

  const updateAssetPrices = useCallback(async () => {
    setAssetStatus('loading');
    try {
      const prices = await fetchAssetPrices(assetSymbols);
      
      setAssets(prevAssets => {
        const newAssets = [
          { name: 'Ethereum', ticker: 'ETH', id: 1027, balance: wallet.balance, priceUSD: 0, change5m: 0, icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png' },
          { name: 'USD Coin', ticker: 'USDC', id: 3408, balance: 1050.23, priceUSD: 0, change5m: 0, icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png' },
          { name: 'Wrapped BTC', ticker: 'WBTC', id: 3717, balance: 0.00, priceUSD: 0, change5m: 0, icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3717.png' },
          { name: 'Strawberry Token', ticker: 'STRW', id: 0, balance: 50000, priceUSD: 0.002, change5m: 5.5, icon: '/strawberry-logo.svg' }
        ];

        return newAssets.map(asset => {
            const priceData = prices[asset.ticker];
            if (priceData) {
                return {
                    ...asset,
                    priceUSD: priceData.price,
                    // Note: CMC basic plan doesn't provide 5m change, so we simulate it.
                    change5m: (Math.random() - 0.5) * 2,
                };
            }
            return asset;
        });
      });
      setAssetStatus('success');
    } catch (error) {
      console.error('Failed to fetch asset prices:', error);
      setAssetStatus('error');
       toast({
        title: 'Error de Red',
        description: 'No se pudieron cargar los precios de los activos. Por favor, inténtelo de nuevo más tarde.',
        variant: 'destructive',
      });
    }
  }, [assetSymbols, wallet.balance, toast]);

  useEffect(() => {
    updateAssetPrices(); // Fetch on initial load
    const interval = setInterval(updateAssetPrices, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [updateAssetPrices]);
  
  const totalBalanceUSD = useMemo(() => {
    return assets.reduce((total, asset) => total + (asset.balance * asset.priceUSD), 0);
  }, [assets]);
  

  const maxSendableAmount = useMemo(() => {
    const max = wallet.balance - gasCost;
    return max > 0 ? max : 0;
  }, [wallet.balance, gasCost]);

  useEffect(() => {
    setIsCalculatingGas(true);
    const timer = setTimeout(() => {
      if (toAddress && parseFloat(amount) > 0) {
        // Simulate gas calculation based on inputs
        const newGas = 0.00030 + Math.random() * 0.00030; // Random gas between 0.00030 and 0.00060
        const newAvg = 0.00045 + (Math.random() - 0.5) * 0.00005; //Slightly vary the average
        setGasCost(newGas);
        setAverageGas(newAvg);
      } else {
        // Set a default gas cost if inputs are empty for max calculation
        setGasCost(0.00042);
        setAverageGas(0.00045);
      }
      setIsCalculatingGas(false);
    }, 500); // Simulate network/calculation delay

    return () => clearTimeout(timer);
  }, [toAddress, amount]);
  
  useEffect(() => {
    const handleEnsLookup = async () => {
      let query = toAddress.trim();
      if (!query) {
        setEnsResolution({ status: 'idle', address: null });
        return;
      }

      // If it doesn't look like an address and doesn't end with .eth, assume it's an ENS name
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

    if (newAmount) {
      const numericAmount = parseFloat(newAmount);
      if (isNaN(numericAmount)) {
        setAmountError(t.invalidNumberError);
      } else if (numericAmount < 0) {
        setAmountError(t.negativeAmountError);
      } else if (numericAmount + gasCost > wallet.balance) {
        setAmountError(t.insufficientBalanceError);
      } else {
        setAmountError('');
      }
    } else {
      setAmountError('');
    }
  };

  const handleSetMaxAmount = () => {
    const maxAmountStr = maxSendableAmount.toFixed(18).replace(/\.?0+$/, ''); // Use high precision then trim
    setAmount(maxAmountStr);
    // Trigger validation with the new amount
    const numericAmount = parseFloat(maxAmountStr);
    if (numericAmount + gasCost > wallet.balance) {
      setAmountError(t.insufficientBalanceError);
    } else {
      setAmountError('');
    }
  };


  const executeSend = async () => {
    setIsConfirmingTx(false);

    const finalAddress = ensResolution.status === 'success' ? ensResolution.address : toAddress;

    if (!finalAddress || !amount || amountError) {
      toast({ title: t.invalidInfoTitle, description: t.invalidInfoDesc, variant: 'destructive' });
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(finalAddress)) {
      toast({ title: t.invalidAddressTitle, description: t.invalidAddressDesc, variant: 'destructive' });
      return;
    }

    setIsSending(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      const tx = sendTransaction(wallet, finalAddress, parseFloat(amount));
      onTransactionSent(tx);
      setToAddress('');
      setAmount('');
    } catch (error) {
      const err = error as Error;
      toast({ title: t.txFailedTitle, description: err.message, variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendClick = () => {
    // Final check before proceeding
    const numericAmount = parseFloat(amount);
    if (numericAmount + gasCost > wallet.balance) {
        setAmountError(t.insufficientBalanceError);
        toast({ title: t.error, description: t.insufficientBalanceError, variant: 'destructive' });
        return;
    }

    if (gasCost > averageGas) {
      setIsConfirmingTx(true);
    } else {
      executeSend();
    }
  };
  
  const handleHighGasCancel = () => {
    setIsConfirmingTx(false);
    // Use a short timeout to prevent dialogs from overlapping awkwardly
    setTimeout(() => {
      setNotificationAddress(toAddress);
      setNotificationAmount(amount);
      setShowGasNotifyPrompt(true);
    }, 150);
  };

  const handleSetupGasNotification = () => {
    // In a real app, this would subscribe to a push service.
    // Here, we just show a confirmation toast.
    toast({
        title: t.gasAlertSetTitle,
        description: t.gasAlertSetDesc(notificationAmount, notificationAddress),
    });
    setShowGasNotifyPrompt(false);
    setNotificationAddress('');
    setNotificationAmount('');
  };

  const handleQrScan = (data: string | null) => {
    if (data) {
        setScannerOpen(false);
        // Basic validation for an Ethereum address
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
               <div className='flex justify-between items-center'>
                <div>
                  <Label>{t.totalBalanceLabel}</Label>
                   <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">
                       {showBalances ? `$${totalBalanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••'}
                    </p>
                  </div>
                </div>
                 <Button variant="ghost" size="icon" onClick={() => setShowBalances(!showBalances)} className="h-8 w-8">
                  {showBalances ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>

               <div className="flex items-center justify-between">
                <Label>{t.yourWalletAddressLabel}</Label>
                <div className="flex items-center">
                  <Dialog>
                    <DialogTrigger asChild>
                       <Button variant="ghost" size="icon" className="h-8 w-8">
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
            
            <Separator />
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">{t.assetsTitle}</h3>
                 <div className="flex items-center space-x-2">
                  <Label htmlFor="hide-zero" className="text-sm text-muted-foreground">{t.hideZeroBalancesLabel}</Label>
                  <Switch
                    id="hide-zero"
                    checked={hideZeroBalances}
                    onCheckedChange={setHideZeroBalances}
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
                <AssetList assets={assets} showBalances={showBalances} hideZeroBalances={hideZeroBalances} t={t} />
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
                        <Button variant="outline" size="icon" disabled={isSending}>
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
              <div className="space-y-1">
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
                {amountError && <p className="text-sm font-medium text-destructive">{amountError}</p>}
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
        
        {/* High Gas Warning Dialog */}
        <AlertDialog open={isConfirmingTx} onOpenChange={setIsConfirmingTx}>
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
        
        {/* Notify on Gas Drop Dialog */}
        <AlertDialog open={showGasNotifyPrompt} onOpenChange={setShowGasNotifyPrompt}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                      <BellRing className="text-primary"/>
                      {t.getNotifiedTitle}
                  </AlertDialogTitle>
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
    </>
  );
}
