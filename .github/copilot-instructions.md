<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Stock Market Strategy Project

This is a React TypeScript application for visualizing stock market data fetched from the Boursorama API.

## Project Structure
- Uses React with TypeScript for type safety
- Chart.js with react-chartjs-2 for data visualization
- Native fetch API for HTTP requests
- Custom hooks for data management
- Responsive design with modern UI

## Key Components
- `StockDataService`: Handles API requests to Boursorama
- `useStockData`: Custom hook for managing stock data state
- `StockChart`: Chart.js wrapper for displaying price charts
- `StockDataDisplay`: Main component orchestrating the UI

## API Integration
The app fetches data from: `https://www.boursorama.com/bourse/action/graph/ws/GetTicksEOD`
- Includes CORS handling and fallback to mock data for development
- Supports different stock symbols and time periods

## Development Notes
- Uses Yarn as package manager
- Vite for fast development and building
- ESLint for code quality
- Mock data fallback for testing when API is unavailable
