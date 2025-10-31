import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { StockTick } from '../types/stockData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface StockChartProps {
  data: StockTick[];
  title?: string;
}

export const StockChart: React.FC<StockChartProps> = ({ data, title = 'Stock Price Chart' }) => {
  const chartData = {
    labels: data.map(tick => new Date(tick.d)),
    datasets: [
      {
        label: 'Close Price',
        data: data.map(tick => tick.c),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
      },
      {
        label: 'High Price',
        data: data.map(tick => tick.h),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderWidth: 1,
        fill: false,
        tension: 0.1,
      },
      {
        label: 'Low Price',
        data: data.map(tick => tick.l),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderWidth: 1,
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
        position: 'top' as const,
        labels: {
          padding: 20,
        },
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
        },
      },
      y: {
        title: {
          display: true,
          text: 'Price (€)',
        },
        grid: {
          display: true,
        },
      },
    },
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      <div style={{ position: 'relative', height: '500px', width: '100%' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};
