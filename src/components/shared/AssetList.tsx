
"use client";

import type { Asset } from '@/lib/types';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight, RefreshCw, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AssetListProps {
  assets: Asset[];
  showBalances: boolean;
  hideZeroBalances: boolean;
  t: any; // Translation object
  onRefresh: () => void;
  isRefreshing: boolean;
  onToggleFavorite: (ticker: string) => void;
}

export function AssetList({ assets, showBalances, hideZeroBalances, t, onRefresh, isRefreshing, onToggleFavorite }: AssetListProps) {
  
  const filteredAssets = hideZeroBalances ? assets.filter(asset => asset.balance > 0) : assets;

  if (filteredAssets.length === 0 && !isRefreshing) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>No assets to display.</p>
      </div>
    );
  }

  const ChangeIndicator = ({ value }: { value: number }) => {
    const isPositive = value >= 0;
    const color = isPositive ? 'text-green-500' : 'text-destructive';
    const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

    return (
      <span className={cn('flex items-center justify-end text-xs font-medium', color)}>
        <Icon className="h-3 w-3 mr-1" />
        {Math.abs(value).toFixed(2)}%
      </span>
    );
  };

  return (
    <div className="w-full">
       <div className="flex justify-end mb-2">
            <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isRefreshing}>
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                <span className="sr-only">Refresh Prices</span>
            </Button>
        </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead>{t.assetLabel}</TableHead>
            <TableHead className="text-right">{t.priceLabel}</TableHead>
            <TableHead className="text-right">{t.balanceLabel}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAssets.map((asset) => (
            <TableRow key={asset.ticker}>
              <TableCell>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onToggleFavorite(asset.ticker)}>
                    <Star className={cn("h-5 w-5 text-yellow-400", asset.isFavorite && "fill-current")} />
                </Button>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Image src={asset.icon} alt={asset.name} width={32} height={32} className="rounded-full" data-ai-hint={`${asset.name} logo`}/>
                  <div>
                    <p className="font-bold">{asset.ticker}</p>
                    <p className="text-xs text-muted-foreground">{asset.name}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div>
                   <p className="font-mono">
                     ${asset.priceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <ChangeIndicator value={asset.change24h} />
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end">
                    <p className="font-mono font-semibold">
                    {showBalances ? asset.balance.toLocaleString('en-US', { maximumFractionDigits: 4 }) : '••••••'}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground">
                    {showBalances ? `$${(asset.balance * asset.priceUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••'}
                    </p>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

    