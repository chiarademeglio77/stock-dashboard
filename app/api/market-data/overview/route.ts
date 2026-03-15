import { NextRequest, NextResponse } from "next/server";
import { fetchYahooQuotes, fetchYahooYTDData, YAHOO_TICKER_MAP, resolveSymbol } from "@/lib/yahoo-service";

const GLOBAL_INDICES = [
    { id: "FTSEMIB", symbol: "FTSEMIB.MI", name: "FTSE MIB", currency: "EUR" },
    { id: "DAX", symbol: "^GDAXI", name: "DAX", currency: "EUR" },
    { id: "CAC40", symbol: "^FCHI", name: "CAC 40", currency: "EUR" },
    { id: "FTSE100", symbol: "^FTSE", name: "FTSE 100", currency: "GBP" },
    { id: "SP500", symbol: "^GSPC", name: "S&P 500", currency: "USD" },
    { id: "NASDAQ", symbol: "^IXIC", name: "NASDAQ", currency: "USD" },
    { id: "NIKKEI", symbol: "^N225", name: "Nikkei 225", currency: "JPY" },
];

export async function GET() {
    try {
        // Fetch global indices and FX rates in batches to minimize external calls
        const fxTickers = ["EURUSD", "JPYEUR", "KRWEUR", "CNYEUR", "TRYEUR", "GBPEUR"];
        const indexSymbols = GLOBAL_INDICES.map(i => i.symbol);
        
        // Batch 1: All current quotes
        const allQuotes = await fetchYahooQuotes([...fxTickers, ...indexSymbols]);
        
        const quoteMap: Record<string, any> = {};
        allQuotes.forEach((q: any) => {
            quoteMap[q.symbol] = q;
        });

        // Batch 2: FX YTD data (still individual for now, but prioritized)
        const fxData: Record<string, any> = {};
        await Promise.all(fxTickers.map(async (ticker) => {
            const ytd = await fetchYahooYTDData(ticker);
            fxData[ticker] = { 
                current: quoteMap[resolveSymbol(ticker)]?.price, 
                start: ytd?.startPrice 
            };
        }));

        const results = await Promise.all(GLOBAL_INDICES.map(async (index) => {
            const quote = quoteMap[index.symbol];
            const ytd = await fetchYahooYTDData(index.symbol);

            if (!quote || !ytd) return null;

            let ytdAdjusted = ytd.changePercent;

            if (index.currency !== "EUR") {
                const fxTicker = index.currency === "USD" ? "EURUSD" : `${index.currency}EUR`;
                const fx = fxData[fxTicker];

                if (fx && fx.current && fx.start) {
                    let currentInEur, startInEur;

                    if (index.currency === "USD") {
                        currentInEur = quote.price / fx.current;
                        startInEur = ytd.startPrice / fx.start;
                    } else {
                        currentInEur = quote.price * fx.current;
                        startInEur = ytd.startPrice * fx.start;
                    }

                    ytdAdjusted = (currentInEur / startInEur - 1) * 100;
                }
            }

            return {
                id: index.id,
                name: index.name,
                price: quote.price,
                changePercent: quote.changePercent,
                ytdLocal: ytd.changePercent,
                ytdEur: ytdAdjusted,
                currency: index.currency
            };
        }));

        return NextResponse.json(results.filter(r => r !== null));
    } catch (error) {
        console.error("Market Overview API Error:", error);
        return NextResponse.json({ error: "Failed to fetch overview" }, { status: 500 });
    }
}
