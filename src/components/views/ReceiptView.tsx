
"use client";

import { useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Transaction } from '@/lib/types';
import { ArrowLeft, CheckCircle, Hash, Landmark, Box, Copy, Share2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from '@/hooks/useTranslations';
import { ShortenedLink } from '@/components/shared/ShortenedLink';
import { useIsMobile } from '@/hooks/use-mobile';
import * as htmlToImage from 'html-to-image';

interface ReceiptViewProps {
  transaction: Transaction;
  onBack: () => void;
}

const ReceiptItem = ({ icon, label, value, isHash = false, t }: { icon: React.ReactNode, label: string, value: string, isHash?: boolean, t: any }) => {
  const { toast } = useToast();
  const truncatedValue = isHash ? `${value.slice(0, 10)}...${value.slice(-8)}` : value;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast({
      title: t.copied,
      description: t.copiedDesc(label),
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
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}><Copy className="h-4 w-4" /></Button>
      </div>
    </div>
  )
};

export function ReceiptView({ transaction, onBack }: ReceiptViewProps) {
  const t = useTranslations();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const etherscanUrl = `https://sepolia.etherscan.io/tx/${transaction.txHash}`;
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleShare = useCallback(async () => {
    if (!receiptRef.current) return;
    
    try {
        const cardElement = receiptRef.current;
        const backgroundColor = window.getComputedStyle(cardElement).backgroundColor;

        const dataUrl = await htmlToImage.toPng(cardElement, { 
            quality: 0.95,
            backgroundColor: backgroundColor,
        });
        
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'strawberry-receipt.png', { type: blob.type });

        const shareData = {
            title: t.shareTxTitle,
            text: t.shareTxText(transaction.txHash),
            files: [file],
            url: etherscanUrl,
        };

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share(shareData);
        } else if (navigator.share) {
            await navigator.share({
                title: t.shareTxTitle,
                text: t.shareTxText(transaction.txHash),
                url: etherscanUrl,
            });
        } else {
            navigator.clipboard.writeText(etherscanUrl);
            toast({
                title: t.linkCopied,
                description: t.shareUnsupportedDesc,
            });
        }
    } catch (err) {
      console.error("Share failed:", err);
      toast({
        title: t.error,
        description: t.shareFailedDesc,
        variant: "destructive",
      });
    }
  }, [t, transaction.txHash, etherscanUrl]);


  return (
    <>
      <Card className="w-full shadow-lg" ref={receiptRef}>
        <CardHeader className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <CardTitle className="mt-2">{t.txSentTitle}</CardTitle>
          <CardDescription>{t.txSentDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <ReceiptItem t={t} icon={<Hash className="h-5 w-5 text-accent" />} label={t.txHashLabel} value={transaction.txHash} isHash />
            <ReceiptItem t={t} icon={<Landmark className="h-5 w-5 text-accent" />} label={t.toLabel} value={transaction.to} isHash />
            <ReceiptItem t={t} icon={<Box className="h-5 w-5 text-accent" />} label={t.blockNumberLabel} value={transaction.proposedOnL1.toString()} />
            <div className="flex items-center justify-between py-3">
              <span className="font-medium">{t.amountLabel}</span>
              <span className="text-xl font-bold">{transaction.amount} {transaction.ticker}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <ShortenedLink 
              fullUrl={etherscanUrl} 
              displayPrefix="strawberry.eth/tx/" 
              t={t} 
            />
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col gap-2 mt-4 w-full">
         {isMobile && (
            <Button variant="outline" className="w-full" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              {t.shareButton}
            </Button>
          )}
        <Button variant="secondary" className="w-full" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.backToWalletButton}
        </Button>
      </div>
    </>
  );
}
