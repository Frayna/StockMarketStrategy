import React, { useState, useCallback } from 'react';
import { useStockData } from '../hooks/useStockData';
import { StockChart } from './StockChart';
import { StockStats } from './StockStats';
import { CompoundComparisonPieChart } from './CompoundComparisonPieChart';
import { StockTick } from '../types/stockData';

export const StockDataDisplay: React.FC = () => {
  const [symbol, setSymbol] = useState('1rTCW8');
  const [visibleData, setVisibleData] = useState<StockTick[]>([]);
  const { data, stockName, loading, error, refetch } = useStockData(symbol);

  const handleVisibleDataChange = useCallback((newVisibleData: StockTick[], _windowStart: number, _windowSize: number) => {
    setVisibleData(newVisibleData);
  }, []);

  // Initialize visible data when main data changes
  React.useEffect(() => {
    if (data.length > 0 && visibleData.length === 0) {
      setVisibleData(data);
    }
  }, [data, visibleData.length]);

  const handleSymbolChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newSymbol = formData.get('symbol') as string;
    if (newSymbol && newSymbol !== symbol) {
      setSymbol(newSymbol);
      setVisibleData([]); // Reset visible data when symbol changes
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-700">Loading stock data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-red-600 text-xl mb-4">Error: {error}</div>
          <button
            onClick={refetch}
            className="relative px-6 py-2 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-500 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 overflow-hidden cursor-pointer before:absolute before:top-0 before:-left-full before:w-[200%] before:h-full before:bg-linear-to-r before:from-transparent before:via-white/25 before:to-transparent before:transition-transform before:duration-800 before:ease-out hover:before:translate-x-[50%]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4">
      <div className="w-full mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Stock Market Data Visualization</h1>
          <form onSubmit={handleSymbolChange} className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center max-w-2xl mx-auto">
            <div>
              <input
                type="text"
                name="symbol"
                defaultValue={symbol}
                placeholder="Enter stock symbol"
                className="w-[300px] px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
              />
            </div>
            <div className="flex flex-row gap-4">
              <button
                type="submit"
                className="relative flex-1 sm:flex-none px-6 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 border-none font-medium transition-all duration-500 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 overflow-hidden cursor-pointer before:absolute before:top-0 before:-left-full before:w-[200%] before:h-full before:bg-linear-to-r before:from-transparent before:via-white/25 before:to-transparent before:transition-transform before:duration-800 before:ease-out hover:before:translate-x-[50%]"
              >
                📊 Load
              </button>
              <button
                type="button"
                onClick={refetch}
                className="relative flex-1 sm:flex-none px-6 py-3 bg-linear-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 border-none font-medium transition-all duration-500 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 overflow-hidden cursor-pointer before:absolute before:top-0 before:-left-full before:w-[200%] before:h-full before:bg-linear-to-r before:from-transparent before:via-white/25 before:to-transparent before:transition-transform before:duration-800 before:ease-out hover:before:translate-x-[50%]"
              >
                🔄 Refresh
              </button>
            </div>
          </form>
        </div>

        {data.length > 0 ? (
          <>
            <div className="w-full mb-8">
              <StockChart
                data={data}
                title={stockName ? `${stockName} (${symbol})` : `${symbol} Stock Price Chart`}
                onVisibleDataChange={handleVisibleDataChange}
              />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
              <div className="w-full">
                <CompoundComparisonPieChart
                  data={visibleData.length > 0 ? visibleData : data}
                  title={`Price vs Compound Analysis - ${stockName || symbol}`}
                  isFiltered={visibleData.length > 0 && visibleData.length < data.length}
                  totalDataPoints={data.length}
                />
              </div>
              <div className="w-full">
                <StockStats
                  data={visibleData.length > 0 ? visibleData : data}
                  isFiltered={visibleData.length > 0 && visibleData.length < data.length}
                  totalDataPoints={data.length}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-xl">No data available for symbol: {symbol}</div>
          </div>
        )}
      </div>
    </div>
  );
};
