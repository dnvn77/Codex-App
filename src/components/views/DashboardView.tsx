
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

interface DashboardViewProps {
  wallet: Wallet;
  onTransactionSent: (transaction: Transaction) => void;
  onDisconnect: () => void;
}

const GasFeeDisplay = ({ gasCost, averageGas, isLoading }: { gasCost: number; averageGas: number; isLoading: boolean }) => {
  const colorClass = gasCost > averageGas ? 'text-destructive' : gasCost < averageGas ? 'text-green-500' : 'text-foreground';

  if (isLoading) {
    return (
      <div className="text-xs text-muted-foreground text-right space-y-1">
        <p>Calculating gas...</p>
        <p>Average: ...</p>
      </div>
    )
  }

  return (
    <div className="text-xs text-muted-foreground text-right space-y-1">
      <p>
        Est. Gas Fee: <span className={cn("font-semibold", colorClass)}>{gasCost.toFixed(5)} ETH</span>
      </p>
      <p>
        Average Fee: <span>{averageGas.toFixed(5)} ETH</span>
      </p>
    </div>
  );
};


export function DashboardView({ wallet, onTransactionSent, onDisconnect }: DashboardViewProps) {
  const { toast } = useToast();
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

  useEffect(() => {
    setIsCalculatingGas(true);
    const timer = setTimeout(() => {
      if (toAddress && parseFloat(amount) > 0) {
        // Simulate gas calculation based on inputs
        const newGas = 0.00030 + Math.random() * 0.00030; // Random gas between 0.00030 and 0.00060
        const newAvg = 0.00045 + (Math.random() - 0.5) * 0.00005; //Slightly vary the average
        setGasCost(newGas);
        setAverageGas(newAvg);
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
      title: 'Address Copied!',
      description: 'Your wallet address is in the clipboard.',
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value;
    setAmount(newAmount);

    if (newAmount) {
      const numericAmount = parseFloat(newAmount);
      if (numericAmount < 0) {
        setAmountError('Amount cannot be negative.');
      } else if (numericAmount > wallet.balance) {
        setAmountError('Insufficient balance.');
      } else {
        setAmountError('');
      }
    } else {
      setAmountError('');
    }
  };

  const executeSend = async () => {
    setIsConfirmingTx(false);

    const finalAddress = ensResolution.status === 'success' ? ensResolution.address : toAddress;

    if (!finalAddress || !amount || amountError) {
      toast({ title: 'Invalid Information', description: 'Please correct the errors before sending.', variant: 'destructive' });
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(finalAddress)) {
      toast({ title: 'Invalid Address', description: 'Please enter a valid Ethereum address or a valid ENS name.', variant: 'destructive' });
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
      toast({ title: 'Transaction Failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendClick = () => {
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
        title: "Gas Alert Set!",
        description: `We'll notify you when it's cheaper to send ${notificationAmount} ETH to ${notificationAddress.slice(0, 6)}...`,
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
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Wallet Dashboard</CardTitle>
          <Button variant="ghost" size="sm" onClick={onDisconnect}>
            <LogOut className="mr-2 h-4 w-4"/>
            Disconnect
          </Button>
        </div>
        <CardDescription>Send private transactions on the Sepolia testnet.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-secondary/50">
            <Label>Your Wallet Address</Label>
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
              <h3 className="text-lg font-medium">Send Transaction</h3>
              <GasFeeDisplay gasCost={gasCost} averageGas={averageGas} isLoading={isCalculatingGas} />
             </div>
            <div className="space-y-1">
              <Label htmlFor="toAddress">Destination Address or ENS Name</Label>
              <Input
                id="toAddress"
                placeholder="0x... or vitalik.eth"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                disabled={isSending}
              />
               {ensResolution.status !== 'idle' && (
                <div className="text-xs pt-1 flex items-center gap-2">
                  {ensResolution.status === 'loading' && <> <Loader2 className="h-3 w-3 animate-spin"/>Resolving ENS name...</>}
                  {ensResolution.status === 'success' && <><CheckCircle className="h-4 w-4 text-green-500" /> <span className="font-mono text-muted-foreground">{ensResolution.address}</span></>}
                  {ensResolution.status === 'error' && <><XCircle className="h-4 w-4 text-destructive" /> <span className="text-destructive">Could not resolve ENS name.</span></>}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="amount">Amount (ETH)</Label>
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
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
            ) : (
                <><Send className="mr-2 h-4 w-4" /> Send Privately</>
            )}
        </Button>
      </CardFooter>
      
      {/* High Gas Warning Dialog */}
      <AlertDialog open={isConfirmingTx} onOpenChange={setIsConfirmingTx}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive" />
              High Gas Fee Warning
            </AlertDialogTitle>
            <AlertDialogDescription>
              The estimated gas fee for this transaction is higher than average right now. Are you sure you want to proceed?
              <div className="grid grid-cols-2 gap-x-4 my-4 text-foreground">
                  <span className="font-semibold">Average Fee:</span>
                  <span className="font-mono text-right">{averageGas.toFixed(5)} ETH</span>
                  <span className="font-semibold text-destructive">Current Fee:</span>
                  <span className="font-mono text-right text-destructive">{gasCost.toFixed(5)} ETH</span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleHighGasCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeSend} className={cn(buttonVariants({variant: "destructive"}))}>
              Send Anyway
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
                    Get Notified?
                </AlertDialogTitle>
                <AlertDialogDescription>
                    Would you like to receive a push notification when the gas fee for this transaction is lower?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>No, thanks</AlertDialogCancel>
                <AlertDialogAction onClick={handleSetupGasNotification}>
                    Yes, notify me
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
