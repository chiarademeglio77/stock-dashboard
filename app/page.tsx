"use client";

import { useEffect, useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PriceChart } from "@/components/PriceChart";
import { MetricsCard } from "@/components/MetricsCard";
import { generateHistoricalData } from "@/lib/data-engine";
import { calculateSMA, calculateEMA, calculateStandardDeviation, AnalysisResult } from "@/lib/analysis-engine";
import { TrendingUp, DollarSign, Activity, BarChart3 } from "lucide-react";
import { MOCK_ETFS, ETF } from "@/lib/mock-etfs";
import { ETFTable } from "@/components/ETFTable";
import { PortfolioTable } from "@/components/PortfolioTable";

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(val);
};

const formatNumber = (val: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
};

export default function Home() {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(365);
  const [selectedETF, setSelectedETF] = useState<ETF>(MOCK_ETFS[0]);
  const [zoomRange, setZoomRange] = useState<{ startIndex?: number; endIndex?: number }>({});

  // Custom Selection & Portfolio State
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [customEtfs, setCustomEtfs] = useState<ETF[]>([]);

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

  const handleAddTicker = (ticker: string) => {
    if (MOCK_ETFS.find(e => e.id === ticker) || customEtfs.find(e => e.id === ticker)) return;

    const newEtf: ETF = {
      id: ticker,
      name: ticker, // Will be updated if real data comes in
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
    // Refresh every 5 minutes
    const interval = setInterval(fetchQuotes, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
        const response = await fetch(`/api/market-data?ticker=${selectedETF.id}&days=${selectedPeriod}`);
        const rawData = await response.json();

        if (rawData.error) {
          console.warn("API returned error, falling back to simulation:", rawData.error);
          handleFallback();
          return;
        }

        // Calculate technical indicators
        const sma = calculateSMA(rawData, 20);
        const ema = calculateEMA(rawData, 50);
        const stdDev = calculateStandardDeviation(rawData, 20);

        const analyzed = rawData.map((d: any, i: number) => ({
          ...d,
          sma: sma[i] ?? undefined,
          ema: ema[i] ?? undefined,
          stdDev: stdDev[i] ?? undefined,
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
      const mockData = generateHistoricalData(selectedPeriod);
      const sma = calculateSMA(mockData, 20);
      const ema = calculateEMA(mockData, 50);
      const stdDev = calculateStandardDeviation(mockData, 20);

      const analyzed = mockData.map((d, i) => ({
        ...d,
        sma: sma[i] ?? undefined,
        ema: ema[i] ?? undefined,
        stdDev: stdDev[i] ?? undefined,
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

    return {
      ticker: selectedETF.id,
      name: selectedETF.name,
      price: formatCurrency(displayPrice),
      priceChange,
      volume: formatNumber(realQuote?.volume || current.volume),
      volChange,
      high: formatCurrency(realQuote?.high || current.high || 0),
      low: formatCurrency(realQuote?.low || current.low || 0),
    };
  }, [data, selectedETF, realQuotes]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Layout split into two main columns */}

        <div className="grid gap-6 lg:grid-cols-12 items-stretch">
          {/* Left Column: Currencies + ETF Table */}
          <div className="lg:col-span-4 flex flex-col space-y-4">
            {/* Currency Metrics Group */}
            <div className="grid grid-cols-2 gap-4 flex-shrink-0">
              <div className="p-4 rounded-xl border bg-card shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">EUR / USD</p>
                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                </div>
                <p className="text-lg font-bold">{realQuotes['EURUSD']?.price?.toFixed(4) || "1.0845"}</p>
                <div className="flex gap-4 mt-1">
                  <span className={`text-base font-bold ${realQuotes['EURUSD']?.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {realQuotes['EURUSD']?.changePercent >= 0 ? '+' : ''}{realQuotes['EURUSD']?.changePercent?.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-xl border bg-card shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">USD / CNY</p>
                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                </div>
                <p className="text-lg font-bold">{realQuotes['USDCNY']?.price?.toFixed(4) || "7.2450"}</p>
                <div className="flex gap-4 mt-1">
                  <span className={`text-base font-bold ${realQuotes['USDCNY']?.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {realQuotes['USDCNY']?.changePercent >= 0 ? '+' : ''}{realQuotes['USDCNY']?.changePercent?.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="h-[650px]">
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
          </div>

          {/* Right Column: Asset Metrics + Chart + Statistics + Portfolio */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            {/* Asset Metrics Group */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
              <MetricsCard
                title="Market Price"
                value={currentMetrics?.price || "€0.00"}
                change={currentMetrics?.priceChange}
                changeLabel="vs yesterday"
                icon={<Activity className="h-4 w-4" />}
              />
              <MetricsCard
                title="24h Volume"
                value={currentMetrics?.volume || "0"}
                change={currentMetrics?.volChange}
                changeLabel="vs yesterday"
                icon={<BarChart3 className="h-4 w-4" />}
              />
              <MetricsCard
                title="24h High"
                value={currentMetrics?.high || "€0.00"}
                icon={<TrendingUp className="h-4 w-4" />}
              />
              <MetricsCard
                title="24h Low"
                value={currentMetrics?.low || "€0.00"}
                icon={<Activity className="h-4 w-4" />}
              />
            </div>

            <div className="bg-card rounded-xl border px-6 py-4 shadow-sm h-[450px] flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg leading-none mb-1">Analysis Console: {selectedETF.id}</h3>
                  <p className="text-xs text-muted-foreground leading-none">{selectedETF.name}</p>
                  {isSimulation && (
                    <span className="inline-flex items-center rounded-md bg-yellow-500/10 px-2 py-1 text-[10px] font-bold text-yellow-500 ring-1 ring-inset ring-yellow-500/20 mt-1">
                      SIMULATION MODE (API RESTRICTED)
                    </span>
                  )}
                </div>
                <div className="flex bg-secondary rounded-lg p-1">
                  {[30, 90, 180, 365].map((days) => (
                    <button
                      key={days}
                      onClick={() => setSelectedPeriod(days)}
                      className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${selectedPeriod === days
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      {days}D
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 min-h-0 relative">
                {loading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                      <p className="mt-2 text-xs font-medium text-muted-foreground">Fetching market data...</p>
                    </div>
                  </div>
                )}
                <PriceChart
                  data={data}
                  startIndex={zoomRange.startIndex}
                  endIndex={zoomRange.endIndex}
                  onZoomChange={(range) => setZoomRange(range)}
                />
              </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
              <div className="p-3 rounded-xl border bg-card/50">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase mb-1">Trend</p>
                <p className={`text-md font-bold ${(data[data.length - 1]?.sma || 0) > (data[data.length - 1]?.ema || 0) ? "text-green-500" : "text-red-500"}`}>
                  {(data[data.length - 1]?.sma || 0) > (data[data.length - 1]?.ema || 0) ? "BULLISH" : "BEARISH"}
                </p>
              </div>
              <div className="p-3 rounded-xl border bg-card/50">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase mb-1">Volat. (SD)</p>
                <p className="text-md font-bold text-foreground">{(data[data.length - 1]?.stdDev || 0).toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-xl border bg-card/50">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase mb-1">Index Day Chg</p>
                <p className={`text-xl font-bold ${selectedETF.changePercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {selectedETF.changePercent >= 0 ? "+" : ""}{selectedETF.changePercent.toFixed(2)}%
                </p>
              </div>
              <div className="p-3 rounded-xl border bg-card/50">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase mb-1">Perf. YTD</p>
                <p className={`text-xl font-bold ${selectedETF.ytdChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {selectedETF.ytdChange >= 0 ? "+" : ""}{selectedETF.ytdChange.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Phase 2: Portfolio Component */}
            <PortfolioTable
              etfs={[...MOCK_ETFS, ...customEtfs]}
              realQuotes={realQuotes}
              portfolio={portfolio}
              onUpdateItem={updatePortfolioItem}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
