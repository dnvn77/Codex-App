
"use client";

import { useEffect, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import type { Asset } from '@/lib/types';
import { fetchAssetHistory, type AssetHistoryPoint } from '@/ai/flows/assetHistoryFlow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { calculate7DayChange } from '@/lib/asset';

interface FavoriteAssetChartProps {
  asset: Asset;
  currencySymbol?: string;
}

const THEME_COLORS: Record<string, { stroke: string, fill: string }> = {
  light: { stroke: 'hsl(var(--primary))', fill: 'hsl(var(--primary) / 0.1)' },
  dark: { stroke: 'hsl(var(--primary))', fill: 'hsl(var(--primary) / 0.1))' },
  dim: { stroke: 'hsl(var(--primary))', fill: 'hsl(var(--primary) / 0.1))' },
};

export function FavoriteAssetChart({ asset, currencySymbol = '$' }: FavoriteAssetChartProps) {
  const [history, setHistory] = useState<AssetHistoryPoint[] | null>(null);
  const [change, setChange] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const getHistory = async () => {
      // Ensure we don't try to fetch history for an asset with a placeholder ID
      if (asset.id === 0) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const historyData = await fetchAssetHistory({ id: asset.id });
        if (historyData && historyData.length > 0) {
          setHistory(historyData);
          setChange(calculate7DayChange(historyData));
        }
      } catch (error) {
        console.error(`Failed to fetch history for ${asset.ticker}:`, error);
        setHistory(null); // Set history to null on error
      } finally {
        setIsLoading(false);
      }
    };
    getHistory();
  }, [asset.id, asset.ticker]);

  const ChangeIndicator = ({ value }: { value: number }) => {
    const isPositive = value >= 0;
    const color = isPositive ? 'text-green-500' : 'text-destructive';
    const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

    return (
      <span className={cn('flex items-center text-sm font-semibold', color)}>
        <Icon className="h-4 w-4 mr-1" />
        {value.toFixed(2)}% (7d)
      </span>
    );
  };
  
  const colors = THEME_COLORS[theme as keyof typeof THEME_COLORS] || THEME_COLORS.light;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
          <div className="mt-2 flex justify-between items-center">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Image src={asset.icon} alt={asset.name} width={32} height={32} className="rounded-full" />
          <CardTitle className="text-lg">{asset.ticker}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-20">
          {history && history.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={history}
                margin={{
                  top: 5,
                  right: 0,
                  left: 0,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient id={`color${asset.ticker}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.stroke} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={colors.stroke} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="price" stroke={colors.stroke} fillOpacity={1} fill={`url(#color${asset.ticker})`} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                No historical data
             </div>
          )}
        </div>
        <div className="mt-2 flex justify-between items-center">
          <p className="text-xl font-bold font-mono">
            {currencySymbol}{asset.priceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          {history && history.length > 0 && <ChangeIndicator value={change} />}
        </div>
      </CardContent>
    </Card>
  );
}
