import React, { useState, useMemo, useCallback } from 'react';
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
  LineController,
  LegendItem,
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
  LineElement,
  PointElement,
  LineController,
  CandlestickController,
  CandlestickElement
);

interface StockChartProps {
  data: StockTick[];
  title?: string;
  onVisibleDataChange?: (visibleData: StockTick[], windowStart: number, windowSize: number) => void;
}

export const StockChart: React.FC<StockChartProps> = ({ data, title = 'Stock Price Chart', onVisibleDataChange }) => {
  const chartRef = React.useRef<ChartJS<'candlestick'>>(null);
  const panRef = React.useRef<HTMLDivElement>(null);

  // State for data window (zoom/pan)
  const [windowSize, setWindowSize] = useState(Math.min(1000, data.length));
  const [windowStart, setWindowStart] = useState(Math.max(0, data.length - windowSize));

  // Pan state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);

  // Get the visible data slice
  const visibleData = useMemo(() => {
    const start = Math.max(0, windowStart);
    const end = Math.min(data.length, windowStart + windowSize);
    return data.slice(start, end);
  }, [data, windowStart, windowSize]);

  // Notify parent when visible data changes
  React.useEffect(() => {
    if (onVisibleDataChange) {
      onVisibleDataChange(visibleData, windowStart, windowSize);
    }
  }, [visibleData, windowStart, windowSize, onVisibleDataChange]);

  // Navigation functions

  const zoomIn = useCallback(() => {
    const newSize = Math.max(10, Math.floor(windowSize * 0.7));
    const centerPoint = windowStart + windowSize / 2;
    const newStart = Math.max(0, Math.min(data.length - newSize, centerPoint - newSize / 2));
    setWindowSize(newSize);
    setWindowStart(newStart);
  }, [windowSize, windowStart, data.length]);

  const zoomOut = useCallback(() => {
    const newSize = Math.min(data.length, Math.floor(windowSize * 1.4));
    const centerPoint = windowStart + windowSize / 2;
    const newStart = Math.max(0, Math.min(data.length - newSize, centerPoint - newSize / 2));
    setWindowSize(newSize);
    setWindowStart(newStart);
  }, [windowSize, windowStart, data.length]);

  const resetView = useCallback(() => {
    setWindowSize(Math.min(1000, data.length));
    setWindowStart(Math.max(0, data.length - Math.min(1000, data.length)));
  }, [data.length]);

  // Pan handlers
  const handlePanStart = useCallback((clientX: number) => {
    setIsDragging(true);
    setDragStart(clientX);
  }, []);

  const handlePanMove = useCallback((clientX: number) => {
    if (!isDragging) return;

    const deltaX = clientX - dragStart;
    const panSensitivity = 2; // Adjust sensitivity
    const deltaPoints = Math.floor(-deltaX / panSensitivity);

    if (Math.abs(deltaPoints) > 0) {
      setWindowStart(prev => {
        const newStart = Math.max(0, Math.min(data.length - windowSize, prev + deltaPoints));
        return newStart;
      });
      setDragStart(clientX);
    }
  }, [isDragging, dragStart, data.length, windowSize]);

  const handlePanEnd = useCallback(() => {
    setIsDragging(false);
    setDragStart(0);
  }, []);

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handlePanStart(e.clientX);
  }, [handlePanStart]);



  // Touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handlePanStart(touch.clientX);
  }, [handlePanStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handlePanMove(touch.clientX);
  }, [handlePanMove]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handlePanEnd();
  }, [handlePanEnd]);

  // Global mouse event listeners for dragging
  React.useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handlePanMove(e.clientX);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handlePanEnd();
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.body.style.cursor = 'grabbing';
    } else {
      document.body.style.cursor = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.body.style.cursor = '';
    };
  }, [isDragging, handlePanMove, handlePanEnd]);

  // Calculate percentage-based compounding effect using visible data
  const initialPrice = visibleData.length > 0 ? visibleData[0].c : 0;
  const finalPrice = visibleData.length > 0 ? visibleData[visibleData.length - 1].c : 0;

  // Calculate the daily growth rate that would result in the same total return
  const totalReturn = (finalPrice - initialPrice) / initialPrice;
  const dailyGrowthRate = visibleData.length > 1 ? Math.pow(1 + totalReturn, 1 / (visibleData.length - 1)) - 1 : 0;

  const compoundingData = visibleData.map((tick, index) => {
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
        data: visibleData.map(tick => ({
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
    animation: {
      duration: 0, // Disable all animations
    },
    transitions: {
      active: {
        animation: {
          duration: 0
        }
      },
      resize: {
        animation: {
          duration: 0
        }
      }
    },
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
          filter: function(item: LegendItem) {
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
            return data.o && data.h && data.l && data.c ? [
              `Open: €${data.o?.toFixed(2) || 'N/A'}`,
              `High: €${data.h?.toFixed(2) || 'N/A'}`,
              `Low: €${data.l?.toFixed(2) || 'N/A'}`,
              `Close: €${data.c?.toFixed(2) || 'N/A'}`,
            ] : [];
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
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          <div>Showing {visibleData.length} of {data.length} data points (from {windowStart + 1} to {windowStart + visibleData.length})</div>
          <div className="text-xs mt-1 text-gray-500">Drag the chart area to pan • Use zoom buttons to change time range</div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={zoomIn}
            disabled={windowSize <= 10}
            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Zoom In
          </button>
          <button
            onClick={zoomOut}
            disabled={windowSize >= data.length}
            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Zoom Out
          </button>
          <button
            onClick={resetView}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Pan indicator bar */}
      <div className="mb-4">
        <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-blue-500 rounded-full transition-all duration-150"
            style={{
              left: `${(windowStart / data.length) * 100}%`,
              width: `${(windowSize / data.length) * 100}%`
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Start of data</span>
          <span>End of data</span>
        </div>
      </div>

      <div
        ref={panRef}
        style={{ position: 'relative', height: '500px', width: '100%' }}
        className={`select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Chart ref={chartRef} type="candlestick" data={chartData} options={options} />
      </div>
    </div>
  );
};
