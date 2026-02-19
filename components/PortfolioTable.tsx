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
        const date = new Date().toLocaleDateString("it-IT");

        onUpdateItem({
            ...item,
            [slot === 1 ? "freeze1" : "freeze2"]: { value: profit, date }
        });
    };

    return (
        <div className="bg-card rounded-xl border shadow-sm flex flex-col overflow-hidden w-full mt-6">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-primary/5">
                <div>
                    <h3 className="font-bold text-lg text-primary uppercase tracking-wider">Mio Portafoglio</h3>
                    <p className="text-sm text-muted-foreground">Gestione investimenti e rendimenti congelati</p>
                </div>
                <div className="bg-primary/10 px-3 py-1 rounded-full text-xs font-bold text-primary">
                    10 TITOLI MAX
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-muted/30">
                            <th className="text-left px-6 py-4 font-bold text-muted-foreground uppercase text-xs">Titolo</th>
                            <th className="text-right px-4 py-4 font-bold text-muted-foreground uppercase text-xs">Quantità</th>
                            <th className="text-right px-4 py-4 font-bold text-muted-foreground uppercase text-xs">P. Carico (€)</th>
                            <th className="text-right px-4 py-4 font-bold text-muted-foreground uppercase text-xs">P. Attuale (€)</th>
                            <th className="text-right px-4 py-4 font-bold text-muted-foreground uppercase text-xs">Δ Giorno (%)</th>
                            <th className="text-right px-4 py-4 font-bold text-muted-foreground uppercase text-xs">Δ Giorno (€)</th>
                            <th className="text-right px-4 py-4 font-bold text-muted-foreground uppercase text-xs">P/L Totale (€)</th>
                            <th className="text-center px-4 py-4 font-bold text-muted-foreground uppercase text-xs">Freeze 1 (Data)</th>
                            <th className="text-center px-6 py-4 font-bold text-muted-foreground uppercase text-xs">Freeze 2 (Data)</th>
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
                                            <span className="font-medium text-lg">{item.quantity}</span>
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
                                            <span className="font-medium text-muted-foreground">€{item.purchasePrice.toFixed(2)}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-right font-medium text-lg italic bg-primary/5">
                                        €{currentPrice.toFixed(2)}
                                    </td>
                                    <td className={`px-4 py-4 text-right font-bold text-lg ${dailyChangePercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                                        {dailyChangePercent >= 0 ? "+" : ""}{dailyChangePercent.toFixed(2)}%
                                    </td>
                                    <td className={`px-4 py-4 text-right font-bold ${dailyChangeValue >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        {dailyChangeValue >= 0 ? "+" : ""}€{dailyChangeValue.toFixed(2)}
                                    </td>
                                    <td className={`px-4 py-4 text-right font-black text-xl whitespace-nowrap bg-muted/10 ${totalProfitValue >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        {totalProfitValue >= 0 ? "+" : ""}€{totalProfitValue.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col items-center gap-1">
                                            {item.freeze1 ? (
                                                <div className="bg-blue-500/10 text-blue-600 px-2 py-1 rounded text-xs font-bold border border-blue-200">
                                                    €{item.freeze1.value.toFixed(2)}
                                                    <div className="text-[10px] opacity-70">{item.freeze1.date}</div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleFreeze(item.id, 1)}
                                                    className="p-1 hover:bg-blue-50 text-muted-foreground hover:text-blue-500 transition-colors"
                                                    title="Blocca oggi"
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
                                                    €{item.freeze2.value.toFixed(2)}
                                                    <div className="text-[10px] opacity-70">{item.freeze2.date}</div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleFreeze(item.id, 2)}
                                                    className="p-1 hover:bg-purple-50 text-muted-foreground hover:text-purple-500 transition-colors"
                                                    title="Blocca oggi"
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
                </table>
            </div>
            {portfolio.length === 0 && (
                <div className="py-12 text-center text-muted-foreground italic">
                    Nessun titolo nel portafoglio. Inizia a pinnare i tuoi titoli preferiti nella tabella "Mercati".
                </div>
            )}
        </div>
    );
}
