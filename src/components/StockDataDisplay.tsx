import React, { useState } from 'react';
import { useStockData } from '../hooks/useStockData';
import { StockChart } from './StockChart';

export const StockDataDisplay: React.FC = () => {
  const [symbol, setSymbol] = useState('1rTCW8');
  const { data, loading, error, refetch } = useStockData(symbol);

  const handleSymbolChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newSymbol = formData.get('symbol') as string;
    if (newSymbol && newSymbol !== symbol) {
      setSymbol(newSymbol);
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
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
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
            <div className="flex flex-row gap-12">
              <button
                type="submit"
                className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap"
              >
                Load
              </button>
              <button
                type="button"
                onClick={refetch}
                className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 whitespace-nowrap"
              >
                Refresh
              </button>
            </div>
          </form>
        </div>

        {data.length > 0 ? (
          <>
            <div className="w-full mb-8">
              <StockChart data={data} title={`${symbol} Stock Price Chart`} />
            </div>
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <div className="text-sm font-medium text-gray-500 mb-2">Data Points</div>
                  <div className="text-2xl font-bold text-gray-900">{data.length}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <div className="text-sm font-medium text-gray-500 mb-2">Latest Close Price</div>
                  <div className="text-2xl font-bold text-green-600">€{data[data.length - 1]?.c.toFixed(2)}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <div className="text-sm font-medium text-gray-500 mb-2">Latest High</div>
                  <div className="text-2xl font-bold text-blue-600">€{data[data.length - 1]?.h.toFixed(2)}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <div className="text-sm font-medium text-gray-500 mb-2">Latest Low</div>
                  <div className="text-2xl font-bold text-red-600">€{data[data.length - 1]?.l.toFixed(2)}</div>
                </div>
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
