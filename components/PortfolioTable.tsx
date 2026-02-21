"use client";

import { useState, useMemo } from "react";
import { ETF } from "@/lib/mock-etfs";
import { ArrowUp, ArrowDown, Snowflake, Edit2, Check, X, Trash2 } from "lucide-react";

interface PortfolioItem {
    id: string;
    quantity: number;
    purchasePrice: number;
    freeze1?: { value: number; date: string };
    freeze2?: { value: number; date: string };
}

interface PortfolioTableProps {
    etfs: ETF[];
    realQuotes: Record<string, any>;
    portfolio: PortfolioItem[];
    onUpdateItem: (item: PortfolioItem) => void;
    onRemoveItems?: (ids: string[]) => void;
}

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
        maximumFractionDigits: 4,
    }).format(val);
};

export function PortfolioTable({ etfs, realQuotes, portfolio, onUpdateItem, onRemoveItems }: PortfolioTableProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<{ quantity: string; purchasePrice: string }>({ quantity: "", purchasePrice: "" });
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleSelection = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const handleEdit = (item: PortfolioItem) => {
        setEditingId(item.id);
        setEditValues({
            quantity: item.quantity.toString(),
            purchasePrice: item.purchasePrice.toString()
        });
    };

    const handleSave = (id: string) => {
        onUpdateItem({
            ...portfolio.find(p => p.id === id)!,
            id,
            quantity: parseFloat(editValues.quantity) || 0,
            purchasePrice: parseFloat(editValues.purchasePrice) || 0
        });
        setEditingId(null);
    };

    const handleFreeze = (id: string, slot: 1 | 2) => {
        const item = portfolio.find(p => p.id === id);
        if (!item) return;

        const realQuote = realQuotes[id];
        const currentPrice = realQuote?.price || etfs.find(e => e.id === id)?.price || 0;
        const profit = (currentPrice - item.purchasePrice) * item.quantity;
        const date = new Date().toLocaleDateString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit' });

        onUpdateItem({
            ...item,
            [slot === 1 ? "freeze1" : "freeze2"]: { value: profit, date }
        });
    };

    const totals = useMemo(() => {
        return portfolio.reduce((acc, item) => {
            const etf = etfs.find(e => e.id === item.id);
            const realQuote = realQuotes[item.id];
            const currentPrice = realQuote?.price || etf?.price || 0;
            const dailyChange = (realQuote?.change || 0) * item.quantity;
            const totalProfit = (currentPrice - item.purchasePrice) * item.quantity;
            const marketValue = currentPrice * item.quantity;

            return {
                marketValue: acc.marketValue + marketValue,
                dailyChange: acc.dailyChange + dailyChange,
                totalProfit: acc.totalProfit + totalProfit,
                totalCostBasis: acc.totalCostBasis + (item.quantity * item.purchasePrice)
            };
        }, { marketValue: 0, dailyChange: 0, totalProfit: 0, totalCostBasis: 0 });
    }, [portfolio, realQuotes, etfs]);

    return (
        <div className="glass-card flex flex-col overflow-hidden w-full mt-6 border-secondary/10 shadow-2xl relative">
            {/* Design accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[100px] -z-10" />

            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-4">
                    <div>
                        <h3 className="font-black text-xs text-secondary uppercase tracking-[0.2em]">Asset Management</h3>
                        <p className="text-[10px] text-muted-foreground font-semibold mt-1">REAL-TIME PORTFOLIO TRACKING & RISK ANALYSIS</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {selectedIds.size > 0 && (
                        <button
                            onClick={() => {
                                onRemoveItems?.(Array.from(selectedIds));
                                setSelectedIds(new Set());
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md text-[10px] font-black tracking-[0.2em] transition-all shadow-lg shadow-red-500/20 uppercase"
                        >
                            Delete {selectedIds.size}
                        </button>
                    )}
                    <div className="bg-secondary/10 px-3 py-1 rounded-full text-[9px] font-black text-secondary tracking-widest border border-secondary/20">
                        LIVE DATA
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-100/50">
                            <th className="text-left px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Ticker</th>
                            <th className="text-right px-4 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Holdings</th>
                            <th className="text-right px-4 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Avg Cost</th>
                            <th className="text-right px-4 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-slate-200/50">Total Cost</th>
                            <th className="text-right px-4 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Market Pr.</th>
                            <th className="text-right px-4 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-blue-100/50">Total Value</th>
                            <th className="text-right px-4 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Daily %</th>
                            <th className="text-right px-4 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Daily Δ</th>
                            <th className="text-right px-4 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Profit/Loss</th>
                            <th className="text-left px-4 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sector</th>
                            <th className="text-left px-4 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Region</th>
                            <th className="text-center px-4 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Snap 1</th>
                            <th className="text-center px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Snap 2</th>
                            <th className="w-24 px-4 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {portfolio.map((item) => {
                            const etf = etfs.find(e => e.id === item.id);
                            const realQuote = realQuotes[item.id];
                            const currentPrice = realQuote?.price || etf?.price || 0;
                            const dailyChangePercent = typeof realQuote?.changePercent === 'number' ? realQuote.changePercent : 0;
                            const dailyChangeValue = (realQuote?.change || 0) * item.quantity;
                            const totalProfitValue = (currentPrice - item.purchasePrice) * item.quantity;
                            const isEditing = editingId === item.id;
                            const isSelected = selectedIds.has(item.id);

                            return (
                                <tr key={item.id} className={`border-b border-slate-100 transition-all ${isSelected ? "bg-red-50 shadow-[inset_2px_0_0_#ef4444]" : "hover:bg-slate-50"}`}>
                                    <td className="px-6 py-4">
                                        <div className="font-black text-secondary text-sm tracking-tighter">{item.id}</div>
                                        <div className="text-[9px] text-muted-foreground font-bold uppercase truncate max-w-[120px] tracking-tight">{etf?.name}</div>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                className="w-16 bg-background border border-border/50 rounded px-1 py-0.5 text-right text-[10px] font-bold"
                                                value={editValues.quantity}
                                                onChange={(e) => setEditValues({ ...editValues, quantity: e.target.value })}
                                            />
                                        ) : (
                                            <span className="font-black text-foreground text-sm tracking-tight">{formatNumber(item.quantity)}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                className="w-20 bg-background border border-border/50 rounded px-1 py-0.5 text-right text-[10px] font-bold"
                                                value={editValues.purchasePrice}
                                                onChange={(e) => setEditValues({ ...editValues, purchasePrice: e.target.value })}
                                            />
                                        ) : (
                                            <span className="font-bold text-muted-foreground text-[11px]">{formatCurrency(item.purchasePrice)}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-right bg-slate-50">
                                        <span className="font-black text-slate-600 text-[11px]">{formatCurrency(item.quantity * item.purchasePrice)}</span>
                                    </td>
                                    <td className="px-4 py-4 text-right font-black text-sm bg-blue-50/50 text-blue-700 tracking-tighter">
                                        {formatCurrency(currentPrice)}
                                    </td>
                                    <td className="px-4 py-4 text-right font-black text-sm bg-blue-100/50 text-blue-900 tracking-tighter">
                                        {formatCurrency(item.quantity * currentPrice)}
                                    </td>
                                    <td className={`px-4 py-4 text-right font-black text-sm ${dailyChangePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        {dailyChangePercent >= 0 ? "+" : ""}{dailyChangePercent.toFixed(2)}%
                                    </td>
                                    <td className={`px-4 py-4 text-right font-bold text-sm ${dailyChangeValue >= 0 ? "text-green-500" : "text-red-500"}`}>
                                        {dailyChangeValue >= 0 ? "+" : ""}{formatCurrency(dailyChangeValue)}
                                    </td>
                                    <td className={`px-4 py-4 text-right font-black text-base whitespace-nowrap bg-slate-50 ${totalProfitValue >= 0 ? "text-green-600 shadow-[inset_0_0_10px_rgba(22,163,74,0.1)]" : "text-red-600 shadow-[inset_0_0_10px_rgba(220,38,38,0.1)]"}`}>
                                        {totalProfitValue >= 0 ? "+" : ""}{formatCurrency(totalProfitValue)}
                                    </td>
                                    <td className="px-4 py-4 text-left text-[9px] font-black text-muted-foreground uppercase tracking-tighter">
                                        {etf?.sector || "—"}
                                    </td>
                                    <td className="px-4 py-4 text-left text-[9px] font-black text-muted-foreground uppercase tracking-tighter">
                                        {etf?.region || "—"}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col items-center gap-1">
                                            {item.freeze1 ? (
                                                <div className="bg-blue-500/10 text-blue-600 px-2 py-1 rounded text-xs font-bold border border-blue-200">
                                                    {formatCurrency(item.freeze1.value)}
                                                    <div className="text-[10px] opacity-70">{item.freeze1.date}</div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleFreeze(item.id, 1)}
                                                    className="p-1 hover:bg-blue-50 text-muted-foreground hover:text-blue-500 transition-colors"
                                                    title="Freeze today"
                                                >
                                                    <Snowflake className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            {item.freeze2 ? (
                                                <div className="bg-purple-500/10 text-purple-600 px-2 py-1 rounded text-xs font-bold border border-purple-200">
                                                    {formatCurrency(item.freeze2.value)}
                                                    <div className="text-[10px] opacity-70">{item.freeze2.date}</div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleFreeze(item.id, 2)}
                                                    className="p-1 hover:bg-purple-50 text-muted-foreground hover:text-purple-500 transition-colors"
                                                    title="Freeze today"
                                                >
                                                    <Snowflake className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            {isEditing ? (
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleSave(item.id)} className="text-green-500 hover:text-green-600"><Check className="h-4 w-4" /></button>
                                                    <button onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-600"><X className="h-4 w-4" /></button>
                                                </div>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleEdit(item)} className="text-muted-foreground hover:text-primary transition-colors">
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleSelection(item.id)}
                                                        className={`${isSelected ? "text-red-600" : "text-muted-foreground/40"} hover:text-red-500 transition-colors`}
                                                        title="Select for deletion"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    {portfolio.length > 0 && (
                        <tfoot>
                            <tr className="bg-primary/5 font-black border-t-2 border-primary/20">
                                <td className="px-6 py-6 uppercase text-[9px] tracking-widest text-primary">
                                    <div className="flex flex-col justify-center h-full">
                                        <span>Portfolio Total</span>
                                        <span className="text-[8px] lowercase font-medium text-muted-foreground mt-0.5">Aggregated Metrics</span>
                                    </div>
                                </td>
                                <td className="px-4 py-6 font-mono text-right text-muted-foreground/60">—</td>
                                <td className="px-4 py-6 font-mono text-right text-muted-foreground/60">—</td>
                                <td className="px-4 py-6 text-right font-black text-base text-slate-700 bg-slate-200/50">
                                    <span>{formatCurrency(totals.totalCostBasis)}</span>
                                </td>
                                <td className="px-4 py-6 font-mono text-right text-muted-foreground/60">—</td>
                                <td className="px-4 py-6 text-right font-bold text-lg bg-blue-100/50 text-blue-900 border-x border-blue-200/30">
                                    <span>{formatCurrency(totals.marketValue)}</span>
                                </td>
                                <td className="px-4 py-6 font-mono text-right text-muted-foreground/60">—</td>
                                <td className={`px-4 py-6 text-right text-lg ${totals.dailyChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                                    <span>{totals.dailyChange >= 0 ? "+" : ""}{formatCurrency(totals.dailyChange)}</span>
                                </td>
                                <td className={`px-4 py-6 text-right text-lg ${totals.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                                    <span>{totals.totalProfit >= 0 ? "+" : ""}{formatCurrency(totals.totalProfit)}</span>
                                </td>
                                <td colSpan={5} className="bg-primary/5"></td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
            {portfolio.length === 0 && (
                <div className="py-12 text-center text-muted-foreground italic">
                    No assets in portfolio. Start pinning your favorite assets in the "Market Assets" table.
                </div>
            )}
        </div>
    );
}
