"use client";

import { useEffect, useState } from "react";
import { Newspaper, ExternalLink, Clock } from "lucide-react";

interface NewsItem {
    uuid: string;
    title: string;
    publisher: string;
    link: string;
    providerPublishTime: number;
    type: string;
}

interface NewsSectionProps {
    ticker: string;
}

export function NewsSection({ ticker }: NewsSectionProps) {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNews() {
            setLoading(true);
            try {
                const res = await fetch(`/api/news?ticker=${ticker}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setNews(data);
                }
            } catch (e) {
                console.error("News fetch failed:", e);
            } finally {
                setLoading(false);
            }
        }
        fetchNews();
    }, [ticker]);

    const formatTime = (timestamp: number) => {
        if (!timestamp) return "N/A";
        const date = new Date(timestamp * 1000);
        if (isNaN(date.getTime())) return "N/A";

        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor(diff / (1000 * 60));

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    const getSentiment = (title: string) => {
        const positiveKeywords = [
            "bullish", "gain", "up", "growth", "beat", "positive", "high", "success", "rally",
            "outperform", "buy", "profit", "surge", "expansion", "innovative", "leader", "dividend"
        ];
        const negativeKeywords = [
            "bearish", "loss", "down", "miss", "drop", "negative", "low", "failure", "crash",
            "underperform", "slump", "sell", "debt", "lawsuit", "cut", "warning", "decline"
        ];

        const lowerTitle = title.toLowerCase();
        let score = 0;

        positiveKeywords.forEach(k => { if (lowerTitle.includes(k)) score++; });
        negativeKeywords.forEach(k => { if (lowerTitle.includes(k)) score--; });

        if (score > 1) return { type: "strongly-positive", label: "Strongly Positive", color: "bg-green-500", glow: "rgba(34,197,94,0.8)" };
        if (score > 0) return { type: "positive", label: "Positive", color: "bg-emerald-400", glow: "rgba(52,211,153,0.5)" };
        if (score < -1) return { type: "strongly-negative", label: "Strongly Negative", color: "bg-red-600", glow: "rgba(220,38,38,0.8)" };
        if (score < 0) return { type: "negative", label: "Negative", color: "bg-rose-400", glow: "rgba(251,113,133,0.5)" };
        return { type: "neutral", label: "Neutral", color: "bg-slate-300", glow: "rgba(203,213,225,0.3)" };
    };

    return (
        <div className="glass-card flex flex-col h-full overflow-hidden border-primary/10">
            <div className="p-4 border-b border-border/50 bg-card/20 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Newspaper className="h-4 w-4 text-primary shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                    <h3 className="font-black text-xs uppercase tracking-[0.2em] text-foreground">Market Intelligence</h3>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                {loading ? (
                    <div className="p-8 flex flex-col items-center justify-center gap-2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Scanning feeds...</p>
                    </div>
                ) : news.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-xs text-muted-foreground">No recent news found.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/20">
                        {news.map((item) => (
                            <a
                                key={item.uuid}
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-4 hover:bg-primary/5 transition-all group"
                            >
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <h4 className="text-[11px] font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2 uppercase tracking-tight text-slate-700">
                                        {item.title}
                                    </h4>
                                    {(() => {
                                        const sentiment = getSentiment(item.title);
                                        return (
                                            <div
                                                className={`min-w-[8px] h-2 rounded-full ${sentiment.color} transition-all duration-500`}
                                                style={{ boxShadow: `0 0 10px ${sentiment.glow}` }}
                                                title={sentiment.label}
                                            />
                                        );
                                    })()}
                                </div>
                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] font-black text-primary/70 uppercase tracking-widest">
                                            {item.publisher}
                                        </span>
                                        <span className="flex items-center gap-1 text-[9px] text-muted-foreground font-bold uppercase">
                                            <Clock className="h-2.5 w-2.5" />
                                            {formatTime(item.providerPublishTime)}
                                        </span>
                                    </div>
                                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
