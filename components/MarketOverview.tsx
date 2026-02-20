"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Globe } from "lucide-react";

interface IndexData {
    id: string;
    name: string;
    price: number;
    changePercent: number;
    ytdLocal: number;
    ytdEur: number;
    currency: string;
}

export function MarketOverview() {
    const [indices, setIndices] = useState<IndexData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOverview() {
            try {
                const res = await fetch("/api/market-data/overview");
                const data = await res.json();
                if (Array.isArray(data)) {
                    setIndices(data);
                }
            } catch (e) {
                console.error("Overview fetch failed:", e);
            } finally {
                setLoading(false);
            }
        }
        fetchOverview();
        const interval = setInterval(fetchOverview, 10 * 60 * 1000); // 10 min refresh
        return () => clearInterval(interval);
    }, []);

    if (loading && indices.length === 0) {
        return (
            <div className="flex gap-4 overflow-hidden py-2 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="min-w-[150px] h-16 bg-muted rounded-xl border" />
                ))}
            </div>
        );
    }

    return (
        <div className="relative group">
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                {indices.map((index) => (
                    <div
                        key={index.id}
                        className="min-w-[180px] p-3 rounded-xl border bg-card/50 hover:bg-card transition-colors shadow-sm flex flex-col justify-between"
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate max-w-[100px]">
                                {index.name}
                            </span>
                            {index.changePercent >= 0 ? (
                                <TrendingUp className="h-3 w-3 text-green-500" />
                            ) : (
                                <TrendingDown className="h-3 w-3 text-red-500" />
                            )}
                        </div>

                        <div className="flex items-baseline gap-2">
                            <span className="text-sm font-bold">
                                {index.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                            <span className={`text-[10px] font-bold ${index.changePercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                                {index.changePercent >= 0 ? "+" : ""}{index.changePercent.toFixed(2)}%
                            </span>
                        </div>

                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50">
                            <div className="flex flex-col">
                                <span className="text-[9px] text-muted-foreground uppercase font-semibold">YTD Local</span>
                                <span className={`text-[10px] font-bold ${index.ytdLocal >= 0 ? "text-green-500" : "text-red-500"}`}>
                                    {index.ytdLocal >= 0 ? "+" : ""}{index.ytdLocal.toFixed(1)}%
                                </span>
                            </div>
                            {index.currency !== "EUR" && (
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] text-blue-500 uppercase font-semibold">YTD EUR</span>
                                    <span className={`text-[10px] font-bold ${index.ytdEur >= 0 ? "text-green-500" : "text-red-500"}`}>
                                        {index.ytdEur >= 0 ? "+" : ""}{index.ytdEur.toFixed(1)}%
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
