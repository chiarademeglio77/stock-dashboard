# 📊 Chiara Finance Terminal https://stock-dashboard-mauve-seven.vercel.app/

A professional-grade, interactive financial dashboard built with **Next.js**, designed to provide real-time portfolio management, market comparison, and historical financial analysis. This tool empowers users to track their favorite assets, backtest investment strategies, and analyze market trends.

![Version 1.0](https://img.shields.io/badge/Version-1.0-blue)
![Next.js](https://img.shields.io/badge/Framework-Next.js-black)
![Tailwind CSS](https://img.shields.io/badge/Styling-TailwindCSS-38B2AC)
![Recharts](https://img.shields.io/badge/Charts-Recharts-FF6384)

## ✨ Tool Capabilities & Features

- **Personalized Portfolio Management**: Users can search for specific exchange-traded funds (ETFs) or stocks, pin them to their watchlist, and build a local portfolio with custom holdings, purchase dates, and average costs.
- **Deep Market Analytics & Visualization**: Integrated with Yahoo Finance to fetch real-time and historical pricing. Dynamic, zoomable Recharts graphs render time-series data with smooth transitions across multiple timeframes (30d, 90d, 1y, YTD, Max).
- **Multi-Asset Comparison**: Select multiple assets from your portfolio to overlay their historical performance on a single, synchronized comparison chart.
- **Backtesting Engine**: Simulate historical investments. Enter an initial capital amount and an entry date to calculate absolute yields, periodic performance, and theoretical growth alongside market benchmarks like the S&P 500.
- **Sticky Note Market Context**: Drop contextual sticky notes directly onto your dashboard to record market events, investment thesis, or qualitative trading notes.
- **Local Browser Persistence**: Your custom watchlist, portfolio shares, and notes are securely stored in your browser's `localStorage`, meaning your data never leaves your device and automatically persists between sessions.
- **Borsa Italiana & Global Focus**: Primarily designed for tracking Milan-listed assets (e.g., `SWDA.MI`, `VUSA.MI`, `EGIN.MI`) with prices shown in Euro (€), alongside major global FX crosses (EUR/USD, EUR/GBP, etc.).

## 🚀 Tech Stack

- **Frontend**: React 18, Next.js 14 (App Router).
- **Styling**: Tailwind CSS for responsive design and Lucide React for iconography.
- **Visualization**: Recharts for dynamic data rendering.
- **Data Source**: `yahoo-finance2` for market data retrieval.
- **Analysis**: Custom TypeScript calculation engine for technical indicators.

## 🛠️ Local Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/chiarademeglio77/stock-dashboard.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 💼 Portfolio Highlight

This project (https://stock-dashboard-mauve-seven.vercel.app/) demonstrates proficiency in handling external APIs, visualizing complex data sets, and building dynamic, professional-grade user interfaces within the Next.js ecosystem.

<img src="Dashboard%20Stock.jpg" width="800">
---
Created by [Chiara De Meglio](https://github.com/chiarademeglio77)
