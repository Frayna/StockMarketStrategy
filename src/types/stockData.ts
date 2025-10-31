export interface StockTick {
  d: number; // Date timestamp
  o: number; // Open price
  h: number; // High price
  l: number; // Low price
  c: number; // Close price
  v: number; // Volume
}

export interface StockDataResponse {
  d: {
    QuoteTab: {
      ticks: StockTick[];
    };
  };
}
