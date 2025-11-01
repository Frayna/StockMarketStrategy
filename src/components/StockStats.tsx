import React from 'react';
import { StatsCard } from './StatsCard';
import { StockTick } from '../types/stockData';

interface StockStatsProps {
  data: StockTick[];
}

export const StockStats: React.FC<StockStatsProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  const latestTick = data[data.length - 1];

  // Calculate additional statistics
  const highestPrice = Math.max(...data.map(tick => tick.h));
  const lowestPrice = Math.min(...data.map(tick => tick.l));
  const firstClose = data[0]?.c || 0;
  const lastClose = latestTick?.c || 0;
  const priceChange = lastClose - firstClose;
  const priceChangePercent = firstClose !== 0 ? (priceChange / firstClose) * 100 : 0;

  // Calculate average daily variation (high - low for each day, then average)
  const dailyVariations = data.map(tick => tick.h - tick.l);
  const avgDailyVariation = dailyVariations.length > 0
    ? dailyVariations.reduce((sum, variation) => sum + variation, 0) / dailyVariations.length
    : 0;

  // Calculate average difference between consecutive days' closing prices
  const closingDifferences = [];
  for (let i = 1; i < data.length; i++) {
    closingDifferences.push(data[i].c - data[i - 1].c);
  }
  const avgClosingDifference = closingDifferences.length > 0
    ? closingDifferences.reduce((sum, diff) => sum + diff, 0) / closingDifferences.length
    : 0;

  // Calculate daily compound growth rate
  const initialPrice = firstClose;
  const finalPrice = lastClose;
  const totalReturn = initialPrice !== 0 ? (finalPrice - initialPrice) / initialPrice : 0;
  const dailyGrowthRate = data.length > 1 ? Math.pow(1 + totalReturn, 1 / (data.length - 1)) - 1 : 0;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatsCard
          label="Data Points"
          value={data.length}
          icon="📊"
        />
        <StatsCard
          label="Latest Close Price"
          value={`€${latestTick?.c.toFixed(2)}`}
          valueColor="text-green-600"
          icon="💰"
        />
        <StatsCard
          label="Latest High"
          value={`€${latestTick?.h.toFixed(2)}`}
          valueColor="text-blue-600"
          icon="📈"
        />
        <StatsCard
          label="Latest Low"
          value={`€${latestTick?.l.toFixed(2)}`}
          valueColor="text-red-600"
          icon="📉"
        />
      </div>

      {/* Additional row with more statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-6 mt-6">
        <StatsCard
          label="Period High"
          value={`€${highestPrice.toFixed(2)}`}
          valueColor="text-emerald-600"
          icon="↗️"
        />
        <StatsCard
          label="Period Low"
          value={`€${lowestPrice.toFixed(2)}`}
          valueColor="text-orange-600"
          icon="🔻"
        />
        <StatsCard
          label="Price Change"
          value={`€${priceChange.toFixed(2)}`}
          valueColor={priceChange >= 0 ? "text-green-600" : "text-red-600"}
          icon={priceChange >= 0 ? "⬆️" : "⬇️"}
        />
        <StatsCard
          label="Change %"
          value={`${priceChangePercent.toFixed(2)}%`}
          valueColor={priceChangePercent >= 0 ? "text-green-600" : "text-red-600"}
          icon={priceChangePercent >= 0 ? "🟢" : "🔴"}
        />
        <StatsCard
          label="Daily Growth Rate"
          value={`${(dailyGrowthRate * 100).toFixed(3)}%`}
          valueColor={dailyGrowthRate >= 0 ? "text-green-600" : "text-red-600"}
          icon="📈"
        />
        <StatsCard
          label="Avg Daily Variation"
          value={`€${avgDailyVariation.toFixed(2)}`}
          valueColor="text-purple-600"
          icon="📊"
        />
        <StatsCard
          label="Avg Close Difference"
          value={`€${avgClosingDifference.toFixed(2)}`}
          valueColor="text-indigo-600"
          icon="📈"
        />
      </div>
    </div>
  );
};
