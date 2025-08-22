
"use client";

import { Card, CardContent } from '@/components/ui/card';
import type { Transaction } from '@/lib/types';
import { DollarSign } from 'lucide-react';
import Image from 'next/image';

interface TransactionReceiptMessageProps {
  transaction: Transaction;
  contactName: string;
}

export function TransactionReceiptMessage({ transaction, contactName }: TransactionReceiptMessageProps) {
  const isPrivate = !transaction.amount;

  return (
    <Card className="w-full max-w-[350px] bg-secondary/50 border-primary/20 shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <DollarSign className="h-4 w-4 text-primary" />
          <span>Transacción de Cripto</span>
        </div>
        <div className="flex items-center gap-3 mb-3">
          {transaction.icon && <Image src={transaction.icon} alt={transaction.ticker} width={40} height={40} className="rounded-full" />}
          <div>
            <p className="text-2xl font-bold">{isPrivate ? 'Private' : `${transaction.amount.toLocaleString()} ${transaction.ticker}`}</p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Para:</span>
            <span className="font-medium text-foreground">{contactName}</span>
          </div>
          <div className="flex justify-between">
            <span>Dirección:</span>
            <span className="font-mono text-xs text-foreground">{transaction.to.slice(0, 8)}...{transaction.to.slice(-6)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
