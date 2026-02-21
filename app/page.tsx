"use client";

import { useEffect, useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PriceChart } from "@/components/PriceChart";
import { MetricsCard } from "@/components/MetricsCard";
import { generateHistoricalData } from "@/lib/data-engine";
import { calculateSMA, calculateEMA, calculateStandardDeviation, calculateBollingerBands, calculateRSI, calculateMACD, calculateVolatility, calculateBeta, AnalysisResult } from "@/lib/analysis-engine";
import { MOCK_ETFS, ETF } from "@/lib/mock-etfs";
import { ETFTable } from "@/components/ETFTable";
import { PortfolioTable } from "@/components/PortfolioTable";
import { MarketOverview } from "@/components/MarketOverview";
import { NewsSection } from "@/components/NewsSection";
import { DiversificationChart } from "@/components/DiversificationChart";
import { DividendSection } from "@/components/DividendSection";
import { BacktestingTool } from "@/components/BacktestingTool";
import { TrendingUp, DollarSign, Activity, BarChart3, Download, ShieldAlert, Globe } from "lucide-react";

const formatCurrency = (val: number, decimals = 2) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
};

const formatNumber = (val: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
};

export default function Home() {
  const [selectedPeriod, setSelectedPeriod] = useState<number | "YTD">(365);
  const [selectedETF, setSelectedETF] = useState<ETF>(MOCK_ETFS[0]);
  const [zoomRange, setZoomRange] = useState<{ startIndex?: number; endIndex?: number }>({});

  // Custom Selection & Portfolio State
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [customEtfs, setCustomEtfs] = useState<ETF[]>([]);
  const [comparisonETFs, setComparisonETFs] = useState<Set<string>>(new Set());
  const [comparisonDataMap, setComparisonDataMap] = useState<Record<string, AnalysisResult[]>>({});
  const [marketBenchmarkData, setMarketBenchmarkData] = useState<AnalysisResult[]>([]);
  const [compLoading, setCompLoading] = useState(false);

  // Load selection and portfolio from localStorage
  useEffect(() => {
    const savedPinned = localStorage.getItem("pinned_tickers");
    if (savedPinned) setPinnedIds(JSON.parse(savedPinned));

    const savedPortfolio = localStorage.getItem("user_portfolio");
    if (savedPortfolio) setPortfolio(JSON.parse(savedPortfolio));

    const savedFilter = localStorage.getItem("show_pinned_only");
    if (savedFilter === "true") setShowPinnedOnly(true);

    const savedCustom = localStorage.getItem("custom_tickers");
    if (savedCustom) setCustomEtfs(JSON.parse(savedCustom));
  }, []);

  // Persist pinnedIds
  useEffect(() => {
    localStorage.setItem("pinned_tickers", JSON.stringify(pinnedIds));
  }, [pinnedIds]);

  // Persist portfolio
  useEffect(() => {
    localStorage.setItem("user_portfolio", JSON.stringify(portfolio));
  }, [portfolio]);

  // Persist filter
  useEffect(() => {
    localStorage.setItem("show_pinned_only", showPinnedOnly.toString());
  }, [showPinnedOnly]);

  // Persist custom tickers
  useEffect(() => {
    localStorage.setItem("custom_tickers", JSON.stringify(customEtfs));
  }, [customEtfs]);

  const togglePin = (id: string) => {
    setPinnedIds(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );

    // Also add to portfolio if not there, up to 10 stocks
    setPortfolio(prev => {
      if (prev.find(p => p.id === id)) {
        return prev.filter(p => p.id !== id);
      } else {
        if (prev.length >= 10) return prev; // Limit to 10
        // Find existing cost or default to 0
        return [...prev, { id, quantity: 1, purchasePrice: 0 }];
      }
    });
  };

  const handleAddTicker = async (ticker: string) => {
    const cleanTicker = ticker.trim().toUpperCase();
    if (MOCK_ETFS.find(e => e.id === cleanTicker) || customEtfs.find(e => e.id === cleanTicker)) return;

    // Check if it's likely an ISIN (12 chars) or just a ticker that needs resolution
    if (cleanTicker.length >= 10 || !cleanTicker.includes('.')) {
      try {
        const res = await fetch(`/api/market-data/search?query=${cleanTicker}`);
        const result = await res.json();

        if (result && result.ticker) {
          if (MOCK_ETFS.find(e => e.id === result.ticker) || customEtfs.find(e => e.id === result.ticker)) {
            console.log("Ticker already exists after resolution:", result.ticker);
            return;
          }

          const newEtf: ETF = {
            id: result.ticker,
            name: result.name || result.ticker,
            description: "Custom added asset",
            price: 0,
            previousPrice: 0,
            changePercent: 0,
            ytdChange: 0,
            startOfYearPrice: 0
          };
          setCustomEtfs(prev => [...prev, newEtf]);
          return;
        }
      } catch (e) {
        console.error("Smart search failed, falling back to literal ticker:", e);
      }
    }

    // Fallback: add as literal ticker if search failed or it's a short ticker
    const newEtf: ETF = {
      id: cleanTicker,
      name: cleanTicker,
      description: "Custom added asset",
      price: 0,
      previousPrice: 0,
      changePercent: 0,
      ytdChange: 0,
      startOfYearPrice: 0
    };
    setCustomEtfs(prev => [...prev, newEtf]);
  };

  const updatePortfolioItem = (updated: any) => {
    setPortfolio(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  // Reset zoom ONLY when the total period changes
  useEffect(() => {
    setZoomRange({});
  }, [selectedPeriod]);

  const [data, setData] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSimulation, setIsSimulation] = useState(false);
  const [realQuotes, setRealQuotes] = useState<Record<string, any>>({});
  const [fxYtdData, setFxYtdData] = useState<Record<string, number>>({});

  const ytdPerformance = useMemo(() => {
    if (!data || data.length < 2) return 0;
    const currentYear = new Date().getFullYear();
    // Find the first price of the current year from the available data
    const firstOfYear = data.find(d => new Date(d.date).getFullYear() === currentYear);
    if (!firstOfYear) return 0;
    return ((data[data.length - 1].close / firstOfYear.close) - 1) * 100;
  }, [data]);

  // Fetch all real quotes for the table
  useEffect(() => {
    async function fetchQuotes() {
      try {
        const response = await fetch('/api/market-data/batch');
        const quotes = await response.json();

        // Safety check: ensure 'quotes' is an array before calling reduce
        if (Array.isArray(quotes)) {
          const quotesMap = quotes.reduce((acc: any, q: any) => {
            acc[q.symbol] = q;
            return acc;
          }, {});
          setRealQuotes(quotesMap);

          // Update customEtfs names if they are currently just the ticker
          setCustomEtfs(prev => {
            let changed = false;
            const updated = prev.map(etf => {
              const q = quotesMap[etf.id];
              if (q && q.name && etf.name !== q.name) {
                changed = true;
                return { ...etf, name: q.name };
              }
              return etf;
            });
            return changed ? updated : prev;
          });
        } else {
          console.warn("Batch quotes API did not return an array:", quotes);
        }
      } catch (err) {
        console.error("Failed to fetch batch quotes:", err);
      }
    }
    fetchQuotes();

    // Fetch SPY for market beta
    async function fetchMarketBenchmark() {
      try {
        const response = await fetch(`/api/market-data?ticker=SPY&days=365&interval=1d`);
        const data = await response.json();
        if (!data.error) setMarketBenchmarkData(data);
      } catch (e) {
        console.error("Failed to fetch SPY benchmark", e);
      }
    }
    fetchMarketBenchmark();

    // Fetch FX YTD for sidebar
    async function fetchFxYtd() {
      const fxTickers = ["EURUSD", "EURGBP", "EURCNY"];
      const results: Record<string, number> = {};
      await Promise.all(fxTickers.map(async (ticker) => {
        try {
          const res = await fetch(`/api/market-data?ticker=${ticker}&days=365&interval=1d`);
          const raw = await res.json();
          if (Array.isArray(raw) && raw.length > 2) {
            const currentYear = new Date().getFullYear();
            const firstOfYear = raw.find((d: any) => new Date(d.date).getFullYear() === currentYear) || raw[0];
            results[ticker] = ((raw[raw.length - 1].close / firstOfYear.close) - 1) * 100;
          }
        } catch (e) {
          console.error(`Failed to fetch YTD for ${ticker}`, e);
        }
      }));
      setFxYtdData(results);
    }
    fetchFxYtd();

    // Refresh every 5 minutes
    const interval = setInterval(fetchQuotes, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch comparison data when comparisonETFs or period changes
  useEffect(() => {
    if (comparisonETFs.size === 0) {
      setComparisonDataMap({});
      return;
    }

    async function fetchAllCompData() {
      setCompLoading(true);
      const interval = selectedPeriod === 1 ? '5m' : '1d';
      const newDataMap: Record<string, AnalysisResult[]> = {};

      await Promise.all(Array.from(comparisonETFs).map(async (ticker) => {
        try {
          let days = selectedPeriod === "YTD"
            ? Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24)) + 1
            : selectedPeriod;

          const response = await fetch(`/api/market-data?ticker=${ticker}&days=${days}&interval=${interval}`);
          const rawData = await response.json();
          if (!rawData.error) {
            newDataMap[ticker] = rawData;
          }
        } catch (err) {
          console.error(`Failed to fetch data for ${ticker}:`, err);
        }
      }));

      setComparisonDataMap(newDataMap);
      setCompLoading(false);
    }
    fetchAllCompData();
  }, [comparisonETFs, selectedPeriod]);

  // Clear old provider caches (one-time cleanup)
  useEffect(() => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('fmp_data_') || key.startsWith('eodhd_data_')) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  // Fetch real data from our API proxy
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setIsSimulation(false);
      const cacheKey = `yahoo_data_${selectedETF.id}_${selectedPeriod}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        try {
          const { timestamp, payload } = JSON.parse(cached);
          // Cache valid for 1 hour for Yahoo Finance
          if (Date.now() - timestamp < 1 * 60 * 60 * 1000) {
            setData(payload);
            setIsSimulation(false);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Corrupted cache found, clearing:", e);
          localStorage.removeItem(cacheKey);
        }
      }

      try {
        let days = selectedPeriod === "YTD"
          ? Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24)) + 1
          : selectedPeriod;

        const interval = days === 1 ? '5m' : '1d';
        const response = await fetch(`/api/market-data?ticker=${selectedETF.id}&days=${days}&interval=${interval}`);
        const rawData = await response.json();

        if (rawData.error) {
          console.warn("API returned error, falling back to simulation:", rawData.error);
          handleFallback();
          return;
        }

        // Calculate technical indicators
        const sma = calculateSMA(rawData, 20);
        const ema = calculateEMA(rawData, 50);
        const ema200 = calculateEMA(rawData, 200);
        const stdDev = calculateStandardDeviation(rawData, 20);
        const { bbUpper, bbLower } = calculateBollingerBands(rawData, sma, stdDev);
        const rsi = calculateRSI(rawData, 14);
        const { macdLine, signalLine, histogram } = calculateMACD(rawData);

        const analyzed = rawData.map((d: any, i: number) => ({
          ...d,
          sma: sma[i] ?? undefined,
          ema: ema[i] ?? undefined,
          ema200: ema200[i] ?? undefined,
          stdDev: stdDev[i] ?? undefined,
          bbUpper: bbUpper[i] ?? undefined,
          bbLower: bbLower[i] ?? undefined,
          rsi: rsi[i] ?? undefined,
          macd: macdLine[i] ?? undefined,
          macdSignal: signalLine[i] ?? undefined,
          macdHist: histogram[i] ?? undefined,
        }));

        setData(analyzed);
        setIsSimulation(false);
        localStorage.setItem(cacheKey, JSON.stringify({
          timestamp: Date.now(),
          payload: analyzed
        }));
      } catch (err: any) {
        console.error("Failed to fetch market data, falling back to mock:", err);
        handleFallback();
      } finally {
        setLoading(false);
      }
    }

    function handleFallback() {
      setIsSimulation(true);
      // Fallback to mock data on error so the app doesn't crash
      let days = selectedPeriod === "YTD" ? 365 : selectedPeriod;
      const mockData = generateHistoricalData(days);
      const sma = calculateSMA(mockData, 20);
      const ema = calculateEMA(mockData, 50);
      const ema200 = calculateEMA(mockData, 200);
      const stdDev = calculateStandardDeviation(mockData, 20);
      const { bbUpper, bbLower } = calculateBollingerBands(mockData, sma, stdDev);
      const rsi = calculateRSI(mockData, 14);
      const { macdLine, signalLine, histogram } = calculateMACD(mockData);

      const analyzed = mockData.map((d, i) => ({
        ...d,
        sma: sma[i] ?? undefined,
        ema: ema[i] ?? undefined,
        ema200: ema200[i] ?? undefined,
        stdDev: stdDev[i] ?? undefined,
        bbUpper: bbUpper[i] ?? undefined,
        bbLower: bbLower[i] ?? undefined,
        rsi: rsi[i] ?? undefined,
        macd: macdLine[i] ?? undefined,
        macdSignal: macdLine[i] ?? undefined,
        macdHist: histogram[i] ?? undefined,
      }));
      setData(analyzed);
    }

    fetchData();
  }, [selectedPeriod, selectedETF]);

  const currentMetrics = useMemo(() => {
    if (!data || data.length === 0) return null;
    const current = data[data.length - 1];

    // Use real prices if available, otherwise fallback to mock
    const realQuote = realQuotes[selectedETF.id] || (data.length > 0 ? data[data.length - 1] : null);
    const displayPrice = realQuote?.price || current.close || selectedETF.price;
    const priceChange = realQuote?.changePercent || selectedETF.changePercent;
    const volChange = selectedETF.id === "ETFMIB" ? 40.2 : -12.5;

    const volValue = realQuote?.volume || current.volume || 0;

    return {
      ticker: selectedETF.id,
      name: selectedETF.name,
      price: formatCurrency(displayPrice),
      priceChange,
      volume: volValue > 1000 ? formatNumber(volValue) : volValue.toString(),
      volChange,
      high: formatCurrency(realQuote?.high || current.high || 0),
      low: formatCurrency(realQuote?.low || current.low || 0),
    };
  }, [data, selectedETF, realQuotes]);

  const portfolioRisk = useMemo(() => {
    if (portfolio.length === 0 || marketBenchmarkData.length < 2) return { beta: 1, volatility: 0 };

    let totalValue = 0;
    let weightedBeta = 0;
    let weightedVol = 0;

    portfolio.forEach(item => {
      const etf = [...MOCK_ETFS, ...customEtfs].find(e => e.id === item.id);
      if (!etf) return;

      const quote = realQuotes[item.id] || { price: etf.price };
      const value = item.quantity * quote.price;
      totalValue += value;

      // Note: Individual beta/vol calculation here is simplified
      // In a real app, we'd fetch historical data for each asset
      // For now, we'll use a placeholder or calculate if we have data for the current asset
      if (item.id === selectedETF.id && data.length > 2) {
        const beta = calculateBeta(data, marketBenchmarkData);
        const vol = calculateVolatility(data);
        weightedBeta += beta * value;
        weightedVol += vol * value;
      } else {
        // Placeholder for other assets in portfolio
        weightedBeta += 1 * value;
        weightedVol += 0.15 * value;
      }
    });

    if (totalValue === 0) return { beta: 1, volatility: 0 };
    return {
      beta: weightedBeta / totalValue,
      volatility: weightedVol / totalValue
    };
  }, [portfolio, selectedETF, data, marketBenchmarkData, realQuotes, customEtfs]);

  const handleExportCSV = () => {
    if (!data || data.length === 0) return;

    const headers = ["Date", "Open", "High", "Low", "Close", "Volume", "SMA", "EMA", "RSI", "MACD"];
    const rows = data.map(d => [
      d.date,
      d.open.toFixed(2),
      d.high.toFixed(2),
      d.low.toFixed(2),
      d.close.toFixed(2),
      d.volume,
      (d.sma || 0).toFixed(2),
      (d.ema || 0).toFixed(2),
      (d.rsi || 0).toFixed(2),
      (d.macd || 0).toFixed(2)
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${selectedETF.id}_market_data.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full pb-8">
        {/* Left Column: Sidebar Assets (3) */}
        <aside className="lg:col-span-3 flex flex-col space-y-4">
          <div className="grid grid-cols-3 gap-2 flex-shrink-0">
            {['EURUSD', 'EURGBP', 'EURCNY'].map((pair) => {
              const symbols: Record<string, { label: string, icon: any, color: string }> = {
                'EURUSD': { label: 'EUR/USD', icon: DollarSign, color: 'primary' },
                'EURGBP': { label: 'EUR/GBP', icon: TrendingUp, color: 'secondary' },
                'EURCNY': { label: 'EUR/CNY', icon: DollarSign, color: 'primary' }
              };
              const { label, icon: Icon, color } = symbols[pair];
              const quote = realQuotes[pair] || { price: 0, changePercent: 0 };
              const ytd = fxYtdData[pair];

              return (
                <div key={pair} className={`p-2 rounded-lg border glass-card border-${color}/20 flex flex-col items-center text-center relative overflow-hidden`}>
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter mb-1">{label}</p>
                  <p className="text-xs font-black text-foreground truncate w-full">
                    {quote.price.toFixed(4)}
                  </p>
                  <div className="flex flex-col items-center gap-0.5 mt-1">
                    <span className={`text-[8px] font-black ${quote.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {quote.changePercent >= 0 ? '+' : ''}{quote.changePercent?.toFixed(2)}%
                    </span>
                    {ytd !== undefined && (
                      <span className={`text-[7px] font-bold text-muted-foreground/60`}>
                        YTD {ytd >= 0 ? '+' : ''}{ytd.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex-1 overflow-hidden">
            <ETFTable
              etfs={showPinnedOnly
                ? [...MOCK_ETFS, ...customEtfs].filter(e => pinnedIds.includes(e.id))
                : [...MOCK_ETFS, ...customEtfs]
              }
              selectedId={selectedETF.id}
              onSelect={(etf) => setSelectedETF(etf)}
              realQuotes={realQuotes}
              pinnedIds={pinnedIds}
              onTogglePin={togglePin}
              showPinnedOnly={showPinnedOnly}
              onToggleFilter={() => setShowPinnedOnly(!showPinnedOnly)}
              onAddTicker={handleAddTicker}
            />
          </div>
        </aside>

        {/* Main Content Area (9 columns) */}
        <div className="lg:col-span-9 flex flex-col space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Center Column: Analysis Console (2/3 of the 9-col area) */}
            <main className="lg:col-span-2 flex flex-col space-y-6">
              <div className="glass-card flex flex-col h-[800px] p-6 border-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] -z-10" />

                <div className="flex justify-between items-start mb-6 flex-shrink-0">
                  <div className="space-y-1">
                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                      <Activity className="h-3 w-3" /> Terminal Analysis
                    </h3>
                    <div className="flex items-baseline gap-3">
                      <h1 className="text-4xl font-black tracking-tighter text-foreground">{selectedETF.id}</h1>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{selectedETF.name}</span>
                    </div>
                    {isSimulation && (
                      <span className="inline-block px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 text-[9px] font-black uppercase tracking-widest border border-yellow-500/20">
                        Simulation Mode Active
                      </span>
                    )}
                  </div>
                  <div className="flex bg-secondary/5 rounded-lg p-1 border border-border/10">
                    <div className="flex bg-card/40 rounded-md p-0.5">
                      {[1, 30, 90, 180, 365, "YTD"].map((period) => (
                        <button
                          key={period}
                          onClick={() => setSelectedPeriod(period as any)}
                          className={`px-3 py-1 text-[9px] font-black rounded transition-all ${selectedPeriod === period
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                          {period === 1 ? "1D" : period === "YTD" ? "YTD" : `${period}D`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-h-0 relative mb-6">
                  {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                    </div>
                  )}
                  <PriceChart
                    data={data}
                    startIndex={zoomRange.startIndex}
                    endIndex={zoomRange.endIndex}
                    onZoomChange={(range) => setZoomRange(range)}
                    comparisonDataMap={comparisonDataMap}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-1">
                  <MetricsCard
                    title="Market Value"
                    value={currentMetrics?.price || "€0.00"}
                    change={currentMetrics?.priceChange}
                    changeLabel="24H"
                    secondaryChange={ytdPerformance}
                    secondaryLabel="YTD"
                    icon={<Activity className="h-4 w-4 text-primary" />}
                  />
                  <MetricsCard
                    title="Vol / 24H"
                    value={currentMetrics?.volume || "0"}
                    change={currentMetrics?.volChange}
                    changeLabel="Δ"
                    icon={<BarChart3 className="h-4 w-4 text-secondary" />}
                  />
                  <MetricsCard
                    title="High / 24H"
                    value={currentMetrics?.high || "€0.00"}
                    icon={<TrendingUp className="h-4 w-4 text-green-500" />}
                  />
                  <MetricsCard
                    title="Low / 24H"
                    value={currentMetrics?.low || "€0.00"}
                    icon={<Activity className="h-4 w-4 text-red-500" />}
                  />
                </div>
              </div>
            </main>

            {/* Right Column: Intelligence & Strategy (1/3 of the 9-col area) */}
            <aside className="lg:col-span-1 flex flex-col space-y-6">
              <div className="space-y-2">
                <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] flex items-center gap-2 px-1">
                  <Globe className="h-3 w-3" /> Market Vectors
                </h3>
                <MarketOverview
                  activeComparisons={comparisonETFs}
                  onToggleComparison={(ticker) => {
                    setComparisonETFs(prev => {
                      const next = new Set(prev);
                      if (next.has(ticker)) next.delete(ticker);
                      else next.add(ticker);
                      return next;
                    });
                  }}
                />
              </div>

              <div className="max-h-[500px] flex flex-col">
                <NewsSection ticker={selectedETF.id} />
              </div>
            </aside>
          </div>

          {/* Bottom Section: Unified Analytics (Full 9-col width) */}
          <div className="flex flex-col space-y-6">
            <PortfolioTable
              etfs={[...MOCK_ETFS, ...customEtfs]}
              realQuotes={realQuotes}
              portfolio={portfolio}
              onUpdateItem={updatePortfolioItem}
            />

            <div className="glass-card p-6 border-secondary/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Backtest Engine</h3>
                  </div>
                  <BacktestingTool data={data} ticker={selectedETF.id} />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Asset Diversification</h3>
                  </div>
                  <DiversificationChart portfolio={portfolio} etfs={[...MOCK_ETFS, ...customEtfs]} realQuotes={realQuotes} />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Yield Projections</h3>
                  </div>
                  <DividendSection portfolio={portfolio} etfs={[...MOCK_ETFS, ...customEtfs]} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >
    </DashboardLayout >
  );
}
