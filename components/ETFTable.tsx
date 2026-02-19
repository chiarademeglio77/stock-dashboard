"use client";

import { useState } from "react";
import { ETF } from "@/lib/mock-etfs";
import { ArrowUp, ArrowDown, Star } from "lucide-react";

interface ETFTableProps {
    etfs: ETF[];
    selectedId: string;
    onSelect: (etf: ETF) => void;
    realQuotes?: Record<string, any>;
    pinnedIds?: string[];
    onTogglePin?: (id: string) => void;
    showPinnedOnly?: boolean;
    onToggleFilter?: () => void;
    onAddTicker?: (ticker: string) => void;
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

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
    }).format(val);
};

export function ETFTable({ etfs, selectedId, onSelect, realQuotes, pinnedIds, onTogglePin, showPinnedOnly, onToggleFilter, onAddTicker }: ETFTableProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery) return;

        setIsSearching(true);
        // We'll pass this up to a new prop onAddTicker if we want Home to handle it
        // For now, let's assume page.tsx will provide onAddTicker
    };

    return (
        <div className="bg-card rounded-xl border shadow-sm flex flex-col h-full overflow-hidden">
            <div className="px-6 py-4 border-b flex-shrink-0 space-y-3">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold text-lg">Market Assets</h3>
                        <p className="text-sm text-muted-foreground">Select to analyze</p>
                    </div>
                    {pinnedIds && pinnedIds.length > 0 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleFilter?.(); }}
                            className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors ${showPinnedOnly ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-muted hover:border-primary"}`}
                        >
                            {showPinnedOnly ? "SHOW ALL" : "FAVORITES ONLY"}
                        </button>
                    )}
                </div>

                {/* Search / Add Ticker Input */}
                <form className="relative flex gap-2" onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery) {
                        onAddTicker?.(searchQuery.toUpperCase());
                        setSearchQuery("");
                    }
                }}>
                    <input
                        type="text"
                        placeholder="Add ticker (e.g. AAPL, BTC-USD)"
                        className="flex-1 bg-muted/50 border-none rounded-lg px-3 py-2 text-xs focus:ring-1 ring-primary outline-none uppercase"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-[10px] font-bold hover:bg-primary/90 transition-colors uppercase"
                    >
                        Add
                    </button>
                </form>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted">
                <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-card">
                        <tr className="border-b bg-muted/30">
                            <th className="w-10 px-4 py-3"></th>
                            <th className="text-left px-6 py-3 font-medium text-muted-foreground">Symbol</th>
                            <th className="text-left px-6 py-3 font-medium text-muted-foreground">Name</th>
                            <th className="text-right px-6 py-3 font-medium text-muted-foreground">Price</th>
                            <th className="text-right px-6 py-3 font-medium text-muted-foreground">Day Chg</th>
                            <th className="text-right px-6 py-3 font-medium text-muted-foreground">YTD Chg</th>
                        </tr>
                    </thead>
                    <tbody>
                        {etfs.map((etf) => {
                            const realQuote = realQuotes?.[etf.id];
                            const price = realQuote?.price || etf.price;
                            const change = typeof realQuote?.changePercent === 'number' ? realQuote.changePercent : etf.changePercent;
                            const isPinned = pinnedIds?.includes(etf.id);

                            return (
                                <tr
                                    key={etf.id}
                                    onClick={() => onSelect(etf)}
                                    className={`border-b cursor-pointer transition-colors hover:bg-muted/40 ${selectedId === etf.id ? "bg-primary/10" : ""
                                        }`}
                                >
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onTogglePin?.(etf.id);
                                            }}
                                            className={`transition-colors ${isPinned ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground/30 hover:text-muted-foreground"}`}
                                        >
                                            <Star className="h-4 w-4" fill={isPinned ? "currentColor" : "none"} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-3 font-mono font-bold text-primary">{etf.id}</td>
                                    <td className="px-6 py-3 text-foreground max-w-[200px]">
                                        <div className="font-medium text-xs leading-tight">{etf.name}</div>
                                    </td>
                                    <td className="px-6 py-3 text-right font-medium">
                                        {formatCurrency(price || 0)}
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex justify-end">
                                            <ChangeCell value={change || 0} />
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
