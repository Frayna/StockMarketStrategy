import axios from 'axios';
import { StockTick } from '../types/stockData';

// Use proxy endpoint in development, direct API in production
const BOURSORAMA_API_URL = import.meta.env.DEV
  ? '/api/bourse/action/graph/ws/GetTicksEOD'
  : 'https://www.boursorama.com/bourse/action/graph/ws/GetTicksEOD';

export class StockDataService {
  static async fetchStockData(
    symbol: string = '1rTDCAM',
    length: number = 7300,
    period: number = 0
  ): Promise<StockTick[]> {
    try {
      const params = {
        symbol,
        length,
        period,
        guid: ''
      };

      console.log('Fetching data with params:', params);

      const response = await axios.get<any>(BOURSORAMA_API_URL, {
        params,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      console.log('API Response:', response.data.d.QuoteTab);
      if (response.data && response.data.d && response.data.d.QuoteTab && Array.isArray(response.data.d.QuoteTab)) {
        // Expected nested structure
        console.log('Nested structure found');
        return response.data.d.QuoteTab;
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
