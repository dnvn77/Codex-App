
"use client";

import { useEffect, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { Asset } from '@/lib/types';
import { fetchAssetHistory, type AssetHistoryPoint } from '@/ai/flows/assetHistoryFlow';
import { Skeleton } from '@/components/ui/skeleton';
import { format, fromUnixTime } from 'date-fns';
import { useTheme } from 'next-themes';

interface DetailedAssetChartProps {
  asset: Asset;
}

const THEME_COLORS: Record<string, { stroke: string, grid: string }> = {
  light: { stroke: 'hsl(var(--primary))', grid: 'hsl(var(--border))' },
  dark: { stroke: 'hsl(var(--primary))', grid: 'hsl(var(--border))' },
  dim: { stroke: 'hsl(var(--primary))', grid: 'hsl(var(--border))' },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Price
            </span>
            <span className="font-bold text-muted-foreground">
              {payload[0].value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Date
            </span>
            <span className="font-bold">
              {format(fromUnixTime(label), 'PPpp')}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export function DetailedAssetChart({ asset }: DetailedAssetChartProps) {
  const [history, setHistory] = useState<AssetHistoryPoint[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const getHistory = async () => {
      setIsLoading(true);
      try {
        const historyData = await fetchAssetHistory({ id: asset.id });
        setHistory(historyData);
      } catch (error) {
        console.error(`Failed to fetch detailed history for ${asset.ticker}:`, error);
      } finally {
        setIsLoading(false);
      }
    };
    getHistory();
  }, [asset.id, asset.ticker]);
  
  const colors = THEME_COLORS[theme as keyof typeof THEME_COLORS] || THEME_COLORS.light;

  if (isLoading || !history) {
    return <Skeleton className="h-full w-full" />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={history}>
        <defs>
            <linearGradient id={`colorDetail${asset.ticker}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.stroke} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={colors.stroke} stopOpacity={0}/>
            </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(time) => format(fromUnixTime(time), 'MMM d')}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(value) => `$${value.toLocaleString()}`}
          tickLine={false}
          axisLine={false}
          domain={['dataMin', 'dataMax']}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="price"
          stroke={colors.stroke}
          fillOpacity={1}
          fill={`url(#colorDetail${asset.ticker})`}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
