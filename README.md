# 📊 Historical Multi-Market Dashboard

An interactive and modern financial dashboard built with **Next.js**, providing real-time and historical analysis for ETFs and stocks listed on the **Borsa Italiana (Milan)**.

![Version 1.0](https://img.shields.io/badge/Version-1.0-blue)
![Next.js](https://img.shields.io/badge/Framework-Next.js-black)
![Tailwind CSS](https://img.shields.io/badge/Styling-TailwindCSS-38B2AC)
![Recharts](https://img.shields.io/badge/Charts-Recharts-FF6384)

## ✨ Features

- **Real-Time Market Data**: Integrated with Yahoo Finance for up-to-date quotes and accurate historical data.
- **Automatic Technical Analysis**: Instant calculation of Simple Moving Averages (SMA), Exponential Moving Averages (EMA), and Standard Deviation directly in the browser.
- **Interactive Interface**: Zoomable charts with selection persistence and fluid time period management (30d, 90d, 1y, Max).
- **Borsa Italiana Focus**: Full support for Milan tickers (e.g., `VUSA.MI`, `SWDA.MI`, `FTSEMIB.MI`) with prices displayed in **Euro (€)**.
- **Performance & Caching**: Smart caching system (1 hour) to optimize API requests and ensure extreme speed.

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

This project demonstrates proficiency in handling external APIs, visualizing complex data sets, and building dynamic, professional-grade user interfaces within the Next.js ecosystem.

---
Created by [Chiara De Meglio](https://github.com/chiarademeglio77)
