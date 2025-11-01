import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  LineElement,
  PointElement,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';
import { StockTick } from '../types/stockData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  LineElement,
  PointElement,
  CandlestickController,
  CandlestickElement,
  zoomPlugin
);

interface StockChartProps {
  data: StockTick[];
  title?: string;
}

export const StockChart: React.FC<StockChartProps> = ({ data, title = 'Stock Price Chart' }) => {
  const chartRef = React.useRef<ChartJS<'candlestick'>>(null);

  const resetZoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  // Calculate percentage-based compounding effect
  const initialPrice = data.length > 0 ? data[0].c : 0;
  const finalPrice = data.length > 0 ? data[data.length - 1].c : 0;

  // Calculate the daily growth rate that would result in the same total return
  const totalReturn = (finalPrice - initialPrice) / initialPrice;
  const dailyGrowthRate = Math.pow(1 + totalReturn, 1 / (data.length - 1)) - 1;

  const compoundingData = data.map((tick, index) => {
    const compoundedValue = initialPrice * Math.pow(1 + dailyGrowthRate, index);
    return {
      x: tick.d * 24 * 60 * 60 * 1000,
      y: compoundedValue,
    };
  });

  const chartData = {
    datasets: [
      {
        label: 'Stock Price',
        data: data.map(tick => ({
          x: tick.d * 24 * 60 * 60 * 1000, // approximate date based on index
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
      {
        type: 'line' as const,
        label: `Compound Growth (${(dailyGrowthRate * 100).toFixed(3)}% daily)`,
        data: compoundingData,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: false,
        tension: 0,
      },
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
        display: true,
        position: 'top' as const,
        labels: {
          filter: function(item) {
            return item.text !== 'Stock Price'; // Hide candlestick legend for cleaner look
          }
        }
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
      zoom: {
        pan: {
          enabled: true,
          mode: 'xy' as const,
          threshold: 10,
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'xy' as const,
          sensitivity: 0.1,
        },
        limits: {
          x: { min: 'original' as const, max: 'original' as const },
          y: { min: 'original' as const, max: 'original' as const },
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
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          Use mouse wheel to zoom, drag to pan
        </div>
        <button
          onClick={resetZoom}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
        >
          Reset Zoom
        </button>
      </div>
      <div style={{ position: 'relative', height: '500px', width: '100%' }}>
        <Chart ref={chartRef} type="candlestick" data={chartData} options={options} />
      </div>
    </div>
  );
};
