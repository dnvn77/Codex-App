
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { sendTransaction, resolveEnsName } from '@/lib/wallet';
import type { Wallet, Transaction } from '@/lib/types';
import { Send, Copy, LogOut, Loader2, AlertTriangle, BellRing, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { Chatbot } from '@/components/shared/Chatbot';
import { useTranslations } from '@/hooks/useTranslations';

interface DashboardViewProps {
  wallet: Wallet;
  onTransactionSent: (transaction: Transaction) => void;
  onDisconnect: () => void;
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


export function DashboardView({ wallet, onTransactionSent, onDisconnect }: DashboardViewProps) {
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
      if (toAddress.endsWith('.eth')) {
        setEnsResolution({ status: 'loading', address: null });
        const resolvedAddress = await resolveEnsName(toAddress);
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


  const truncatedAddress = `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;
  
  const isSendDisabled = useMemo(() => {
    const addressInvalid = ensResolution.status === 'error' || (!toAddress.endsWith('.eth') && !/^0x[a-fA-F0-9]{40}$/.test(toAddress));
    return isSending || !toAddress || !amount || !!amountError || parseFloat(amount) <= 0 || isCalculatingGas || ensResolution.status === 'loading' || addressInvalid;
  }, [isSending, toAddress, amount, amountError, isCalculatingGas, ensResolution]);

  return (
    <>
      <Card className="w-full shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t.dashboardTitle}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onDisconnect}>
              <LogOut className="mr-2 h-4 w-4"/>
              {t.disconnectButton}
            </Button>
          </div>
          <CardDescription>{t.dashboardDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <Label>{t.yourWalletAddressLabel}</Label>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-mono text-primary">{truncatedAddress}</p>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyAddress}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-2xl font-bold mt-2">{wallet.balance.toFixed(4)} ETH <span className="text-sm font-normal text-muted-foreground">(Sepolia)</span></p>
            </div>

            <div className="space-y-2 pt-4">
               <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium">{t.sendTxTitle}</h3>
                <GasFeeDisplay gasCost={gasCost} averageGas={averageGas} isLoading={isCalculatingGas} t={t} />
               </div>
              <div className="space-y-1">
                <Label htmlFor="toAddress">{t.destinationAddressLabel}</Label>
                <Input
                  id="toAddress"
                  placeholder="0x... or vitalik.eth"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  disabled={isSending}
                />
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
      <Chatbot />
    </>
  );
}
