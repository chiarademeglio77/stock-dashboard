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
    "IITB": { yield: 3.50, months: [1, 7] }, // High yield for bonds
    "IDRE": { yield: 0.90, months: [2, 5, 8, 11] },
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
                // Simplified: if month is in the future this year, or next year
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
        <div className="bg-card rounded-xl border p-4 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Dividend Projections
                </h3>
                <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Est. Annual Total</p>
                    <p className="text-lg font-bold text-primary">€{annualTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
            </div>

            <div className="flex-1 space-y-3 overflow-auto">
                {nextDividends.length > 0 ? (
                    nextDividends.map((div, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-md bg-background border">
                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold leading-none mb-1">{div.ticker}</p>
                                    <p className="text-[10px] text-muted-foreground line-clamp-1">{div.date}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-green-500">+€{div.amount.toFixed(2)}</p>
                                <p className="text-[9px] text-muted-foreground">Estimated</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50 py-8">
                        <Calendar className="h-8 w-8 mb-2 text-muted-foreground" />
                        <p className="text-xs">No upcoming dividends found</p>
                    </div>
                )}
            </div>

            <p className="mt-4 text-[9px] text-muted-foreground italic text-center">
                * Projections based on historical yield and current holdings.
            </p>
        </div>
    );
}
