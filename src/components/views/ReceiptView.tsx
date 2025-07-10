"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Transaction } from '@/lib/types';
import { ArrowLeft, CheckCircle, ExternalLink, Hash, Landmark, Box, Clipboard } from 'lucide-react';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";

interface ReceiptViewProps {
  transaction: Transaction;
  onBack: () => void;
}

const ReceiptItem = ({ icon, label, value, isHash = false }: { icon: React.ReactNode, label: string, value: string, isHash?: boolean }) => {
  const { toast } = useToast();
  const truncatedValue = isHash ? `${value.slice(0, 10)}...${value.slice(-8)}` : value;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast({
      title: "Copied!",
      description: `${label} has been copied to clipboard.`,
    });
  }

  return (
    <div className="flex items-start justify-between py-3 border-b border-border/50">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`font-mono font-medium text-right ${isHash ? 'text-primary' : ''}`}>{truncatedValue}</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}><Clipboard className="h-4 w-4" /></Button>
      </div>
    </div>
  )
};

export function ReceiptView({ transaction, onBack }: ReceiptViewProps) {
  const etherscanUrl = `https://sepolia.etherscan.io/tx/${transaction.txHash}`;

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <CardTitle className="mt-2">Transaction Sent</CardTitle>
        <CardDescription>Your private transaction has been confirmed on Sepolia.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <ReceiptItem icon={<Hash className="h-5 w-5 text-accent" />} label="Transaction Hash" value={transaction.txHash} isHash />
          <ReceiptItem icon={<Landmark className="h-5 w-5 text-accent" />} label="To" value={transaction.to} isHash />
          <ReceiptItem icon={<Box className="h-5 w-5 text-accent" />} label="Block Number" value={transaction.proposedOnL1.toString()} />
          <div className="flex items-center justify-between py-3">
            <span className="font-medium">Amount</span>
            <span className="text-xl font-bold">{transaction.amount} ETH</span>
          </div>
        </div>

        <Button asChild variant="outline" className="w-full mt-6">
          <Link href={etherscanUrl} target="_blank" rel="noopener noreferrer">
            View on Etherscan
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
      <CardFooter>
        <Button variant="secondary" className="w-full" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Wallet
        </Button>
      </CardFooter>
    </Card>
  );
}
