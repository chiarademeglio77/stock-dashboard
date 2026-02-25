"use client";

import { useMemo, useState, useEffect } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ETF } from "@/lib/mock-etfs";

interface PortfolioItem {
    id: string;
    quantity: number;
    purchasePrice: number;
    purchaseDate?: string;
    freeze1?: { value: number; date: string };
    freeze2?: { value: number; date: string };
}

interface PortfolioPerformanceChartProps {
    portfolio: PortfolioItem[];
    etfs: ETF[];
}

const COLORS = [
    "#3b82f6", // blue-500
    "#f97316", // orange-500
    "#10b981", // emerald-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#eab308", // yellow-500
    "#14b8a6", // teal-500
    "#f43f5e", // rose-500
    "#6366f1", // indigo-500
    "#84cc16", // lime-500
];

export function PortfolioPerformanceChart({ portfolio, etfs }: PortfolioPerformanceChartProps) {
    const [historicalData, setHistoricalData] = useState<Record<string, any[]>>({});
    const [loading, setLoading] = useState(false);

    // 1. Fetch historical data for all assets in the portfolio
    useEffect(() => {
        if (portfolio.length === 0) {
            setHistoricalData({});
            return;
        }

        async function fetchHistory() {
            setLoading(true);

            // Find the earliest purchase date to know how far back to fetch
            let earliestDate = new Date();
            portfolio.forEach(item => {
                if (item.purchaseDate) {
                    const pd = new Date(item.purchaseDate);
                    if (pd < earliestDate) earliestDate = pd;
                }
            });

            const today = new Date();
            const diffTime = Math.abs(today.getTime() - earliestDate.getTime());
            // Fetch at least 30 days, or the difference to the earliest purchase date plus a small buffer
            const daysToFetch = Math.max(30, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 5);

            console.log(`Fetching ${daysToFetch} days of history for ${portfolio.length} assets...`);
            const newData: Record<string, any[]> = {};
            await Promise.all(
                portfolio.map(async (item) => {
                    try {
                        const response = await fetch(`/api/market-data?ticker=${item.id}&days=${daysToFetch}&interval=1d`);
                        const data = await response.json();
                        console.log(`Received ${Array.isArray(data) ? data.length : "ERROR"} points for ${item.id}`);
                        if (!data.error && Array.isArray(data)) {
                            newData[item.id] = data;
                        }
                    } catch (e) {
                        console.error(`Failed to fetch history for ${item.id}`, e);
                    }
                })
            );

            setHistoricalData(newData);
            setLoading(false);
        }

        fetchHistory();
    }, [portfolio]);

    // 2. Process data into the split format requested by the user
    const chartData = useMemo(() => {
        if (portfolio.length === 0 || Object.keys(historicalData).length === 0) return [];

        // Build a unified chronological timeline from the fetched data
        const allDatesSet = new Set<string>();
        Object.values(historicalData).forEach(assetData => {
            if (Array.isArray(assetData)) {
                assetData.forEach(d => {
                    if (d && d.date) allDatesSet.add(d.date);
                });
            }
        });

        const sortedDates = Array.from(allDatesSet).sort();

        // Track last price to fill gaps (e.g., weekends)
        const lastPrices: Record<string, number> = {};

        // Build the return array
        return sortedDates.map(date => {
            const dataPoint: any = { date };
            let totalGain = 0;
            let totalLoss = 0;

            portfolio.forEach(item => {
                const assetHistory = historicalData[item.id];
                const safeId = item.id.replace(/[^a-zA-Z0-9]/g, "_");

                const quantity = Number(item.quantity) || 0;
                const purchasePrice = Number(item.purchasePrice) || 0;
                const buyDate = item.purchaseDate || "";

                // Find the price for this specific date
                const dayData = Array.isArray(assetHistory) ? assetHistory.find(d => d.date === date) : null;

                // Update last price if data exists for this day
                if (dayData && dayData.close !== undefined && dayData.close !== null) {
                    lastPrices[item.id] = Number(dayData.close);
                }

                const currentPrice = lastPrices[item.id];

                // If no price yet (before data starts) or before purchase date
                if (currentPrice === undefined || (buyDate && date < buyDate)) {
                    dataPoint[`${safeId}_gain`] = 0;
                    dataPoint[`${safeId}_loss`] = 0;
                    return;
                }

                // Calculate Gain/Loss
                const gainLoss = (currentPrice - purchasePrice) * quantity;

                // Split into gains (positive only) and losses (absolute value of negative)
                if (gainLoss > 0) {
                    dataPoint[`${safeId}_gain`] = gainLoss;
                    dataPoint[`${safeId}_loss`] = 0;
                    totalGain += gainLoss;
                } else if (gainLoss < 0) {
                    dataPoint[`${safeId}_gain`] = 0;
                    dataPoint[`${safeId}_loss`] = Math.abs(gainLoss);
                    totalLoss += Math.abs(gainLoss);
                } else {
                    dataPoint[`${safeId}_gain`] = 0;
                    dataPoint[`${safeId}_loss`] = 0;
                }
            });

            dataPoint.totalGain = totalGain;
            dataPoint.totalLoss = totalLoss;

            return dataPoint;
        });
    }, [portfolio, historicalData]);

    useEffect(() => {
        if (chartData.length > 0) {
            console.log("Performance Chart Data Points:", chartData.length);
            console.log("First Point:", chartData[0]);
            console.log("Last Point:", chartData[chartData.length - 1]);
        }
    }, [chartData]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val);
    };

    if (portfolio.length === 0) return null;

    return (
        <div className="glass-card flex flex-col w-full mt-6 border-secondary/10 shadow-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-1/2 w-96 h-96 bg-green-500/5 blur-[120px] -z-10" />
            <div className="absolute top-0 left-1/2 w-96 h-96 bg-red-500/5 blur-[120px] -z-10" />

            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h3 className="font-black text-xs text-secondary uppercase tracking-[0.2em]">Historical Performance</h3>
                    <p className="text-[10px] text-muted-foreground font-semibold mt-1">VOLUME OF GAINS VS LOSSES FROM PURCHASE DATE</p>
                </div>
                {loading && (
                    <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border border-primary border-t-transparent" />
                        <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Syncing History...</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[350px]">
                {/* Left Chart: Gains */}
                <div className="flex flex-col relative">
                    <h4 className="absolute top-2 left-6 z-10 text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                        Total Gains Volume
                    </h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} syncId="portfolioSync" margin={{ top: 40, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                {portfolio.map((item, idx) => {
                                    const safeId = item.id.replace(/[^a-zA-Z0-9]/g, "_");
                                    return (
                                        <linearGradient key={`grad-gain-${item.id}`} id={`colorGain${safeId}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.1} />
                                        </linearGradient>
                                    );
                                })}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickFormatter={(str) => {
                                const date = new Date(str);
                                return `${date.getDate()} ${date.toLocaleString('en-US', { month: 'short' })}`;
                            }}
                                minTickGap={30}
                            />
                            <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={formatCurrency} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                labelStyle={{ fontWeight: 'bold', color: '#475569', marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                                formatter={(value: number | undefined, name: string | undefined) => {
                                    if (!value || value === 0 || !name) return [null, null]; // Hide 0 values in tooltip
                                    return [formatCurrency(value), name.replace('_gain', ' Gain')];
                                }}
                            />
                            {portfolio.map((item, idx) => {
                                const safeId = item.id.replace(/[^a-zA-Z0-9]/g, "_");
                                return (
                                    <Area
                                        key={`gain-${safeId}`}
                                        type="linear"
                                        dataKey={`${safeId}_gain`}
                                        stackId="gains"
                                        stroke={COLORS[idx % COLORS.length]}
                                        fill={`url(#colorGain${safeId})`}
                                        strokeWidth={1.5}
                                        fillOpacity={0.8}
                                        activeDot={{ r: 4, strokeWidth: 0 }}
                                        connectNulls
                                        isAnimationActive={false}
                                    />
                                );
                            })}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Right Chart: Losses */}
                <div className="flex flex-col relative">
                    <h4 className="absolute top-2 left-6 z-10 text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                        Total Absolute Losses
                    </h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} syncId="portfolioSync" margin={{ top: 40, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                {portfolio.map((item, idx) => {
                                    const safeId = item.id.replace(/[^a-zA-Z0-9]/g, "_");
                                    return (
                                        <linearGradient key={`grad-loss-${item.id}`} id={`colorLoss${safeId}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.1} />
                                        </linearGradient>
                                    );
                                })}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickFormatter={(str) => {
                                const date = new Date(str);
                                return `${date.getDate()} ${date.toLocaleString('en-US', { month: 'short' })}`;
                            }}
                                minTickGap={30}
                            />
                            <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(val) => formatCurrency(val)} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                labelStyle={{ fontWeight: 'bold', color: '#475569', marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                                formatter={(value: number | undefined, name: string | undefined) => {
                                    if (!value || value === 0 || !name) return [null, null]; // Hide 0 values in tooltip
                                    return [`${formatCurrency(value)}`, name.replace('_loss', ' Loss')];
                                }}
                            />
                            {portfolio.map((item, idx) => {
                                const safeId = item.id.replace(/[^a-zA-Z0-9]/g, "_");
                                return (
                                    <Area
                                        key={`loss-${safeId}`}
                                        type="linear"
                                        dataKey={`${safeId}_loss`}
                                        stackId="losses"
                                        stroke={COLORS[idx % COLORS.length]}
                                        fill={`url(#colorLoss${safeId})`}
                                        strokeWidth={1.5}
                                        fillOpacity={0.8}
                                        activeDot={{ r: 4, strokeWidth: 0 }}
                                        connectNulls
                                        isAnimationActive={false}
                                    />
                                );
                            })}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Legend showing consistent colors across both charts */}
            <div className="mt-6 flex flex-wrap gap-4 justify-center border-t border-border/10 pt-4">
                {portfolio.map((item, idx) => (
                    <div key={`legend-${item.id}`} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-[10px] font-black text-secondary tracking-widest">{item.id}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
