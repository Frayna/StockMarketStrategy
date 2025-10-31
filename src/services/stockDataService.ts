import { StockTick } from '../types/stockData';

// Use proxy endpoint in development, direct API in production
const BOURSORAMA_API_URL = import.meta.env.DEV
  ? '/api/bourse/action/graph/ws/GetTicksEOD'
  : 'https://www.boursorama.com/bourse/action/graph/ws/GetTicksEOD';

export class StockDataService {
  static async fetchStockData(
    symbol: string = '1rTCW8',
    length: number = 7300,
    period: number = 0
  ): Promise<StockTick[]> {
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

      const data = await response.json();

      console.log('API Response:', data.d?.QuoteTab);
      if (data && data.d && data.d.QuoteTab && Array.isArray(data.d.QuoteTab)) {
        // Expected nested structure
        console.log('Nested structure found');
        return data.d.QuoteTab;
      } else {
        console.log('Unknown response structure, no data available');
        return [];
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
      throw error; // Let the error bubble up instead of returning mock data
    }
  }
}
