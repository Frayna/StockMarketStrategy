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

interface CompoundComparisonPieChartProps {
  data: StockTick[];
  title?: string;
  isFiltered?: boolean;
  totalDataPoints?: number;
}

export const CompoundComparisonPieChart: React.FC<CompoundComparisonPieChartProps> = ({
  data,
  title = 'Closing Prices vs Compound Growth',
  isFiltered = false,
  totalDataPoints
}) => {
  // Calculate the compound growth data points
  const initialPrice = data.length > 0 ? data[0].c : 0;
  const finalPrice = data.length > 0 ? data[data.length - 1].c : 0;
  const totalReturn = (finalPrice - initialPrice) / initialPrice;
  const dailyGrowthRate = Math.pow(1 + totalReturn, 1 / (data.length - 1)) - 1;

  // Compare each closing price with its corresponding compound value
  let aboveCount = 0;
  let belowCount = 0;
  let equalCount = 0;

  data.forEach((tick, index) => {
    const compoundedValue = initialPrice * Math.pow(1 + dailyGrowthRate, index);
    const closingPrice = tick.c;

    if (closingPrice > compoundedValue) {
      aboveCount++;
    } else if (closingPrice < compoundedValue) {
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
      `Above Compound (${abovePercentage}%)`,
      `Below Compound (${belowPercentage}%)`,
      ...(equalCount > 0 ? [`Equal to Compound (${equalPercentage}%)`] : [])
    ],
    datasets: [
      {
        data: [aboveCount, belowCount, ...(equalCount > 0 ? [equalCount] : [])],
        backgroundColor: [
          '#26a69a', // Green for above
          '#ef5350', // Red for below
          ...(equalCount > 0 ? ['#999'] : []) // Gray for equal
        ],
        borderColor: [
          '#1e7a73',
          '#c62828',
          ...(equalCount > 0 ? ['#666'] : [])
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          '#2bbbae',
          '#f44336',
          ...(equalCount > 0 ? ['#bbb'] : [])
        ],
        hoverBorderColor: [
          '#1e7a73',
          '#c62828',
          ...(equalCount > 0 ? ['#666'] : [])
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
    <div className="w-full bg-white rounded-lg shadow-lg p-6 h-full">
      {isFiltered && (
        <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-800 text-sm">
            <span>🔍</span>
            <span className="font-medium">
              Showing filtered/zoomed data from chart
              {totalDataPoints && ` (${data.length} of ${totalDataPoints} points)`}
            </span>
          </div>
        </div>
      )}

      <div style={{ position: 'relative', height: '300px', width: '100%' }}>
        <Pie data={chartData} options={options} />
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Shows how often actual closing prices exceeded the theoretical compound growth line
      </div>
    </div>
  );
};
