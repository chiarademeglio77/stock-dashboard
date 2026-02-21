"use client";

import { useState, useMemo } from "react";
import { AnalysisResult } from "@/lib/analysis-engine";
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";

interface BacktestingToolProps {
    data: AnalysisResult[];
    ticker: string;
}

export function BacktestingTool({ data, ticker }: BacktestingToolProps) {
    const [initialInvestment, setInitialInvestment] = useState<number>(1000);
    const [startDateIdx, setStartDateIdx] = useState<number>(0);

    const result = useMemo(() => {
        if (!data || data.length < 2) return null;

        const start = data[Math.min(startDateIdx, data.length - 1)];
        const current = data[data.length - 1];

        const shares = initialInvestment / start.close;
        const currentValue = shares * current.close;
        const profit = currentValue - initialInvestment;
        const profitPercent = (profit / initialInvestment) * 100;

        return {
            startPrice: start.close,
            startDate: start.date,
            currentPrice: current.close,
            currentValue,
            profit,
            profitPercent,
            shares
        };
    }, [data, initialInvestment, startDateIdx]);

    if (!data || data.length === 0) return null;

    return (
        <div className="glass-card flex flex-col p-5 border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] -z-10" />

            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2 mb-6">
                <TrendingUp className="h-3.5 w-3.5 text-primary shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                Investment Simulator
            </h3>

            <div className="grid grid-cols-1 gap-5 mb-8">
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Initial Capital (€)</label>
                    <div className="relative group/input">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary transition-transform group-focus-within/input:scale-110" />
                        <input
                            type="number"
                            value={initialInvestment}
                            onChange={(e) => setInitialInvestment(Number(e.target.value))}
                            className="w-full bg-background/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm font-black tracking-tight focus:ring-1 focus:ring-primary/50 outline-none transition-all hover:bg-background/60"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Entry Vector (Date)</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <select
                            value={startDateIdx}
                            onChange={(e) => setStartDateIdx(Number(e.target.value))}
                            className="w-full bg-background/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs font-black tracking-tight focus:ring-1 focus:ring-primary/50 outline-none transition-all hover:bg-background/60 appearance-none cursor-pointer"
                        >
                            {data.slice(0, data.length - 1).map((d, i) => (
                                <option key={i} value={i} className="bg-background text-foreground">
                                    {new Date(d.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {result && (
                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 relative group/result overflow-hidden transition-all hover:bg-primary/10">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-[40px] -z-10" />

                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Simulated Yield</p>
                    <p className="text-3xl font-black mb-2 tracking-tighter text-foreground">
                        €{result.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center text-xs font-black ${result.profit >= 0 ? "text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]" : "text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]"}`}>
                            {result.profit >= 0 ? "+" : ""}€{result.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className={`text-[10px] font-black px-2 py-0.5 rounded-full ${result.profit >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                            {result.profitPercent >= 0 ? "+" : ""}{result.profitPercent.toFixed(2)}%
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">Shares Issued</span>
                            <span className="text-xs font-black text-foreground">{result.shares.toFixed(4)}</span>
                        </div>
                        <div className="flex flex-col gap-1 items-end text-right">
                            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">Entry Lock-in</span>
                            <span className="text-xs font-black text-foreground">€{result.startPrice.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
