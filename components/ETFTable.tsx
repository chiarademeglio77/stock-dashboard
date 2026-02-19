"use client";

import { ETF } from "@/lib/mock-etfs";
import { ArrowUp, ArrowDown } from "lucide-react";

interface ETFTableProps {
    etfs: ETF[];
    selectedId: string;
    onSelect: (etf: ETF) => void;
    realQuotes?: Record<string, any>;
}

function ChangeCell({ value }: { value: number }) {
    const isPos = value >= 0;
    return (
        <span className={`flex items-center gap-1 font-bold text-base ${isPos ? "text-green-500" : "text-red-500"}`}>
            {isPos ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            {Math.abs(value).toFixed(2)}%
        </span>
    );
}

export function ETFTable({ etfs, selectedId, onSelect, realQuotes }: ETFTableProps) {
    return (
        <div className="bg-card rounded-xl border shadow-sm flex flex-col h-full overflow-hidden">
            <div className="px-6 py-4 border-b flex-shrink-0">
                <h3 className="font-semibold text-lg">Market Assets</h3>
                <p className="text-sm text-muted-foreground">Select to analyze</p>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted">
                <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-card">
                        <tr className="border-b bg-muted/30">
                            <th className="text-left px-6 py-3 font-medium text-muted-foreground">Symbol</th>
                            <th className="text-left px-6 py-3 font-medium text-muted-foreground">Name</th>
                            <th className="text-right px-6 py-3 font-medium text-muted-foreground">Price</th>
                            <th className="text-right px-6 py-3 font-medium text-muted-foreground">Daily Δ</th>
                            <th className="text-right px-6 py-3 font-medium text-muted-foreground">YTD Δ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {etfs.map((etf) => {
                            const realQuote = realQuotes?.[etf.id];
                            const price = realQuote?.price || etf.price;
                            const change = realQuote?.changePercent || etf.changePercent;

                            return (
                                <tr
                                    key={etf.id}
                                    onClick={() => onSelect(etf)}
                                    className={`border-b cursor-pointer transition-colors hover:bg-muted/40 ${selectedId === etf.id ? "bg-primary/10" : ""
                                        }`}
                                >
                                    <td className="px-6 py-3 font-mono font-bold text-primary">{etf.id}</td>
                                    <td className="px-6 py-3 text-foreground max-w-[200px]">
                                        <div className="font-medium">{etf.name}</div>
                                        <div className="text-xs text-muted-foreground truncate">{etf.description}</div>
                                    </td>
                                    <td className="px-6 py-3 text-right font-medium">€{price.toFixed(2)}</td>
                                    <td className="px-6 py-3">
                                        <div className="flex justify-end">
                                            <ChangeCell value={change} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex justify-end">
                                            <ChangeCell value={etf.ytdChange} />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
