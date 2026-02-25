"use client";

import { ETF } from "@/lib/mock-etfs";
import { format } from "date-fns";
import { DollarSign, Calendar } from "lucide-react";

interface DividendSectionProps {
    portfolio: { id: string; quantity: number; purchasePrice: number }[];
    etfs: ETF[];
}

// Mock dividend data (yield per share per year)
const MOCK_DIVIDENDS: Record<string, { yield: number, months: number[] }> = {
    "ETFMIB": { yield: 0.85, months: [5, 11] },
    "XBKA": { yield: 0.45, months: [4, 10] },
    "VEUR": { yield: 1.20, months: [3, 6, 9, 12] },
    "VUSA": { yield: 1.15, months: [3, 6, 9, 12] },
    "SWDA": { yield: 0.95, months: [6, 12] },
    "IITB": { yield: 3.50, months: [1, 7] },
    "IDRE": { yield: 0.90, months: [2, 5, 8, 11] },
    "UCG": { yield: 2.10, months: [4] }, // UniCredit
    "ISP": { yield: 0.28, months: [5, 11] }, // Intesa
    "ENI": { yield: 0.94, months: [3, 5, 9, 11] },
    "ENEL": { yield: 0.43, months: [1, 7] },
    "STLAM": { yield: 1.55, months: [4] }, // Stellantis
    "G": { yield: 1.28, months: [5] }, // Generali
    "RACE": { yield: 2.44, months: [5] }, // Ferrari
    "RBOT": { yield: 0.05, months: [6] },
    "SEML": { yield: 0.12, months: [6] },
};

export function DividendSection({ portfolio, etfs }: DividendSectionProps) {
    const nextDividends = (() => {
        const results: { ticker: string; name: string; amount: number; date: string }[] = [];
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // 1-12

        portfolio.forEach(item => {
            const etf = etfs.find(e => e.id === item.id);
            const divInfo = MOCK_DIVIDENDS[item.id];
            if (!etf || !divInfo) return;

            divInfo.months.forEach(month => {
                let year = now.getFullYear();
                if (month < currentMonth) year++;

                const amount = (divInfo.yield / divInfo.months.length) * item.quantity;
                results.push({
                    ticker: item.id,
                    name: etf.name,
                    amount,
                    date: format(new Date(year, month - 1, 15), "MMM dd, yyyy")
                });
            });
        });

        return results.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);
    })();

    const annualTotal = portfolio.reduce((acc, item) => {
        const divInfo = MOCK_DIVIDENDS[item.id];
        return acc + (divInfo ? divInfo.yield * item.quantity : 0);
    }, 0);

    return (
        <div className="bg-card rounded-xl border p-5 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
                    <DollarSign className="h-3 w-3 text-primary" />
                    Yield Projections
                </h3>
                <div className="text-right">
                    <p className="text-[10px] text-muted-foreground/60 uppercase font-bold tracking-tight">Est. Annual Total</p>
                    <p className="text-xl font-bold text-primary tracking-tight">€{annualTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
            </div>

            <div className="flex-1 space-y-2.5 overflow-auto pr-1">
                {nextDividends.length > 0 ? (
                    nextDividends.map((div, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors border border-slate-100/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-md bg-white border border-slate-200">
                                    <Calendar className="h-3 w-3 text-blue-500" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold text-secondary leading-none">{div.ticker}</p>
                                    <p className="text-[10px] font-semibold text-blue-700/70">{div.date}</p>
                                </div>
                            </div>
                            <div className="text-right space-y-0.5">
                                <p className="text-sm font-bold text-green-600">+€{div.amount.toFixed(2)}</p>
                                <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-tighter">Projected</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-8">
                        <Calendar className="h-8 w-8 mb-2 text-muted-foreground" />
                        <p className="text-xs font-semibold">No upcoming dividends</p>
                    </div>
                )}
            </div>

            <p className="mt-5 text-[9px] text-muted-foreground/60 font-medium italic text-center">
                * Based on historical yield for known assets.
            </p>
        </div>
    );
}
