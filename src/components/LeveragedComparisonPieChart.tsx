import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { StockTick } from '../types/stockData';

ChartJS.register(ArcElement, Tooltip, Legend);

interface LeveragedComparisonPieChartProps {
  data: StockTick[];
  title?: string;
  isFiltered?: boolean;
  totalDataPoints?: number;
  leverageRatio?: number;
}

export const LeveragedComparisonPieChart: React.FC<LeveragedComparisonPieChartProps> = ({
  data,
  title = '2x Leveraged vs Compound Growth',
  isFiltered = false,
  totalDataPoints,
  leverageRatio = 2
}) => {
  // Calculate the leveraged growth data points
  const initialPrice = data.length > 0 ? data[0].c : 0;

  // Calculate leveraged performance for each data point
  let aboveCount = 0;
  let belowCount = 0;
  let equalCount = 0;

  let currentLeveragedValue = initialPrice;

  data.forEach((tick, index) => {
    if (index > 0) {
      const previousClose = data[index - 1].c;
      const currentClose = tick.c;
      const dailyReturn = (currentClose - previousClose) / previousClose;
      const leveragedReturn = dailyReturn * leverageRatio;
      currentLeveragedValue = currentLeveragedValue * (1 + leveragedReturn);
    }

    // Calculate theoretical compound growth for comparison
    const finalPrice = data[data.length - 1].c;
    const totalReturn = (finalPrice - initialPrice) / initialPrice;
    const dailyGrowthRate = Math.pow(1 + totalReturn, 1 / (data.length - 1)) - 1;
    const compoundedValue = initialPrice * Math.pow(1 + dailyGrowthRate, index);

    // Apply leverage to the compound growth for fair comparison
    const leveragedCompoundValue = initialPrice + (compoundedValue - initialPrice) * leverageRatio;

    // Compare current leveraged value with leveraged compound value
    if (currentLeveragedValue > leveragedCompoundValue) {
      aboveCount++;
    } else if (currentLeveragedValue < leveragedCompoundValue) {
      belowCount++;
    } else {
      equalCount++;
    }
  });

  const total = data.length;
  const abovePercentage = ((aboveCount / total) * 100).toFixed(1);
  const belowPercentage = ((belowCount / total) * 100).toFixed(1);
  const equalPercentage = ((equalCount / total) * 100).toFixed(1);

  const chartData = {
    labels: [
      `Above Leveraged Compound (${abovePercentage}%)`,
      `Below Leveraged Compound (${belowPercentage}%)`,
      ...(equalCount > 0 ? [`Equal to Leveraged Compound (${equalPercentage}%)`] : [])
    ],
    datasets: [
      {
        data: [aboveCount, belowCount, ...(equalCount > 0 ? [equalCount] : [])],
        backgroundColor: [
          '#3b82f6', // Blue for above (different from normal chart)
          '#f59e0b', // Amber for below (different from normal chart)
          ...(equalCount > 0 ? ['#6b7280'] : []) // Gray for equal
        ],
        borderColor: [
          '#1d4ed8',
          '#d97706',
          ...(equalCount > 0 ? ['#374151'] : [])
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          '#60a5fa',
          '#fbbf24',
          ...(equalCount > 0 ? ['#9ca3af'] : [])
        ],
        hoverBorderColor: [
          '#1d4ed8',
          '#d97706',
          ...(equalCount > 0 ? ['#374151'] : [])
        ],
        hoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label;
            const value = context.parsed;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} days (${percentage}%)`;
          },
        },
      },
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      },
    },
  };

  return (
    <div className="w-full bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 h-full border border-blue-200">
      {isFiltered && (
        <div className="mb-3 bg-blue-100 border border-blue-300 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-800 text-sm">
            <span>🔍</span>
            <span className="font-medium">
              Showing filtered/zoomed leveraged data from chart
              {totalDataPoints && ` (${data.length} of ${totalDataPoints} points)`}
            </span>
          </div>
        </div>
      )}

      <div style={{ position: 'relative', height: '300px', width: '100%' }}>
        <Pie data={chartData} options={options} />
      </div>

      <div className="mt-4 text-xs text-blue-700 text-center">
        Shows how often {leverageRatio}x leveraged performance exceeded theoretical leveraged compound growth
      </div>

    </div>
  );
};
