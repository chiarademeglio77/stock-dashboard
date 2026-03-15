"use client";

import { useState } from "react";
import { ETF } from "@/lib/mock-etfs";
import { ArrowUp, ArrowDown, Star, Trash2 } from "lucide-react";

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
    onRemoveTicker?: (id: string) => void;
}

function ChangeCell({ value }: { value: number }) {
    const roundedValue = value.toFixed(2);
    const isActuallyZero = roundedValue === "0.00" || roundedValue === "-0.00";
    const isPos = !isActuallyZero && value > 0;
    const isNeg = !isActuallyZero && value < 0;
    
    return (
        <span className={`flex items-center gap-0.5 font-bold text-xs ${isPos ? "text-green-500" : isNeg ? "text-red-500" : "text-muted-foreground/60"}`}>
            {isPos && <ArrowUp className="h-3 w-3" />}
            {isNeg && <ArrowDown className="h-3 w-3" />}
            {Math.abs(value).toFixed(2)}%
        </span>
    );
}

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(val);
};

export function ETFTable({ etfs, selectedId, onSelect, realQuotes, pinnedIds, onTogglePin, showPinnedOnly, onToggleFilter, onAddTicker, onRemoveTicker }: ETFTableProps) {
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
        <div className="glass-card flex flex-col h-full overflow-hidden border-primary/10">
            <div className="px-6 py-4 border-b border-border/50 flex-shrink-0 space-y-3 bg-card/20 backdrop-blur-md">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-black text-xs uppercase tracking-widest text-primary">Market Assets</h3>
                        <p className="text-[10px] text-muted-foreground font-medium">Select to analyze</p>
                    </div>
                    {pinnedIds && pinnedIds.length > 0 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleFilter?.(); }}
                            className={`text-[9px] font-bold px-2 py-1 rounded border transition-all ${showPinnedOnly ? "bg-primary text-primary-foreground border-primary shadow-[0_0_10px_rgba(34,211,238,0.3)]" : "bg-transparent text-muted-foreground border-border/50 hover:border-primary hover:text-primary"}`}
                        >
                            {showPinnedOnly ? "PINNED" : "ALL"}
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
                        placeholder="ADD TICKER (E.G. AAPL, BTC-USD)"
                        className="flex-1 bg-background/50 border border-border/50 rounded-md px-3 py-1.5 text-[10px] font-bold tracking-wider focus:ring-1 ring-primary/50 outline-none uppercase placeholder:text-muted-foreground/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="bg-primary hover:bg-primary/80 text-primary-foreground px-4 py-1.5 rounded-md text-[10px] font-black transition-all uppercase shadow-lg shadow-primary/10"
                    >
                        ADD
                    </button>
                </form>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
                <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-card/80 backdrop-blur-md">
                        <tr className="border-b border-border/50">
                            <th className="w-8 px-2 py-2"></th>
                            <th className="text-left px-3 py-2 text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Symbol</th>
                            <th className="text-left px-3 py-2 text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Name</th>
                            <th className="text-right px-3 py-2 text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Price</th>
                            <th className="text-right px-3 py-2 text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Day Chg</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                        {etfs.map((etf) => {
                            const realQuote = realQuotes?.[etf.id];
                            const price = realQuote?.price || etf.price;
                            const change = typeof realQuote?.changePercent === 'number' ? realQuote.changePercent : etf.changePercent;
                            const isPinned = pinnedIds?.includes(etf.id);

                            return (
                                <tr
                                    key={etf.id}
                                    onClick={() => onSelect(etf)}
                                    className={`cursor-pointer transition-all hover:bg-primary/5 border-l-2 ${selectedId === etf.id ? "bg-primary/10 border-primary" : "border-transparent"
                                        }`}
                                >
                                    <td className="px-2 py-2 text-center w-8">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onTogglePin?.(etf.id);
                                            }}
                                            className={`transition-colors ${isPinned ? "text-yellow-500 hover:text-yellow-400" : "text-muted-foreground/30 hover:text-muted-foreground"}`}
                                            title={isPinned ? "Unpin asset" : "Pin asset"}
                                        >
                                            <Star className="h-3.5 w-3.5" fill={isPinned ? "currentColor" : "none"} />
                                        </button>
                                    </td>
                                    <td className="px-3 py-2">
                                        <span className="font-black tracking-tighter text-primary text-sm">{etf.id}</span>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="font-bold text-[9px] leading-tight text-foreground uppercase truncate max-w-[120px]">{etf.name}</div>
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <span className="font-black text-xs tracking-tight">{formatCurrency(price || 0)}</span>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex justify-end items-center gap-2">
                                            <ChangeCell value={change || 0} />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onRemoveTicker?.(etf.id);
                                                }}
                                                className="text-red-500/80 hover:text-red-600 transition-colors"
                                                title="Remove from terminal"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
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
