
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/hooks/useTranslations";
import { Search, Send, MessageSquare, ArrowLeft, DollarSign, Loader2, CheckCircle, XCircle, ShieldAlert, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from '../ui/label';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { sendTransaction, resolveEnsName, unlockWallet } from '@/lib/wallet';
import type { Wallet, Transaction, Asset } from '@/lib/types';
import { fetchAssetPrices, type AssetPriceOutput } from '@/ai/flows/assetPriceFlow';
import * as htmlToImage from 'html-to-image';
import { TransactionReceiptMessage } from './TransactionReceiptMessage';


const initialChats = [
  { id: 1, name: "Alice Cooper", address: "0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c", avatar: "https://placehold.co/100x100.png", lastMessage: "I'm doing great! Just sent you some ETH...", time: "17:53", unread: 0 },
  { id: 2, name: "Bob", address: "0x2B8b3A2C2E0C0E4E6E3b3b3D0A2c2E0C0E4E6E3b", avatar: "https://placehold.co/100x100.png", lastMessage: "See you tomorrow!", time: "1:20 PM", unread: 0 },
  { id: 3, name: "Charlie", address: "0x3C3C3C3C3C3C3C3C3C3C3C3C3C3C3C3C3C3C3C3C", avatar: "https://placehold.co/100x100.png", lastMessage: "Thanks!", time: "Yesterday", unread: 0 },
  { id: 4, name: "David", address: "0x4D4D4D4D4D4D4D4D4D4D4D4D4D4D4D4D4D4D4D4D", avatar: "https://placehold.co/100x100.png", lastMessage: "Sounds good.", time: "Yesterday", unread: 1 },
];

const initialMessages = [
  { id: 1, sender: "Alice Cooper", text: "Hey! How are you doing?", time: "17:43", sent: true, type: 'text' },
  { id: 2, sender: "Me", text: "I'm doing great! Just sent you some ETH for the dinner we had yesterday", time: "17:53", sent: false, type: 'text' },
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


interface ChatViewProps {
    wallet: Wallet;
}


export function ChatView({ wallet }: ChatViewProps) {
  const t = useTranslations();
  const { toast } = useToast();
  const [chats, setChats] = useState(initialChats);
  const [selectedChat, setSelectedChat] = useState(chats[0]);
  const [messages, setMessages] = useState<any[]>(initialMessages);
  const [messageInput, setMessageInput] = useState('');
  
  // Wallet state
  const [isTxDialogOpen, setTxDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedAssetTicker, setSelectedAssetTicker] = useState('ETH');
  const [isSending, setIsSending] = useState(false);
  const [amountError, setAmountError] = useState('');
  const [gasCost, setGasCost] = useState(0.00042);
  const [averageGas, setAverageGas] = useState(0.00045);
  const [isCalculatingGas, setIsCalculatingGas] = useState(true);
  const [assets, setAssets] = useState<Asset[]>([]); 
  const [assetStatus, setAssetStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [priceData, setPriceData] = useState<AssetPriceOutput>([]);
  const [isAssetSelectorOpen, setAssetSelectorOpen] = useState(false);
  const [isAmountConfirmOpen, setAmountConfirmOpen] = useState(false);
  const [isPasswordConfirmOpen, setPasswordConfirmOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
   const [mockBalances, setMockBalances] = useState<Record<string, number>>({
    'ETH': wallet.balance,
    'USDC': 1520.75,
    'WBTC': 0.03,
    'CDX': 12500,
    'LINK': 150.2,
    'UNI': 300,
  });

  const updateAssetPrices = useCallback(async () => {
    setAssetStatus('loading');
    try {
        const ALL_EVM_ASSETS = [
            { name: 'Ethereum', ticker: 'ETH', id: 1027 },
            { name: 'USD Coin', ticker: 'USDC', id: 3408 },
            { name: 'Wrapped BTC', ticker: 'WBTC', id: 3717 },
            { name: 'Codex Token', ticker: 'CDX', id: 0 }
        ];
        const fetchedPriceData = await fetchAssetPrices({ symbols: ALL_EVM_ASSETS.map(a => a.ticker) });
        setPriceData(fetchedPriceData);
        setAssetStatus('success');
    } catch (error) {
        console.error("Failed to fetch asset prices:", error);
        setAssetStatus('error');
    }
  }, []);

  useEffect(() => {
    updateAssetPrices();
  }, [updateAssetPrices]);
  
  useEffect(() => {
      if (priceData.length > 0) {
          const combinedAssets = priceData.map(asset => ({
              ...asset,
              balance: mockBalances[asset.ticker] || 0,
              isFavorite: false,
          })).sort((a, b) => {
              const valueA = a.balance * a.priceUSD;
              const valueB = b.balance * a.priceUSD;
              if (valueB !== valueA) return valueB - valueA;
              return a.ticker.localeCompare(b.ticker);
          });
          setAssets(combinedAssets);
      }
  }, [priceData, mockBalances]);

  const selectedAsset = useMemo(() => {
    return assets.find(a => a.ticker === selectedAssetTicker) || null;
  }, [assets, selectedAssetTicker]);
  
  const ethPrice = useMemo(() => {
    return priceData.find(a => a.ticker === 'ETH')?.priceUSD || 3500;
  }, [priceData]);
  
  const maxSendableAmount = useMemo(() => {
    if (!selectedAsset || typeof selectedAsset.balance !== 'number') return 0;
    
    if (selectedAsset.ticker === 'ETH') {
      const max = selectedAsset.balance - gasCost;
      return max > 0 ? max : 0;
    }
    return selectedAsset.balance;
  }, [selectedAsset, gasCost]);
  
   const amountInEth = useMemo(() => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || ethPrice === 0) return 0;
    return numericAmount / ethPrice;
  }, [amount, ethPrice]);

  useEffect(() => {
    setIsCalculatingGas(true);
    const timer = setTimeout(() => {
        setGasCost(0.00042 + Math.random() * 0.0001);
        setAverageGas(0.00045 + (Math.random() - 0.5) * 0.00005);
        setIsCalculatingGas(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [amount, selectedAssetTicker]);


  const handleSendMessage = () => {
    if (messageInput.trim() === '') return;
    const newMessage = {
      id: messages.length + 1,
      sender: 'Me',
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      sent: false,
      type: 'text'
    };
    setMessages([...messages, newMessage]);
    setMessageInput('');
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value;
    setAmount(newAmount);
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
        if (amountInEth > balance) {
            setAmountError(t.insufficientTokenBalanceError(selectedAsset?.ticker || 'tokens'));
        } else if (amountInEth > maxSendableAmount) {
            setAmountError(t.insufficientGasError);
        } else {
            setAmountError('');
        }
    }
  };
  
   const handleSetMaxAmount = () => {
    if (!selectedAsset || selectedAssetTicker !== 'ETH') return;
    const maxEth = maxSendableAmount;
    const maxUsd = maxEth * ethPrice;
    const maxAmountStr = maxUsd.toFixed(2);
    setAmount(maxAmountStr);
    validateAmount(maxAmountStr);
  };
  
  const executeSend = async () => {
    setAmountConfirmOpen(false);
    setPasswordConfirmOpen(false);
    
    if (!selectedAsset) return;

    setIsSending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const tx = sendTransaction(wallet, selectedChat.address, amountInEth, selectedAsset.ticker, selectedAsset.icon);
      
      // Create receipt component in memory
      const receiptNode = document.createElement('div');
      receiptNode.style.width = '350px';
      document.body.appendChild(receiptNode);

      const receiptComponent = <TransactionReceiptMessage transaction={tx} contactName={selectedChat.name} />;
      const tempRoot = (await import('react-dom/client')).createRoot(receiptNode);
      tempRoot.render(receiptComponent);
      
      // Give it a moment to render before taking a screenshot
      await new Promise(r => setTimeout(r, 100));

      const dataUrl = await htmlToImage.toPng(receiptNode, { quality: 0.95 });
      
      document.body.removeChild(receiptNode);
      
      const receiptMessage = {
        id: messages.length + 1,
        sender: 'Me',
        type: 'receipt',
        receiptData: dataUrl,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        sent: false
      };
      
      const linkMessage = {
        id: messages.length + 2,
        sender: 'Me',
        type: 'link',
        text: `https://sepolia.scrollscan.com/tx/${tx.txHash}`,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        sent: false
      }

      setMessages([...messages, receiptMessage, linkMessage]);

      setMockBalances(prev => ({
          ...prev,
          [selectedAsset.ticker]: Math.max(0, (prev[selectedAsset.ticker] || 0) - amountInEth),
          ETH: Math.max(0, prev.ETH - gasCost)
      }));
      
      toast({ title: "Transaction Sent", description: `You sent ${amountInEth.toFixed(4)} ${selectedAsset.ticker} to ${selectedChat.name}` });

    } catch (error) {
      toast({ title: t.txFailedTitle, description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsSending(false);
      setTxDialogOpen(false);
      setAmount('');
    }
  };
  
  const handleSendClick = () => {
    if (amountError) {
        toast({ title: t.error, description: amountError, variant: 'destructive' });
        return;
    }
    const usdValue = parseFloat(amount) || 0;
    if (usdValue >= 3000) {
        setPasswordConfirmOpen(true);
    } else if (usdValue >= 1000) {
        setAmountConfirmOpen(true);
    } else {
        executeSend();
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
  
  const isSendDisabled = isSending || !amount || !!amountError || parseFloat(amount) <= 0 || isCalculatingGas || selectedAssetTicker !== 'ETH';
  
  const allAssetsWithIcons = useMemo(() => {
    return assets.map(asset => ({
        ...asset,
        icon: asset.icon || '/strawberry-logo.svg',
    }));
  }, [assets]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-8rem)]">
      {/* Chat List */}
      <div className="md:col-span-1 bg-card border rounded-lg p-4 flex flex-col">
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t.search} className="pl-8" />
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {chats.map((chat) => (
              <Button
                key={chat.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-auto p-2",
                  selectedChat.id === chat.id && "bg-accent"
                )}
                onClick={() => setSelectedChat(chat)}
              >
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={chat.avatar} alt={chat.name} data-ai-hint="person avatar"/>
                  <AvatarFallback>{chat.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="font-semibold">{chat.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>
                <div className="text-xs text-muted-foreground self-start">{chat.time}</div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Message View */}
      <div className="md:col-span-2 bg-card border rounded-lg flex flex-col h-full">
        {selectedChat ? (
          <>
            <div className="p-4 border-b flex items-center justify-between">
              <div className='flex items-center'>
                 <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={() => {
                     // This is a placeholder for back navigation on mobile
                     console.log("Back button clicked");
                 }}>
                    <ArrowLeft className="h-5 w-5" />
                 </Button>
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={selectedChat.avatar} alt={selectedChat.name} data-ai-hint="person avatar"/>
                  <AvatarFallback>{selectedChat.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-lg font-semibold">{selectedChat.name}</h2>
                    <p className="text-sm text-green-500 flex items-center">
                        <span className="h-2 w-2 bg-green-500 rounded-full mr-1.5"></span>
                        En línea
                    </p>
                </div>
              </div>
              
              <Dialog open={isTxDialogOpen} onOpenChange={setTxDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Enviar
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enviar a {selectedChat.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-medium">Detalles</h3>
                          <GasFeeDisplay gasCost={gasCost} averageGas={averageGas} isLoading={isCalculatingGas} t={t} />
                        </div>
                        <div className="grid grid-cols-5 gap-2 items-end pt-2">
                          <div className="col-span-3 space-y-1">
                              <div className="flex justify-between items-end h-6 mb-1">
                                  <Label htmlFor="amount">{t.amountLabel}</Label>
                                  <button onClick={handleSetMaxAmount} className="text-xs text-primary hover:underline" disabled={isCalculatingGas || selectedAssetTicker !== 'ETH'}>
                                    {t.maxAmountLabel}: ${((maxSendableAmount * ethPrice) || 0).toFixed(2)}
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
                                  {amount && selectedAssetTicker === 'ETH' && !amountError && (
                                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                          ({amountInEth.toFixed(5)} ETH)
                                      </span>
                                  )}
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
                                          {allAssetsWithIcons.map((asset) => (
                                              <CommandItem
                                              key={asset.ticker}
                                              value={asset.name}
                                              onSelect={() => {
                                                  setSelectedAssetTicker(asset.ticker);
                                                  setAmount('');
                                                  setAmountError('');
                                                  setAssetSelectorOpen(false);
                                              }}
                                              >
                                              <CheckCircle
                                                  className={cn( "mr-2 h-4 w-4", selectedAssetTicker === asset.ticker ? "opacity-100" : "opacity-0" )}
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
                        {amountError && <p className="text-sm font-medium text-destructive">{amountError}</p>}
                    </div>
                    <DialogFooter>
                      <Button onClick={handleSendClick} disabled={isSendDisabled} className="w-full">
                          {isSending ? (
                              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.sendingButton}</>
                          ) : (
                              <><Send className="mr-2 h-4 w-4" /> {t.sendPrivatelyButton}</>
                          )}
                      </Button>
                    </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <ScrollArea className="flex-1 p-4 bg-background/90">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex items-end gap-2",
                      !message.sent ? "justify-end" : "justify-start"
                    )}
                  >
                    {!message.sent && (
                        <p className="text-xs text-muted-foreground self-end">{message.time}</p>
                    )}
                    {message.type === 'text' && (
                       <div
                        className={cn(
                          "p-3 rounded-lg max-w-xs",
                          message.sent
                            ? "bg-secondary"
                            : "bg-primary text-primary-foreground"
                        )}
                       >
                        <p>{message.text}</p>
                       </div>
                    )}
                     {message.type === 'receipt' && (
                        <img src={message.receiptData} alt="Transaction Receipt" className="rounded-lg border border-primary/20 w-full max-w-xs" />
                     )}
                     {message.type === 'link' && (
                         <div className="p-3 rounded-lg max-w-xs bg-primary text-primary-foreground">
                            <a href={message.text} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">
                                {message.text}
                            </a>
                         </div>
                     )}
                     {message.sent && (
                         <p className="text-xs text-muted-foreground self-end">{message.time}</p>
                     )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <div className="relative">
                <Input
                  placeholder="Type a message..."
                  className="pr-10"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquare className="h-16 w-16 mb-4" />
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>

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
                  <p><b>To:</b> {selectedChat.name} ({selectedChat.address})</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={executeSend}>
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
    </div>
  );
}
