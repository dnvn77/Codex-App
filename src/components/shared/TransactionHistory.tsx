
"use client";

import { useState, useEffect } from 'react';
import { fetchTransactionHistory, type TransactionHistoryOutput } from '@/ai/flows/transactionHistoryFlow';
import { Loader2, ArrowUpRight, ArrowDownLeft, AlertTriangle, Info, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { ShortenedLink } from './ShortenedLink';

interface TransactionHistoryProps {
  walletAddress: string;
}

export function TransactionHistory({ walletAddress }: TransactionHistoryProps) {
  const [history, setHistory] = useState<TransactionHistoryOutput>([]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [selectedTx, setSelectedTx] = useState<TransactionHistoryOutput[0] | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadHistory = async () => {
      setStatus('loading');
      try {
        const result = await fetchTransactionHistory({ address: walletAddress });
        setHistory(result);
        setStatus('success');
      } catch (error) {
        console.error("Failed to fetch transaction history:", error);
        setStatus('error');
        toast({
          title: "Error",
          description: "Could not load transaction history.",
          variant: "destructive",
        });
      }
    };
    loadHistory();
  }, [walletAddress, toast]);
  
  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast({
      title: 'Copied to clipboard!',
      description: `${label} has been copied.`,
    });
  };

  const TransactionItem = ({ tx }: { tx: TransactionHistoryOutput[0] }) => {
    const isClickable = tx.origin === 'strawberry';
    const isPrivate = tx.amount === null;
    const Icon = tx.type === 'out' ? ArrowUpRight : ArrowDownLeft;
    const color = tx.type === 'out' ? 'text-destructive' : 'text-green-500';

    return (
      <button
        className={cn(
          "w-full text-left p-3 rounded-lg border flex items-center justify-between gap-4 transition-colors",
          isClickable ? "hover:bg-accent/50 cursor-pointer" : "bg-muted/30 cursor-not-allowed opacity-70"
        )}
        onClick={() => isClickable && setSelectedTx(tx)}
        disabled={!isClickable}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={cn("p-2 rounded-full bg-secondary flex-shrink-0", color)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-grow overflow-hidden">
            <p className="font-semibold truncate">
              {tx.type === 'out' ? 'Sent' : 'Received'} {tx.ticker}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={cn("font-mono font-semibold", isPrivate && "italic text-muted-foreground")}>
            {isPrivate ? 'Private' : `${tx.amount?.toLocaleString()} ${tx.ticker}`}
          </p>
          <p className="text-xs text-muted-foreground font-mono truncate">
            To: {tx.address.slice(0, 6)}...{tx.address.slice(-4)}
          </p>
        </div>
      </button>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {status === 'loading' && (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading history...</span>
        </div>
      )}
      {status === 'error' && (
        <div className="flex-1 flex flex-col items-center justify-center text-destructive">
          <AlertTriangle className="h-10 w-10 mb-2" />
          <p>Failed to load transaction history.</p>
        </div>
      )}
      {status === 'success' && (
        <>
          {history.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p>No transactions in the last month.</p>
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="space-y-2 p-1">
                {history.map(tx => (
                  <TransactionItem key={tx.txHash} tx={tx} />
                ))}
              </div>
            </ScrollArea>
          )}
        </>
      )}

      {selectedTx && (
        <Dialog open={!!selectedTx} onOpenChange={(isOpen) => !isOpen && setSelectedTx(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>
                Details for transaction made with Strawberry Wallet.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium text-green-500 capitalize flex items-center gap-1"><Info className="h-4 w-4" /> {selectedTx.status}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{format(new Date(selectedTx.timestamp), 'PPpp')}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-mono font-medium">{selectedTx.amount === null ? 'Private' : `${selectedTx.amount.toLocaleString()} ${selectedTx.ticker}`}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">To Address</span>
                     <button onClick={() => handleCopy(selectedTx.address, "Address")} className="font-mono font-medium flex items-center gap-1 hover:text-primary">
                        {selectedTx.address.slice(0, 8)}...{selectedTx.address.slice(-6)}
                        <Copy className="h-3 w-3" />
                    </button>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Block Number</span>
                    <span className="font-mono font-medium">{selectedTx.blockNumber.toLocaleString()}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Transaction Hash</span>
                    <button onClick={() => handleCopy(selectedTx.txHash, "Transaction Hash")} className="font-mono font-medium flex items-center gap-1 hover:text-primary">
                        {selectedTx.txHash.slice(0, 8)}...{selectedTx.txHash.slice(-6)}
                        <Copy className="h-3 w-3" />
                    </button>
                </div>
                <div className="pt-2">
                    <ShortenedLink fullUrl={`https://sepolia.etherscan.io/tx/${selectedTx.txHash}`} displayPrefix="sepolia.etherscan.io/tx/" t={{ linkCopied: "Link copied!" }} />
                </div>
            </div>
             <DialogClose asChild>
                <Button variant="outline" className="w-full">Close</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
