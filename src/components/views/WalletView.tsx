
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { sendTransaction, resolveEnsName, unlockWallet, calculateTransactionFee } from '@/lib/wallet';
import type { Wallet, Transaction, Asset, Contact } from '@/lib/types';
import { Send, Copy, Loader2, AlertTriangle, BellRing, CheckCircle, XCircle, QrCode, Eye, EyeOff, Info, Search, ShieldCheck, ShieldAlert, History, User } from 'lucide-react';
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
import { DetailedAssetChart } from '@/components/shared/DetailedAssetChart';
import { TransactionHistory } from '@/components/shared/TransactionHistory';
import { ContactsList } from '@/components/views/ContactsList';
import { logEvent } from '@/lib/analytics';
import { useFeedback } from '@/hooks/useFeedback';
import { ReceiptView } from './ReceiptView';

interface WalletViewProps {
  wallet: Wallet;
  assets: Asset[];
  onTransactionSuccess: (ticker: string, amount: number, gasCost: number) => void;
  assetStatus: 'loading' | 'success' | 'error';
  onRefreshPrices: () => void;
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

export function WalletView({ wallet, assets, onTransactionSuccess, assetStatus, onRefreshPrices }: WalletViewProps) {
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
  
  const [isAssetSelectorOpen, setAssetSelectorOpen] = useState(false);
  
  const [isAmountConfirmOpen, setAmountConfirmOpen] = useState(false);
  const [isPasswordConfirmOpen, setPasswordConfirmOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const [detailedChartAsset, setDetailedChartAsset] = useState<Asset | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isContactsOpen, setContactsOpen] = useState(false);
  
  const [sentTransaction, setSentTransaction] = useState<Transaction | null>(null);
  const [transactionFee, setTransactionFee] = useState({ fee: 0, percentage: 0 });
  
  const ethPrice = useMemo(() => {
    return assets.find(a => a.ticker === 'ETH')?.priceUSD || 3500;
  }, [assets]);

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
    if (!selectedAsset) return 0;
    
    // Calculate total cost in ETH: gas fee + transaction fee in ETH
    const feeInEth = (transactionFee.fee / ethPrice);
    const totalCostInEth = gasCost + feeInEth;

    if (selectedAsset.ticker === 'ETH') {
        const max = selectedAsset.balance - totalCostInEth;
        return max > 0 ? max : 0;
    }
    
    // For other tokens, we only check ETH balance for gas+tx fee
    const ethBalance = assets.find(a => a.ticker === 'ETH')?.balance || 0;
    if (ethBalance < totalCostInEth) return 0;
    
    return selectedAsset.balance;
}, [selectedAsset, assets, gasCost, transactionFee.fee, ethPrice]);


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
    const numericAmount = parseFloat(newAmount) || 0;
    setAmount(newAmount);
    setTransactionFee(calculateTransactionFee(numericAmount));
    validateAmount(newAmount);
  };
  
  const validateAmount = (value: string) => {
    if (selectedAssetTicker !== 'ETH') {
        setAmountError('Sending non-ETH assets is not yet supported.');
        return;
    }
    
    const numericAmountUSD = parseFloat(value);
    
    if (isNaN(numericAmountUSD) || numericAmountUSD <= 0) {
        setAmountError(t.invalidNumberError);
    } else {
        const amountInEth = numericAmountUSD / ethPrice;
        const balance = selectedAsset?.balance || 0;
        
        // Total cost includes amount to send, gas, and transaction fee
        const feeInEth = transactionFee.fee / ethPrice;
        const totalDeduction = amountInEth + gasCost + feeInEth;

        if (totalDeduction > balance) {
            setAmountError(t.insufficientTokenBalanceError(selectedAsset?.ticker || 'tokens'));
        } else {
            setAmountError('');
        }
    }
  };


  const handleSetMaxAmount = () => {
    if (!selectedAsset) return;
    
    let maxUsd = 0;
    if (selectedAsset.ticker === 'ETH') {
        const ethBalance = selectedAsset.balance;
        // This is an approximation since fee depends on amount. We can iterate or just use a good estimate.
        // Let's calculate max amount before fee, then adjust.
        const balanceAfterGas = (ethBalance - gasCost) * ethPrice;
        if (balanceAfterGas <= 0) {
            maxUsd = 0;
        } else {
            // Fee is a percentage of the amount. Amount_USD + Fee_USD = balanceAfterGas
            // Amount_USD * (1 + fee_percentage/100) = balanceAfterGas
            // Amount_USD = balanceAfterGas / (1 + fee_percentage/100)
            const feeTier = calculateTransactionFee(balanceAfterGas); // Get fee % at this tier
            maxUsd = balanceAfterGas / (1 + feeTier.percentage / 100);
        }
    } else {
        // For other tokens, max is just the token balance. Fee is paid in ETH.
        maxUsd = selectedAsset.balance * selectedAsset.priceUSD;
    }

    const maxAmountStr = maxUsd > 0 ? maxUsd.toFixed(2) : "0";
    setAmount(maxAmountStr);
    setTransactionFee(calculateTransactionFee(maxUsd));
    validateAmount(maxAmountStr);
  };

  const persistTransaction = async (tx: Transaction) => {
    try {
        const response = await fetch('/api/tx/log', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'X-API-Key': process.env.NEXT_PUBLIC_API_KEY_BACKEND!
            },
            body: JSON.stringify({
                from: tx.from,
                to: tx.to,
                txHash: tx.txHash,
                ticker: tx.ticker,
                amount: tx.amount,
                blockNumber: tx.l1SettlementBlock
            })
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to persist tx data:", errorData);
        }
    } catch(error) {
        console.error("Network error persisting tx data:", error);
    }
  };

  const amountInEth = useMemo(() => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || ethPrice === 0) return 0;
    return numericAmount / ethPrice;
  }, [amount, ethPrice]);

  const executeSend = async () => {
    setAmountConfirmOpen(false);
    setPasswordConfirmOpen(false);
    setShowHighGasConfirm(false);

    const finalAddress = ensResolution.status === 'success' ? ensResolution.address : toAddress;
    
    if (selectedAssetTicker !== 'ETH') {
        toast({ title: "Unsupported Asset", description: "Currently, only sending ETH is supported.", variant: 'destructive' });
        return;
    }

    if (!finalAddress || !amount || amountError || !selectedAsset || amountInEth <= 0) {
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
      amount: amountInEth,
      amount_usd: parseFloat(amount),
      gas_cost_eth: gasCost,
      is_ens: ensResolution.status === 'success',
    });

    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network latency
      const tx = sendTransaction(wallet, finalAddress, amountInEth, selectedAsset.ticker, selectedAsset.icon);
      
      await persistTransaction(tx);

      const feeInEth = transactionFee.fee / ethPrice;
      onTransactionSuccess(selectedAsset.ticker, amountInEth + feeInEth, gasCost);
      setSentTransaction({ ...tx, wallet }); // Show receipt view

      if (txSentFirstTime) {
        localStorage.setItem('has_sent_tx', 'true');
        triggerFeedbackEvent('tx_sent_first_time');
      }

      logEvent('send_transaction_success', { tx_hash: tx.txHash });
      setToAddress('');
      setAmount('');
      setTransactionFee({ fee: 0, percentage: 0 });
    } catch (error) {
      const err = error as Error;
      logEvent('send_transaction_fail', { error_message: err.message, error_code: 'tx_failed' });
      toast({ title: t.txFailedTitle, description: err.message, variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendClick = () => {
    if (selectedAssetTicker !== 'ETH') {
        toast({ title: "Unsupported Asset", description: "Currently, only sending ETH is supported.", variant: 'destructive' });
        return;
    }

    const usdValue = parseFloat(amount) || 0;
    
    if (amountError) {
        toast({ title: t.error, description: amountError, variant: 'destructive' });
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
        const unlocked = await unlockWallet(confirmPassword);
        if (!unlocked) throw new Error("Wrong password");
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
    return isSending || !toAddress || !amount || !!amountError || parseFloat(amount) <= 0 || isCalculatingGas || ensResolution.status === 'loading' || addressInvalid || selectedAssetTicker !== 'ETH';
  }, [isSending, toAddress, amount, amountError, isCalculatingGas, ensResolution, selectedAssetTicker]);
  
  const handleContactSelect = (contact: Contact) => {
      setToAddress(contact.address);
      setContactsOpen(false);
  }
  
  if(sentTransaction) {
    return <ReceiptView transaction={sentTransaction} onBack={() => setSentTransaction(null)} />
  }

  return (
    <div className='space-y-4'>
          <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-lg">{t.yourWalletAddressLabel}</p>
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
            <Separator className='my-2 bg-border/50'/>
             <div className='flex justify-between items-center'>
              <div>
                <Label>{t.totalBalanceLabel}</Label>
                 <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold">
                     {showBalances ? `$${totalBalanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••'}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-background/70 rounded-full px-2 py-0.5">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    Monad Testnet
                  </div>
                </div>
              </div>
                <Button variant="ghost" size="icon" onClick={() => { logEvent('balance_visibility_toggled', { visible: !showBalances }); setShowBalances(!showBalances); }} className="h-8 w-8 self-end">
                    {showBalances ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
            </div>
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
                  <p className="text-muted-foreground mt-2">{t.loadingPrices}</p>
              </div>
            )}
            {assetStatus === 'error' && (
              <div className="text-center py-8 text-destructive">
                  <AlertTriangle className="h-8 w-8 mx-auto" />
                  <p className="mt-2">{t.loadingPricesError}</p>
              </div>
            )}
            {assetStatus === 'success' && (
              <AssetList 
                assets={assets} 
                showBalances={showBalances} 
                hideZeroBalances={hideZeroBalances} 
                t={t} 
                onRefresh={onRefreshPrices}
                isRefreshing={assetStatus === 'loading'}
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
                  <Dialog open={isContactsOpen} onOpenChange={setContactsOpen}>
                     <DialogTrigger asChild>
                       <Button variant="outline" size="icon" disabled={isSending}>
                          <User className="h-5 w-5" />
                       </Button>
                     </DialogTrigger>
                     <DialogContent>
                        <ContactsList onContactSelect={handleContactSelect} />
                     </DialogContent>
                  </Dialog>
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
              <div className="col-span-3 space-y-1">
                  <div className="flex justify-between items-end h-6 mb-1">
                      <Label htmlFor="amount">{t.amountLabel}</Label>
                       <button onClick={handleSetMaxAmount} className="text-xs text-primary hover:underline" disabled={isCalculatingGas || !selectedAsset}>
                        {t.maxAmountLabel}: ${((maxSendableAmount * (selectedAsset?.priceUSD || 0)) || 0).toFixed(2)}
                      </button>
                  </div>
                  <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                          id="amount"
                          type="number"
                          placeholder="10.00"
                          value={amount}
                          onChange={handleAmountChange}
                          disabled={isSending || selectedAssetTicker !== 'ETH'}
                          className="pl-6"
                      />
                  </div>
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
                              {assets.map((asset) => (
                                  <CommandItem
                                  key={asset.ticker}
                                  value={asset.name}
                                  onSelect={() => {
                                      logEvent('asset_selected_for_send', { asset: asset.ticker });
                                      setSelectedAssetTicker(asset.ticker);
                                      setAmount('');
                                      setAmountError('');
                                      setTransactionFee({ fee: 0, percentage: 0 });
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
              {transactionFee.fee > 0 && (
                <div className="text-xs text-muted-foreground text-right mt-1">
                    (<span className="font-bold">Fee: ${transactionFee.fee.toFixed(2)} ({transactionFee.percentage}%)</span>)
                </div>
              )}
              {amountError && <p className="text-sm font-medium text-destructive mt-1">{amountError}</p>}
              {selectedAssetTicker !== 'ETH' && (
                  <div className="mt-2 text-xs text-muted-foreground flex items-start gap-2 p-2 bg-muted rounded-md">
                      <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <p>{t.tokenPortalInfo}</p>
                  </div>
              )}
            </div>
          </div>
        <div className="mt-4">
          <Button className="w-full" onClick={handleSendClick} disabled={isSendDisabled}>
              {isSending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.sendingButton}</>
              ) : (
                  <><Send className="mr-2 h-4 w-4" /> {t.sendPrivatelyButton}</>
              )}
          </Button>
        </div>
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
                <p><b>Amount:</b> {amountInEth.toLocaleString()} {selectedAsset?.ticker}</p>
                <p><b>Value:</b> ~${(parseFloat(amount)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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
                      For your security, please enter your password to authorize this transaction of ~${(parseFloat(amount)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.
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
    
     <Dialog open={!!detailedChartAsset} onOpenChange={() => setDetailedChartAsset(null)}>
      <DialogContent className="max-w-2xl">
          <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                  {detailedChartAsset?.icon && <Image src={detailedChartAsset.icon} alt={detailedChartAsset.name} width={24} height={24} />}
                  {detailedChartAsset?.name} ({detailedChartAsset?.ticker})
              </DialogTitle>
          </DialogHeader>
          <div className="h-96 w-full">
              {detailedChartAsset && <DetailedAssetChart asset={detailedChartAsset} />}
          </div>
      </DialogContent>
    </Dialog>
    </div>
  );
}
