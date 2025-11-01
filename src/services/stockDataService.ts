import { StockTick } from '../types/stockData';

// Use proxy endpoint in development, direct API in production
const BOURSORAMA_API_URL = import.meta.env.DEV
  ? '/api/bourse/action/graph/ws/GetTicksEOD'
  : 'https://www.boursorama.com/bourse/action/graph/ws/GetTicksEOD';

export interface StockDataResult {
  data: StockTick[];
  name: string;
  symbol: string;
}

export class StockDataService {
  static async fetchStockData(
    symbol: string = '1rTCW8',
    length: number = 7300,
    period: number = 0
  ): Promise<StockDataResult> {
    try {
      const params = new URLSearchParams({
        symbol,
        length: length.toString(),
        period: period.toString(),
        guid: ''
      });

      console.log('Fetching data with params:', { symbol, length, period, guid: '' });

      const url = `${BOURSORAMA_API_URL}?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData = await response.json();

      console.log('API Response:', apiData.d?.QuoteTab);
      console.log('Stock Name:', apiData.d?.Name);

      if (apiData && apiData.d && apiData.d.QuoteTab && Array.isArray(apiData.d.QuoteTab)) {
        // Expected nested structure
        console.log('Nested structure found');
        return {
          data: apiData.d.QuoteTab,
          name: apiData.d.Name || symbol,
          symbol: symbol
        };
      } else {
        console.log('Unknown response structure, no data available');
        return {
          data: [],
          name: symbol,
          symbol: symbol
        };
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
      // Return error structure instead of throwing
      return {
        data: [],
        name: symbol,
        symbol: symbol
      };
    }
  }
}
