import React from "react";
import { StatsCard } from "./StatsCard";
import { StockTick } from "../types/stockData";

interface StockStatsProps {
  data: StockTick[];
  isFiltered?: boolean;
  totalDataPoints?: number;
}

// Helper functions for calculations
const calculateBasicStats = (data: StockTick[]) => {
  const latestTick = data[data.length - 1];
  const firstClose = data[0]?.c || 0;
  const lastClose = latestTick?.c || 0;

  return {
    latestTick,
    firstClose,
    lastClose,
    highestPrice: Math.max(...data.map((tick) => tick.h)),
    lowestPrice: Math.min(...data.map((tick) => tick.l)),
    priceChange: lastClose - firstClose,
    priceChangePercent: firstClose !== 0 ? ((lastClose - firstClose) / firstClose) * 100 : 0,
  };
};

const calculateDailyVariations = (data: StockTick[]) => {
  const dailyVariations = data.map((tick) => tick.h - tick.l);
  const closingDifferences = data.slice(1).map((tick, index) => tick.c - data[index].c);

  return {
    avgDailyVariation: dailyVariations.length > 0
      ? dailyVariations.reduce((sum, variation) => sum + variation, 0) / dailyVariations.length
      : 0,
    avgClosingDifference: closingDifferences.length > 0
      ? closingDifferences.reduce((sum, diff) => sum + diff, 0) / closingDifferences.length
      : 0,
  };
};

const calculateCompoundGrowth = (data: StockTick[], initialPrice: number, finalPrice: number) => {
  const totalReturn = initialPrice !== 0 ? (finalPrice - initialPrice) / initialPrice : 0;
  const dailyGrowthRate = data.length > 1 ? Math.pow(1 + totalReturn, 1 / (data.length - 1)) - 1 : 0;

  return { totalReturn, dailyGrowthRate };
};

const calculateLeveragedStats = (data: StockTick[], initialPrice: number, leverageRatio: number = 2) => {
  let currentLeveragedValue = initialPrice;

  data.forEach((tick, index) => {
    if (index > 0) {
      const previousClose = data[index - 1].c;
      const currentClose = tick.c;
      const dailyReturn = (currentClose - previousClose) / previousClose;
      const leveragedReturn = dailyReturn * leverageRatio;
      currentLeveragedValue = currentLeveragedValue * (1 + leveragedReturn);
    }
  });

  const leveragedTotalReturn = initialPrice !== 0 ? (currentLeveragedValue - initialPrice) / initialPrice : 0;
  const leveragedDailyGrowthRate = data.length > 1 ? Math.pow(1 + leveragedTotalReturn, 1 / (data.length - 1)) - 1 : 0;

  return {
    leveragedFinalValue: currentLeveragedValue,
    leveragedTotalReturn,
    leveragedDailyGrowthRate,
  };
};

export const StockStats: React.FC<StockStatsProps> = ({ data, isFiltered = false, totalDataPoints }) => {
  if (!data || data.length === 0) {
    return null;
  }

  // Calculate all statistics using helper functions
  const {
    latestTick,
    firstClose,
    lastClose,
    highestPrice,
    lowestPrice,
    priceChange,
    priceChangePercent,
  } = calculateBasicStats(data);

  const {
    avgDailyVariation,
    avgClosingDifference,
  } = calculateDailyVariations(data);

  const {
    dailyGrowthRate,
  } = calculateCompoundGrowth(data, firstClose, lastClose);

  const {
    leveragedFinalValue,
    leveragedTotalReturn,
    leveragedDailyGrowthRate,
  } = calculateLeveragedStats(data, firstClose);

  return (
    <div className="max-w-7xl mx-auto">
      {isFiltered && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-800 text-sm">
            <span>🔍</span>
            <span className="font-medium">
              Statistics for filtered/zoomed data from chart
              {totalDataPoints && ` (${data.length} of ${totalDataPoints} points)`}
            </span>
          </div>
        </div>
      )}

      {/* Basic Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatsCard label="Data Points" value={data.length} icon="📊" />
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

      {/* Period Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
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
      </div>

      {/* Growth Rates */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
        <StatsCard
          label="Daily Growth Rate"
          value={`${(dailyGrowthRate * 100).toFixed(3)}%`}
          valueColor={dailyGrowthRate >= 0 ? "text-green-600" : "text-red-600"}
          icon="📈"
        />
        <StatsCard
          label="2x Leveraged Final Value"
          value={`€${leveragedFinalValue.toFixed(2)}`}
          valueColor={leveragedTotalReturn >= 0 ? "text-green-600" : "text-red-600"}
          icon="🚀"
        />
        <StatsCard
          label="2x Leveraged Total Return"
          value={`${(leveragedTotalReturn * 100).toFixed(2)}%`}
          valueColor={leveragedTotalReturn >= 0 ? "text-green-600" : "text-red-600"}
          icon="💎"
        />
        <StatsCard
          label="2x Leveraged Daily Rate"
          value={`${(leveragedDailyGrowthRate * 100).toFixed(3)}%`}
          valueColor={leveragedDailyGrowthRate >= 0 ? "text-green-600" : "text-red-600"}
          icon="⚡"
        />
      </div>

      {/* Volatility Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6">
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
