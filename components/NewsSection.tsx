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
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 1) return "Just now";
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="bg-card rounded-xl border shadow-sm flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Newspaper className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">Latest News: {ticker}</h3>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                {loading ? (
                    <div className="p-8 flex flex-col items-center justify-center gap-2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <p className="text-xs text-muted-foreground font-medium">Loading news...</p>
                    </div>
                ) : news.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-xs text-muted-foreground">No recent news found for this asset.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/50">
                        {news.map((item) => (
                            <a
                                key={item.uuid}
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-4 hover:bg-muted/50 transition-colors group"
                            >
                                <h4 className="text-xs font-bold leading-snug group-hover:text-primary transition-colors mb-2 line-clamp-2">
                                    {item.title}
                                </h4>
                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                            {item.publisher}
                                        </span>
                                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
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
