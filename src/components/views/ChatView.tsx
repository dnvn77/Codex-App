
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/hooks/useTranslations";
import { Search, Send, MessageSquare, ArrowLeft, DollarSign, Loader2, CheckCircle, XCircle, ShieldAlert, ShieldCheck, AlertTriangle, BellRing, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from '../ui/label';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { sendTransaction, resolveEnsName, unlockWallet, encryptMessage, decryptMessage, getMessagingKeys, type MessagingKeys } from '@/lib/wallet';
import type { Wallet, Transaction, Asset, Contact } from '@/lib/types';
import * as htmlToImage from 'html-to-image';
import { TransactionReceiptMessage } from './TransactionReceiptMessage';
import { logEvent } from '@/lib/analytics';
import { useFeedback } from '@/hooks/useFeedback';

interface MockMessage {
  id: number;
  conversationId: number;
  senderAddress: string;
  recipientAddress: string;
  encryptedContent: string; // Base64 encoded "encrypted" blob
  decryptedContent?: string; // Optional, only available if decrypted
  timestamp: string;
  type: 'text' | 'receipt' | 'link';
}

const mockContacts = [
  { id: 1, name: "Alice Cooper", address: "0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c", avatar: "https://placehold.co/100x100.png", lastMessage: "Doing great! Just sent you some ETH.", time: "17:53", unread: 0, publicKey: "pub_alice" },
  { id: 2, name: "Bob", address: "0x2B8b3A2C2E0C0E4E6E3b3b3D0A2c2E0C0E4E6E3b", avatar: "https://placehold.co/100x100.png", lastMessage: "See you tomorrow!", time: "1:20 PM", unread: 0, publicKey: "pub_bob" },
  { id: 3, name: "Charlie", address: "0x3C3C3C3C3C3C3C3C3C3C3C3C3C3C3C3C3C3C3C3C", avatar: "https://placehold.co/100x100.png", lastMessage: "Thanks!", time: "Yesterday", unread: 0, publicKey: "pub_charlie" },
  { id: 4, name: "David", address: "0x4D4D4D4D4D4D4D4D4D4D4D4D4D4D4D4D4D4D4D4D", avatar: "https://placehold.co/100x100.png", lastMessage: "Sounds good.", time: "Yesterday", unread: 1, publicKey: "pub_david" },
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
    assets: Asset[];
    onTransactionSuccess: (ticker: string, amount: number, gasCost: number) => void;
}


export function ChatView({ wallet, assets, onTransactionSuccess }: ChatViewProps) {
  const t = useTranslations();
  const { toast } = useToast();
  const { triggerFeedbackEvent } = useFeedback();

  // E2EE state
  const [messagingKeys, setMessagingKeys] = useState<MessagingKeys | null>(null);
  const [allMessages, setAllMessages] = useState<MockMessage[]>([]);

  // UI State
  const [chats, setChats] = useState(mockContacts);
  const [selectedChat, setSelectedChat] = useState<typeof chats[0] | null>(null);
  const [decryptedMessages, setDecryptedMessages] = useState<MockMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mobile view state
  const [mobileView, setMobileView] = useState<'list' | 'conversation'>('list');

  // Wallet state
  const [isTxDialogOpen, setTxDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedAssetTicker, setSelectedAssetTicker] = useState('ETH');
  const [isSending, setIsSending] = useState(false);
  const [amountError, setAmountError] = useState('');
  const [gasCost, setGasCost] = useState(0.00042);
  const [averageGas, setAverageGas] = useState(0.00045);
  const [isCalculatingGas, setIsCalculatingGas] = useState(true);
  const [isAssetSelectorOpen, setAssetSelectorOpen] = useState(false);
  const [isAmountConfirmOpen, setAmountConfirmOpen] = useState(false);
  const [isPasswordConfirmOpen, setPasswordConfirmOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showHighGasConfirm, setShowHighGasConfirm] = useState(false);
  const [showGasNotifyPrompt, setShowGasNotifyPrompt] = useState(false);

  // Initialize messaging keys and mock messages on mount
  useEffect(() => {
    const keys = getMessagingKeys(wallet.masterKey);
    setMessagingKeys(keys);

    // Simulate fetching encrypted messages from a backend (Supabase)
    const initialMessages: MockMessage[] = [
      { id: 1, conversationId: 1, senderAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c", recipientAddress: wallet.address, encryptedContent: encryptMessage("Hey! How are you doing?", keys.privateKey, "pub_alice"), timestamp: "17:43", type: 'text' },
      { id: 2, conversationId: 1, senderAddress: wallet.address, recipientAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c", encryptedContent: encryptMessage("I'm doing great! Just sent you some ETH for the dinner we had yesterday", keys.privateKey, "pub_alice"), timestamp: "17:53", type: 'text' },
    ];
    setAllMessages(initialMessages);
  }, [wallet.masterKey, wallet.address]);


  // Decrypt messages for the selected chat
  useEffect(() => {
    if (!selectedChat || !messagingKeys) {
      setDecryptedMessages([]);
      return;
    }

    const conversationMessages = allMessages.filter(
      (msg) =>
        (msg.senderAddress === wallet.address && msg.recipientAddress === selectedChat.address) ||
        (msg.senderAddress === selectedChat.address && msg.recipientAddress === wallet.address)
    );

    const decrypted = conversationMessages.map((msg) => {
      const decryptedContent = decryptMessage(msg.encryptedContent, messagingKeys.privateKey);
      return { ...msg, decryptedContent };
    });

    setDecryptedMessages(decrypted);

  }, [selectedChat, allMessages, messagingKeys, wallet.address]);


  const filteredChats = useMemo(() => {
    return chats.filter(chat =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chats, searchQuery]);

  useEffect(() => {
    // Set initial chat on desktop
    if (window.innerWidth >= 768 && !selectedChat) {
      setSelectedChat(chats[0]);
    }
  }, [selectedChat, chats]);

  const selectedAsset = useMemo(() => {
    return assets.find(a => a.ticker === selectedAssetTicker) || null;
  }, [assets, selectedAssetTicker]);
  
  const ethPrice = useMemo(() => {
    return assets.find(a => a.ticker === 'ETH')?.priceUSD || 3500;
  }, [assets]);
  
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
    if (messageInput.trim() === '' || !selectedChat || !messagingKeys) return;

    const encryptedContent = encryptMessage(
        messageInput.trim(),
        messagingKeys.privateKey,
        selectedChat.publicKey
    );

    const newMessage: MockMessage = {
      id: allMessages.length + 1,
      conversationId: selectedChat.id,
      senderAddress: wallet.address,
      recipientAddress: selectedChat.address,
      encryptedContent,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      type: 'text'
    };
    // In a real app, this would be sent to the backend to be stored in Supabase
    setAllMessages([...allMessages, newMessage]);
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
    if (!selectedChat || !selectedAsset || !messagingKeys) return;
    
    setAmountConfirmOpen(false);
    setPasswordConfirmOpen(false);
    setShowHighGasConfirm(false);

    setIsSending(true);
    const txSentFirstTime = !localStorage.getItem('has_sent_tx');
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const tx = sendTransaction(wallet, selectedChat.address, amountInEth, selectedAsset.ticker, selectedAsset.icon);
      
      const receiptNode = document.createElement('div');
      receiptNode.style.width = '350px';
      document.body.appendChild(receiptNode);

      const receiptComponent = <TransactionReceiptMessage transaction={tx} contactName={selectedChat.name} />;
      const tempRoot = (await import('react-dom/client')).createRoot(receiptNode);
      tempRoot.render(receiptComponent);
      
      await new Promise(r => setTimeout(r, 100));

      const dataUrl = await htmlToImage.toPng(receiptNode, { quality: 0.95 });
      
      document.body.removeChild(receiptNode);
      
      const receiptMessage: MockMessage = {
        id: allMessages.length + 1,
        conversationId: selectedChat.id,
        senderAddress: wallet.address,
        recipientAddress: selectedChat.address,
        encryptedContent: encryptMessage(dataUrl, messagingKeys.privateKey, selectedChat.publicKey),
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        type: 'receipt'
      };
      
      const linkMessage: MockMessage = {
        id: allMessages.length + 2,
        conversationId: selectedChat.id,
        senderAddress: wallet.address,
        recipientAddress: selectedChat.address,
        encryptedContent: encryptMessage(`https://testnet.monadexplorer.com/tx/${tx.txHash}`, messagingKeys.privateKey, selectedChat.publicKey),
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        type: 'link'
      }

      setAllMessages([...allMessages, receiptMessage, linkMessage]);

      onTransactionSuccess(selectedAsset.ticker, amountInEth, gasCost);
      
      toast({ title: "Transaction Sent", description: `You sent ${amountInEth.toFixed(4)} ${selectedAsset.ticker} to ${selectedChat.name}` });

      if (txSentFirstTime) {
        localStorage.setItem('has_sent_tx', 'true');
        triggerFeedbackEvent('tx_sent_first_time');
      }
      logEvent('send_transaction_success', { tx_hash: tx.txHash });

    } catch (error) {
      toast({ title: t.txFailedTitle, description: (error as Error).message, variant: 'destructive' });
      logEvent('send_transaction_fail', { error_message: (error as Error).message });
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
       if (gasCost > averageGas) {
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
      setShowGasNotifyPrompt(true);
    }, 150);
  };

  const handleSetupGasNotification = () => {
    toast({
        title: t.gasAlertSetTitle,
        description: t.gasAlertSetDesc(amount, selectedAssetTicker, selectedChat?.name || 'contact'),
    });
    setShowGasNotifyPrompt(false);
  };

  const isSendDisabled = isSending || !amount || !!amountError || parseFloat(amount) <= 0 || isCalculatingGas || selectedAssetTicker !== 'ETH';
  
  const handleSelectChat = (chat: typeof chats[0]) => {
      setSelectedChat(chat);
      setMobileView('conversation');
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
      {/* Chat List */}
      <div className={cn(
          "md:col-span-1 bg-card border rounded-lg p-4 flex-col",
          mobileView === 'list' ? 'flex' : 'hidden md:flex'
      )}>
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={t.search} 
            className="pl-8" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <ScrollArea className="flex-1 -mx-4">
          <div className="space-y-1 px-4">
            {filteredChats.map((chat) => (
              <Button
                key={chat.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-auto p-2",
                  selectedChat?.id === chat.id && "bg-accent"
                )}
                onClick={() => handleSelectChat(chat)}
              >
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={chat.avatar} alt={chat.name} data-ai-hint="person avatar"/>
                  <AvatarFallback>{chat.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold truncate">{chat.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>
                <div className="text-xs text-muted-foreground self-start ml-2">{chat.time}</div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Message View */}
       <div className={cn(
        "md:col-span-2 bg-card border rounded-lg flex-col h-full",
        mobileView === 'conversation' ? 'flex' : 'hidden md:flex'
      )}>
        {selectedChat ? (
          <>
            <div className="p-4 border-b flex items-center justify-between">
              <div className='flex items-center'>
                 <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={() => setMobileView('list')}>
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
                        Online
                    </p>
                </div>
              </div>
              
              <Dialog open={isTxDialogOpen} onOpenChange={setTxDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Send
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send to {selectedChat.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-medium">Details</h3>
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
                                          {assets.map((asset) => (
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
                {decryptedMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex items-end gap-2",
                      message.senderAddress === wallet.address ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.senderAddress === wallet.address && (
                        <p className="text-xs text-muted-foreground self-end">{message.timestamp}</p>
                    )}
                    {message.type === 'text' && (
                       <div
                        className={cn(
                          "p-3 rounded-lg max-w-xs",
                          message.senderAddress !== wallet.address
                            ? "bg-secondary"
                            : "bg-primary text-primary-foreground"
                        )}
                       >
                         {message.decryptedContent ? <p>{message.decryptedContent}</p> : <p className="flex items-center gap-2 italic text-muted-foreground"><Lock size={12}/>Encrypted Message</p>}
                       </div>
                    )}
                     {message.type === 'receipt' && message.decryptedContent && (
                        <img src={message.decryptedContent} alt="Transaction Receipt" className="rounded-lg border border-primary/20 w-full max-w-xs" />
                     )}
                     {message.type === 'link' && message.decryptedContent && (
                         <div className="p-3 rounded-lg max-w-xs bg-primary text-primary-foreground">
                            <a href={message.decryptedContent} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">
                                {message.decryptedContent}
                            </a>
                         </div>
                     )}
                     {message.senderAddress !== wallet.address && (
                         <p className="text-xs text-muted-foreground self-end">{message.timestamp}</p>
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
            <p className='hidden md:block'>Select a chat to start messaging</p>
            <p className='md:hidden'>Select a chat</p>
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
                  <p><b>To:</b> {selectedChat?.name} ({selectedChat?.address})</p>
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
    </div>
  );
}
