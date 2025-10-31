# Stock Market Strategy - React App

A React TypeScript application that fetches stock market data from the Boursorama API and displays it as an interactive graph using Chart.js.

## Features

- 📈 **Real-time Stock Data**: Fetches data from Boursorama API
- 📊 **Interactive Charts**: Displays High, Low, and Close prices with Chart.js
- 🔄 **Dynamic Symbol Loading**: Change stock symbols dynamically
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Clean and professional interface
- 🔄 **Auto-refresh**: Easy data refresh functionality
- 🛡️ **Error Handling**: Graceful fallback to mock data when API is unavailable

## Tech Stack

- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Chart.js** with react-chartjs-2 for data visualization
- **Axios** for HTTP requests
- **date-fns** for date handling in charts
- **Yarn** as package manager

## Getting Started

### Prerequisites

- Node.js (version 20.15.1 or higher recommended)
- Yarn package manager

### Installation

1. Clone the repository or use this existing setup
2. Install dependencies:
   ```bash
   yarn install
   ```

### Development

Start the development server:
```bash
yarn dev
```

The application will be available at `http://localhost:5173/`

### Building for Production

Build the application:
```bash
yarn build
```

Preview the production build:
```bash
yarn preview
```

## API Integration

The application fetches data from:
```
https://www.boursorama.com/bourse/action/graph/ws/GetTicksEOD
```

**Parameters:**
- `symbol`: Stock symbol (default: '1rTDCAM')
- `length`: Number of data points (default: 7300)
- `period`: Time period (default: 0)
- `guid`: Required empty parameter

## Project Structure

```
src/
├── components/
│   ├── StockChart.tsx          # Chart.js wrapper component
│   └── StockDataDisplay.tsx    # Main display component
├── hooks/
│   └── useStockData.ts         # Custom hook for data management
├── services/
│   └── stockDataService.ts     # API service layer
├── types/
│   └── stockData.ts            # TypeScript type definitions
├── App.tsx                     # Main app component
├── App.css                     # Application styles
└── main.tsx                    # React app entry point
```

## Usage

1. **Default View**: The app loads with the default symbol '1rTDCAM'
2. **Change Symbol**: Enter a new stock symbol in the input field and click "Load Data"
3. **Refresh Data**: Click the "Refresh" button to reload current data
4. **View Charts**: Interactive charts show High, Low, and Close prices over time
5. **Statistics**: View key metrics below the chart

## Development Notes

- **CORS Handling**: The app includes proper headers for API requests
- **Mock Data**: Falls back to generated mock data if the API is unavailable
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **TypeScript**: Full type safety throughout the application
- **Responsive**: Mobile-friendly design that works on all screen sizes

## Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint

## Browser Support

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge
