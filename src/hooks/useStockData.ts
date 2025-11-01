import { useState, useEffect } from 'react';
import { StockTick } from '../types/stockData';
import { StockDataService } from '../services/stockDataService';

export const useStockData = (symbol: string = '1rTDCAM') => {
  const [data, setData] = useState<StockTick[]>([]);
  const [stockName, setStockName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await StockDataService.fetchStockData(symbol);
	  console.log('Fetched stock data:', result);
      setData(result.data);
      setStockName(result.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [symbol]);

  const refetch = () => {
    fetchData();
  };

  return {
    data,
    stockName,
    loading,
    error,
    refetch
  };
};
