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

interface MarketOverviewProps {
    onToggleComparison?: (ticker: string) => void;
    activeComparisons?: Set<string>;
}

export function MarketOverview({ onToggleComparison, activeComparisons = new Set() }: MarketOverviewProps) {
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
            <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar scroll-smooth">
                {indices.map((index) => (
                    <div
                        key={index.id}
                        className="min-w-[220px] p-5 glass-card flex flex-col justify-between relative overflow-hidden group/item border-white/5"
                    >
                        {/* Status Glow */}
                        <div className={`absolute top-0 left-0 w-[2px] h-full ${index.changePercent >= 0 ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)]" : "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]"}`} />

                        <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] truncate max-w-[140px]">
                                    {index.name}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleComparison?.(index.id);
                                    }}
                                    className={`mt-1.5 flex items-center gap-1.5 px-2 py-0.5 rounded border transition-all ${activeComparisons.has(index.id)
                                        ? "bg-primary border-primary text-white shadow-[0_0_10px_rgba(30,64,175,0.3)]"
                                        : "bg-muted/10 border-transparent text-muted-foreground/60 hover:border-muted-foreground/30 hover:bg-muted/20"}`}
                                >
                                    <span className="text-sm">★</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest">Compare</span>
                                </button>
                            </div>
                            {index.changePercent >= 0 ? (
                                <TrendingUp className="h-3.5 w-3.5 text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            ) : (
                                <TrendingDown className="h-3.5 w-3.5 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                            )}
                        </div>

                        <div className="flex items-baseline gap-2 relative z-10 mb-4">
                            <span className="text-xl font-black tracking-tighter text-foreground">
                                {index.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded backdrop-blur-md ${index.changePercent >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                                {index.changePercent >= 0 ? "+" : ""}{index.changePercent.toFixed(2)}%
                            </span>
                        </div>

                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/20">
                            <div className="flex flex-col">
                                <span className="text-[8px] text-muted-foreground uppercase font-black tracking-widest">Local YTD</span>
                                <span className={`text-[11px] font-black ${index.ytdLocal >= 0 ? "text-green-500" : "text-red-500"}`}>
                                    {index.ytdLocal >= 0 ? "+" : ""}{index.ytdLocal.toFixed(1)}%
                                </span>
                            </div>
                            {index.currency !== "EUR" && (
                                <div className="flex flex-col items-end">
                                    <span className="text-[8px] text-primary uppercase font-black tracking-widest">EUR YTD</span>
                                    <span className={`text-[11px] font-black ${index.ytdEur >= 0 ? "text-green-500 shadow-[0_0_8px_rgba(34,197,94,0.2)]" : "text-red-500 shadow-[0_0_8px_rgba(239,68,68,0.2)]"}`}>
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
