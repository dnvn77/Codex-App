
"use client";

import { useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Transaction } from '@/lib/types';
import { ArrowLeft, CheckCircle, Hash, Landmark, Box, Copy, Share2, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from '@/hooks/useTranslations';
import { ShortenedLink } from '@/components/shared/ShortenedLink';
import { useIsMobile } from '@/hooks/use-mobile';
import * as htmlToImage from 'html-to-image';
import Image from 'next/image';
import { cn } from '@/lib/utils';

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
    <div className="flex items-start justify-between py-3 border-b border-border/50 gap-4">
      <div className="flex items-center gap-3 shrink-0">
        {icon}
        <span className="text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`font-mono font-medium text-right break-all ${isHash ? 'text-primary' : ''}`}>{truncatedValue}</span>
        <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={handleCopy}><Copy className="h-4 w-4" /></Button>
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
        const style = window.getComputedStyle(cardElement);
        const backgroundColor = style.backgroundColor;

        const dataUrl = await htmlToImage.toPng(cardElement, { 
            quality: 0.95,
            backgroundColor: backgroundColor || 'white', // Fallback for safety
            // Ensure remote images (like token icons) are loaded before capturing
            fetchRequestInit: {
                headers: new Headers({
                    'Access-Control-Allow-Origin': '*'
                }),
                cache: 'force-cache'
            }
        });
        
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'strawberry-receipt.png', { type: blob.type });

        const shareData = {
            title: t.shareTxTitle,
            text: t.shareTxText(transaction.txHash),
            files: [file],
        };

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share(shareData);
        } else if (navigator.share) {
            // Fallback for browsers that can share but not files (e.g. some desktop browsers)
             await navigator.share({
                title: t.shareTxTitle,
                text: t.shareTxText(transaction.txHash),
                url: etherscanUrl,
            });
        } else {
            // Fallback for browsers that don't support sharing at all
            navigator.clipboard.writeText(etherscanUrl);
            toast({
                title: t.linkCopied,
                description: t.shareUnsupportedDesc,
            });
        }
    } catch (err) {
      // Only show error if it's not an AbortError (user cancellation)
      if (err instanceof DOMException && err.name === 'AbortError') {
          console.log('Share action was cancelled by the user.');
      } else {
          console.error("Share failed:", err);
          toast({
            title: t.error,
            description: t.shareFailedDesc,
            variant: "destructive",
          });
      }
    }
  }, [t, transaction, etherscanUrl, toast]);


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
            <ReceiptItem t={t} icon={<Box className="h-5 w-5 text-accent" />} label={t.blockNumberLabel} value={String(transaction.proposedOnL1)} />
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                {transaction.icon && <Image src={transaction.icon} alt={transaction.ticker} width={20} height={20} className="h-5 w-5 rounded-full" data-ai-hint={`${transaction.ticker} logo`} />}
                <span className="text-muted-foreground">{t.amountLabel}</span>
              </div>
              <span className="font-mono font-medium">{transaction.amount.toLocaleString('en-US', { maximumFractionDigits: 6 })} {transaction.ticker}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <ShortenedLink fullUrl={etherscanUrl} displayPrefix="sepolia.etherscan.io/tx/" t={t} />
          {transaction.ticker !== 'ETH' && (
              <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2 p-2 bg-muted rounded-md w-full">
                  <Info className="h-4 w-4 flex-shrink-0" />
                  <p>{t.tokenPortalInfo}</p>
              </div>
          )}
          <div className="flex gap-2 w-full">
            <Button variant="secondary" className="w-full" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.backToWalletButton}
            </Button>
            {isMobile && navigator.share && (
              <Button onClick={handleShare} className="w-full">
                <Share2 className="mr-2 h-4 w-4" />
                {t.shareButton}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
      {!isMobile && (
         <div className="mt-4 flex justify-center">
           <Button onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              {t.shareButton}
            </Button>
         </div>
      )}
    </>
  );
}
