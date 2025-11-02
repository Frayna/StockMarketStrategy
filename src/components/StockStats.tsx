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
  const leveragedValues: number[] = [initialPrice];
  const leveragedDailyVariations: number[] = [];
  const leveragedClosingDifferences: number[] = [];

  data.forEach((tick, index) => {
    if (index > 0) {
      const previousClose = data[index - 1].c;
      const currentClose = tick.c;
      const dailyReturn = (currentClose - previousClose) / previousClose;
      const leveragedReturn = dailyReturn * leverageRatio;
      currentLeveragedValue = currentLeveragedValue * (1 + leveragedReturn);

      leveragedValues.push(currentLeveragedValue);

      // Calculate leveraged daily variation (high-low equivalent)
      const previousLeveragedValue = leveragedValues[index - 1];
      const highReturn = (tick.h - previousClose) / previousClose;
      const lowReturn = (tick.l - previousClose) / previousClose;
      const leveragedHigh = previousLeveragedValue * (1 + highReturn * leverageRatio);
      const leveragedLow = previousLeveragedValue * (1 + lowReturn * leverageRatio);
      leveragedDailyVariations.push(leveragedHigh - leveragedLow);

      // Calculate leveraged closing difference
      leveragedClosingDifferences.push(currentLeveragedValue - previousLeveragedValue);
    }
  });

  const leveragedTotalReturn = initialPrice !== 0 ? (currentLeveragedValue - initialPrice) / initialPrice : 0;
  const leveragedDailyGrowthRate = data.length > 1 ? Math.pow(1 + leveragedTotalReturn, 1 / (data.length - 1)) - 1 : 0;

  const avgLeveragedDailyVariation = leveragedDailyVariations.length > 0
    ? leveragedDailyVariations.reduce((sum, variation) => sum + variation, 0) / leveragedDailyVariations.length
    : 0;

  const avgLeveragedClosingDifference = leveragedClosingDifferences.length > 0
    ? leveragedClosingDifferences.reduce((sum, diff) => sum + diff, 0) / leveragedClosingDifferences.length
    : 0;

  return {
    leveragedFinalValue: currentLeveragedValue,
    leveragedTotalReturn,
    leveragedDailyGrowthRate,
    avgLeveragedDailyVariation,
    avgLeveragedClosingDifference,
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
    avgLeveragedDailyVariation,
    avgLeveragedClosingDifference,
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

      {/* Side-by-Side Comparison Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* Stock Data Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span>📊</span>
              Stock Performance
            </h2>
            <p className="text-gray-600">Actual stock price movements</p>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
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
          <div className="grid grid-cols-2 gap-4 mb-6">
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

          {/* Growth Rate & Volatility */}
          <div className="grid grid-cols-1 gap-4">
            <StatsCard
              label="Daily Growth Rate"
              value={`${(dailyGrowthRate * 100).toFixed(3)}%`}
              valueColor={dailyGrowthRate >= 0 ? "text-green-600" : "text-red-600"}
              icon="📈"
            />
            <StatsCard
              label="Avg Daily Fluctuation"
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

        {/* Leveraged Trading Section */}
        <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 border border-blue-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span>⚡</span>
              2x Leveraged Analysis
            </h2>
            <p className="text-gray-600">Theoretical leveraged performance</p>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatsCard label="Data Points" value={data.length} icon="📊" />
            <StatsCard
              label="Latest Close Price"
              value={`€${leveragedFinalValue.toFixed(2)}`}
              valueColor={leveragedTotalReturn >= 0 ? "text-green-600" : "text-red-600"}
              icon="💰"
            />
            <StatsCard
              label="Latest High"
              value={`€${leveragedFinalValue.toFixed(2)}`}
              valueColor="text-blue-600"
              icon="📈"
            />
            <StatsCard
              label="Latest Low"
              value={`€${firstClose.toFixed(2)}`}
              valueColor="text-red-600"
              icon="📉"
            />
          </div>

          {/* Period Statistics */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatsCard
              label="Period High"
              value={`€${Math.max(leveragedFinalValue, firstClose).toFixed(2)}`}
              valueColor="text-emerald-600"
              icon="↗️"
            />
            <StatsCard
              label="Period Low"
              value={`€${Math.min(leveragedFinalValue, firstClose).toFixed(2)}`}
              valueColor="text-orange-600"
              icon="🔻"
            />
            <StatsCard
              label="Price Change"
              value={`€${(leveragedFinalValue - firstClose).toFixed(2)}`}
              valueColor={leveragedTotalReturn >= 0 ? "text-green-600" : "text-red-600"}
              icon={leveragedTotalReturn >= 0 ? "⬆️" : "⬇️"}
            />
            <StatsCard
              label="Change %"
              value={`${(leveragedTotalReturn * 100).toFixed(2)}%`}
              valueColor={leveragedTotalReturn >= 0 ? "text-green-600" : "text-red-600"}
              icon={leveragedTotalReturn >= 0 ? "🟢" : "🔴"}
            />
          </div>

          {/* Growth Rate & Volatility */}
          <div className="grid grid-cols-1 gap-4">
            <StatsCard
              label="Daily Growth Rate"
              value={`${(leveragedDailyGrowthRate * 100).toFixed(3)}%`}
              valueColor={leveragedDailyGrowthRate >= 0 ? "text-green-600" : "text-red-600"}
              icon="📈"
            />
            <StatsCard
              label="Avg Daily Fluctuation"
              value={`€${avgLeveragedDailyVariation.toFixed(2)}`}
              valueColor="text-purple-600"
              icon="📊"
            />
            <StatsCard
              label="Avg Close Difference"
              value={`€${avgLeveragedClosingDifference.toFixed(2)}`}
              valueColor="text-indigo-600"
              icon="📈"
            />
          </div>
        </div>
      </div>

      {/* Summary Comparison Section */}
      <div className="mt-8 bg-gray-50 rounded-lg shadow-lg p-6 border border-gray-200">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span>📊</span>
            Performance Summary
          </h2>
          <p className="text-gray-600">Direct comparison between normal and leveraged performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center bg-white rounded-lg p-4 shadow">
            <div className="text-sm text-gray-600 mb-2">Investment Returns</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-gray-500">Normal</div>
                <div className={`text-lg font-bold ${priceChangePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {priceChangePercent.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Leveraged</div>
                <div className={`text-lg font-bold ${leveragedTotalReturn >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {(leveragedTotalReturn * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          <div className="text-center bg-white rounded-lg p-4 shadow">
            <div className="text-sm text-gray-600 mb-2">Final Values</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-gray-500">Normal</div>
                <div className="text-lg font-bold text-blue-600">
                  €{lastClose.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Leveraged</div>
                <div className="text-lg font-bold text-blue-600">
                  €{leveragedFinalValue.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center bg-white rounded-lg p-4 shadow">
            <div className="text-sm text-gray-600 mb-2">Risk Analysis</div>
            <div className="text-lg font-semibold text-orange-600 mb-1">
              {priceChangePercent !== 0 ? `${((leveragedTotalReturn * 100) / priceChangePercent).toFixed(2)}x` : 'N/A'}
            </div>
            <div className="text-xs text-gray-500">Effective Leverage Effect</div>
          </div>
        </div>
      </div>
    </div>
  );
};
