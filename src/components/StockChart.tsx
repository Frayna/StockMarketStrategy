import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';
import { StockTick } from '../types/stockData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  CandlestickController,
  CandlestickElement
);

interface StockChartProps {
  data: StockTick[];
  title?: string;
}

export const StockChart: React.FC<StockChartProps> = ({ data, title = 'Stock Price Chart' }) => {
  const chartData = {
    datasets: [
      {
        label: 'Stock Price',
        data: data.map(tick => ({
          x: tick.d,
          o: tick.o, // open
          h: tick.h, // high
          l: tick.l, // low
          c: tick.c, // close
        })),
        color: {
          up: '#26a69a',   // green for bullish candles (close > open)
          down: '#ef5350', // red for bearish candles (close < open)
          unchanged: '#999', // gray for unchanged
        },
        borderColor: '#333',
        borderWidth: 1,
      } as any, // Type assertion to bypass strict typing issues
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
      },
    },
    plugins: {
      legend: {
        display: false, // Hide legend for cleaner look
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 18,
          weight: 'bold' as const,
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        callbacks: {
          title: (context: any) => {
            const date = new Date(context[0].parsed.x);
            return date.toLocaleDateString();
          },
          label: (context: any) => {
            const data = context.parsed;
            return [
              `Open: €${data.o?.toFixed(2) || 'N/A'}`,
              `High: €${data.h?.toFixed(2) || 'N/A'}`,
              `Low: €${data.l?.toFixed(2) || 'N/A'}`,
              `Close: €${data.c?.toFixed(2) || 'N/A'}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          displayFormats: {
            day: 'MMM dd',
          },
        },
        title: {
          display: true,
          text: 'Date',
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Price (€)',
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      <div style={{ position: 'relative', height: '500px', width: '100%' }}>
        <Chart type="candlestick" data={chartData} options={options} />
      </div>
    </div>
  );
};
