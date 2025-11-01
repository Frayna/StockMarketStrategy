import { StockTick } from '../types/stockData';

// Use proxy endpoint in development, CORS proxy in production
const BOURSORAMA_BASE_URL = 'https://www.boursorama.com/bourse/action/graph/ws/GetTicksEOD';

const BOURSORAMA_API_URL = import.meta.env.DEV
  ? '/api/bourse/action/graph/ws/GetTicksEOD'
  : BOURSORAMA_BASE_URL;

// CORS proxy services for production fallback
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
];

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
    const params = new URLSearchParams({
      symbol,
      length: length.toString(),
      period: period.toString(),
      guid: ''
    });

    console.log('Fetching data with params:', { symbol, length, period, guid: '' });

    // In development, use the proxy
    if (import.meta.env.DEV) {
      return await this.fetchWithUrl(`${BOURSORAMA_API_URL}?${params.toString()}`, symbol);
    }

    // In production, try CORS proxies with fallback
    const baseUrl = `${BOURSORAMA_BASE_URL}?${params.toString()}`;
    
    // First try direct request (might work in some cases)
    try {
      return await this.fetchWithUrl(baseUrl, symbol);
    } catch (error) {
      console.log('Direct request failed, trying CORS proxies...');
    }

    // Try each CORS proxy
    for (const proxy of CORS_PROXIES) {
      try {
        const proxyUrl = proxy + encodeURIComponent(baseUrl);
        console.log(`Trying CORS proxy: ${proxy}`);
        return await this.fetchWithUrl(proxyUrl, symbol);
      } catch (error) {
        console.log(`CORS proxy ${proxy} failed:`, error);
        continue;
      }
    }

    throw new Error('All CORS proxies failed');
  }

  private static async fetchWithUrl(url: string, symbol?: string): Promise<StockDataResult> {
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
        name: apiData.d.Name || symbol || 'Unknown',
        symbol: symbol || 'Unknown'
      };
    } else {
      console.log('Unknown response structure, no data available');
      return {
        data: [],
        name: symbol || 'Unknown',
        symbol: symbol || 'Unknown'
      };
    }
  }
}
