
import type { AssetHistoryPoint } from "@/ai/flows/assetHistoryFlow";

export function calculate7DayChange(history: AssetHistoryPoint[]): number {
  if (!history || history.length < 2) {
    return 0;
  }

  // Ensure the history is sorted by timestamp ascending
  const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp);

  const startPrice = sortedHistory[0].price;
  const endPrice = sortedHistory[sortedHistory.length - 1].price;

  if (startPrice === 0) {
    return endPrice > 0 ? Infinity : 0;
  }

  return ((endPrice - startPrice) / startPrice) * 100;
}

    