"use client";

import { useState, useMemo } from "react";
import { ETF } from "@/lib/mock-etfs";
import { ArrowUp, ArrowDown, Snowflake, Edit2, Check, X } from "lucide-react";

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

export function PortfolioTable({ etfs, realQuotes, portfolio, onUpdateItem }: PortfolioTableProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<{ quantity: string; purchasePrice: string }>({ quantity: "", purchasePrice: "" });

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
                totalProfit: acc.totalProfit + totalProfit
            };
        }, { marketValue: 0, dailyChange: 0, totalProfit: 0 });
    }, [portfolio, realQuotes, etfs]);

    return (
        <div className="bg-card rounded-xl border shadow-sm flex flex-col overflow-hidden w-full mt-6">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-primary/5">
                <div>
                    <h3 className="font-bold text-lg text-primary uppercase tracking-wider">My Portfolio</h3>
                    <p className="text-sm text-muted-foreground">Investment management and frozen returns</p>
                </div>
                <div className="bg-primary/10 px-3 py-1 rounded-full text-xs font-bold text-primary">
                    10 ASSETS MAX
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-muted/30">
                            <th className="text-left px-6 py-4 font-bold text-muted-foreground uppercase text-xs">Symbol</th>
                            <th className="text-right px-4 py-4 font-bold text-muted-foreground uppercase text-xs">Quantity</th>
                            <th className="text-right px-4 py-4 font-bold text-muted-foreground uppercase text-xs">Avg. Cost (€)</th>
                            <th className="text-right px-4 py-4 font-bold text-muted-foreground uppercase text-xs">Market Price (€)</th>
                            <th className="text-right px-4 py-4 font-bold text-muted-foreground uppercase text-xs">Day Chg (%)</th>
                            <th className="text-right px-4 py-4 font-bold text-muted-foreground uppercase text-xs">Day Chg (€)</th>
                            <th className="text-right px-4 py-4 font-bold text-muted-foreground uppercase text-xs">Total P/L (€)</th>
                            <th className="text-center px-4 py-4 font-bold text-muted-foreground uppercase text-xs">Freeze 1 (Date)</th>
                            <th className="text-center px-6 py-4 font-bold text-muted-foreground uppercase text-xs">Freeze 2 (Date)</th>
                            <th className="w-20"></th>
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

                            return (
                                <tr key={item.id} className="border-b transition-colors hover:bg-muted/20">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-primary font-mono">{item.id}</div>
                                        <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">{etf?.name}</div>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                className="w-16 bg-background border rounded px-1 py-0.5 text-right"
                                                value={editValues.quantity}
                                                onChange={(e) => setEditValues({ ...editValues, quantity: e.target.value })}
                                            />
                                        ) : (
                                            <span className="font-medium text-lg">{formatNumber(item.quantity)}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                className="w-20 bg-background border rounded px-1 py-0.5 text-right"
                                                value={editValues.purchasePrice}
                                                onChange={(e) => setEditValues({ ...editValues, purchasePrice: e.target.value })}
                                            />
                                        ) : (
                                            <span className="font-medium text-muted-foreground">{formatCurrency(item.purchasePrice)}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-right font-medium text-lg italic bg-primary/5">
                                        {formatCurrency(currentPrice)}
                                    </td>
                                    <td className={`px-4 py-4 text-right font-bold text-lg ${dailyChangePercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                                        {dailyChangePercent >= 0 ? "+" : ""}{dailyChangePercent.toFixed(2)}%
                                    </td>
                                    <td className={`px-4 py-4 text-right font-bold ${dailyChangeValue >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        {dailyChangeValue >= 0 ? "+" : ""}{formatCurrency(dailyChangeValue)}
                                    </td>
                                    <td className={`px-4 py-4 text-right font-black text-xl whitespace-nowrap bg-muted/10 ${totalProfitValue >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        {totalProfitValue >= 0 ? "+" : ""}{formatCurrency(totalProfitValue)}
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
                                    <td className="px-4 py-4 text-center">
                                        {isEditing ? (
                                            <div className="flex gap-1">
                                                <button onClick={() => handleSave(item.id)} className="text-green-500 hover:text-green-600"><Check className="h-4 w-4" /></button>
                                                <button onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-600"><X className="h-4 w-4" /></button>
                                            </div>
                                        ) : (
                                            <button onClick={() => handleEdit(item)} className="text-muted-foreground hover:text-primary"><Edit2 className="h-4 w-4" /></button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    {portfolio.length > 0 && (
                        <tfoot>
                            <tr className="bg-primary/5 font-black border-t-2 border-primary/20">
                                <td className="px-6 py-5 uppercase text-xs tracking-widest text-primary">Portfolio Total</td>
                                <td className="px-4 py-5 font-mono text-right text-muted-foreground/60">—</td>
                                <td className="px-4 py-5 font-mono text-right text-muted-foreground/60">—</td>
                                <td className="px-4 py-5 text-right font-black text-lg bg-primary/10">
                                    {formatCurrency(totals.marketValue)}
                                </td>
                                <td className="px-4 py-5 font-mono text-right text-muted-foreground/60">—</td>
                                <td className={`px-4 py-5 text-right text-lg ${totals.dailyChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                                    {totals.dailyChange >= 0 ? "+" : ""}{formatCurrency(totals.dailyChange)}
                                </td>
                                <td className={`px-4 py-5 text-right text-2xl ${totals.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                                    {totals.totalProfit >= 0 ? "+" : ""}{formatCurrency(totals.totalProfit)}
                                </td>
                                <td colSpan={3} className="bg-primary/5"></td>
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
