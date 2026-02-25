"use client";

import { X, ExternalLink, Hash, Info } from "lucide-react";
import { useEffect, useState } from "react";

interface NewsItem {
    title: string;
    publisher: string;
    link: string;
    time: string;
    type: "stock" | "index" | "market";
}

interface NewsStickyNoteProps {
    id: string;
    date: string;
    ticker: string;
    fullAssetName: string;
    marketContext: string;
    x: number;
    y: number;
    onClose: (id: string) => void;
    colorIndex: number;
}

export function NewsStickyNote({ id, date, ticker, fullAssetName, marketContext, x, y, onClose, colorIndex }: NewsStickyNoteProps) {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    const colors = [
        "bg-yellow-200 border-yellow-300 text-yellow-900",
        "bg-blue-100 border-blue-200 text-blue-900",
        "bg-green-100 border-green-200 text-green-900",
        "bg-pink-100 border-pink-200 text-pink-900",
    ];

    const rotations = ["rotate-1", "-rotate-1", "rotate-2", "-rotate-2"];
    const colorClass = colors[colorIndex % colors.length];
    const rotationClass = rotations[colorIndex % rotations.length];

    useEffect(() => {
        async function fetchNews() {
            setLoading(true);
            try {
                const res = await fetch(`/api/historical-news?ticker=${ticker}&date=${date}`);
                const data = await res.json();
                setNews(data);
            } catch (e) {
                console.error("Failed to fetch historical news:", e);
                setNews([]);
            } finally {
                setLoading(false);
            }
        }
        fetchNews();
    }, [date, ticker]);

    // Position the note near the click, but keep it within bounds usually
    // page.tsx will handle the absolute positioning container
    return (
        <div
            className={`absolute z-50 w-64 p-4 shadow-xl border-b-4 border-r-2 ${colorClass} ${rotationClass} transition-all animate-in fade-in zoom-in duration-300`}
            style={{ left: `${x}px`, top: `${y}px`, transform: `translate(-50%, -10%) ${rotationClass}` }}
        >
            <div className="flex items-center justify-between mb-3 border-b border-black/10 pb-2">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                    {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <button
                    onClick={() => onClose(id)}
                    className="p-1 hover:bg-black/10 rounded-full transition-colors"
                >
                    <X className="h-3 w-3" />
                </button>
            </div>

            <div className="space-y-3 min-h-[100px]">
                {loading ? (
                    <div className="flex items-center justify-center h-24 opacity-40">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    </div>
                ) : news.length > 0 ? (
                    news.map((item, idx) => (
                        <div key={idx} className="group">
                            <div className="flex items-start gap-2 mb-1">
                                {item.type === "stock" ? (
                                    <Hash className="h-3 w-3 mt-0.5 shrink-0 opacity-50" />
                                ) : (
                                    <Info className="h-3 w-3 mt-0.5 shrink-0 opacity-50" />
                                )}
                                <h4 className="text-[11px] font-bold leading-tight uppercase tracking-tight line-clamp-3">
                                    {item.title}
                                </h4>
                            </div>
                            <div className="flex items-center justify-between ml-5">
                                <span className="text-[8px] font-black uppercase opacity-60">{item.publisher}</span>
                                <a
                                    href={item.link === "#" ? (() => {
                                        const d = new Date(date);
                                        const day = d.getDate();
                                        const month = d.getMonth() + 1;
                                        const year = d.getFullYear();
                                        const dateStr = d.toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' });
                                        // tbs=cdr:1,cd_min:MM/DD/YYYY,cd_max:MM/DD/YYYY for precise day filtering
                                        const tbs = `cdr:1,cd_min:${month}/${day}/${year},cd_max:${month}/${day}/${year}`;
                                        return `https://www.google.com/search?q=${encodeURIComponent(marketContext)}+news+${encodeURIComponent(dateStr)}&tbm=nws&tbs=${encodeURIComponent(tbs)}`;
                                    })() : item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[8px] font-black uppercase flex items-center gap-1 hover:underline underline-offset-2"
                                >
                                    Source <ExternalLink className="h-2 w-2" />
                                </a>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-6 opacity-40">
                        <p className="text-[10px] font-bold uppercase tracking-tight">No specific events</p>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-2 border-t border-black/5 text-[8px] font-black uppercase opacity-40 text-center tracking-tighter">
                {ticker} • Historical Context
            </div>

            {/* The "folded corner" effect */}
            <div
                className="absolute bottom-0 right-0 w-6 h-6 bg-black/5"
                style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}
            />
        </div>
    );
}
