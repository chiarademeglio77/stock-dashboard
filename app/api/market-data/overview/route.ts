import { NextRequest, NextResponse } from "next/server";
import { fetchYahooQuote, fetchYahooYTDData, YAHOO_TICKER_MAP } from "@/lib/yahoo-service";

const GLOBAL_INDICES = [
    { id: "NIKKEI", symbol: "^N225", name: "Nikkei 225", currency: "JPY" },
    { id: "KOSPI", symbol: "^KS11", name: "KOSPI", currency: "KRW" },
    { id: "CSI300", symbol: "000300.SS", name: "CSI 300", currency: "CNY" },
    { id: "BIST100", symbol: "XU100.IS", name: "BIST 100", currency: "TRY" },
    { id: "NASDAQ", symbol: "^IXIC", name: "NASDAQ", currency: "USD" },
    { id: "SP500", symbol: "^GSPC", name: "S&P 500", currency: "USD" },
    { id: "DOW", symbol: "^DJI", name: "Dow Jones", currency: "USD" },
    { id: "CAC40", symbol: "^FCHI", name: "CAC 40", currency: "EUR" },
    { id: "DAX", symbol: "^GDAXI", name: "DAX", currency: "EUR" },
    { id: "FTSE100", symbol: "^FTSE", name: "FTSE 100", currency: "GBP" },
];

export async function GET() {
    try {
        // Fetch exchange rates for adjustment
        const fxTickers = ["EURUSD", "JPYEUR", "KRWEUR", "CNYEUR", "TRYEUR", "GBPEUR"];
        const fxData: Record<string, any> = {};

        await Promise.all(fxTickers.map(async (ticker) => {
            const quote = await fetchYahooQuote(ticker);
            const ytd = await fetchYahooYTDData(ticker);
            fxData[ticker] = { current: quote?.price, start: ytd?.startPrice };
        }));

        const results = await Promise.all(GLOBAL_INDICES.map(async (index) => {
            const quote = await fetchYahooQuote(index.symbol);
            const ytd = await fetchYahooYTDData(index.symbol);

            if (!quote || !ytd) return null;

            let ytdAdjusted = ytd.changePercent;

            // Adjust for EUR if not already EUR
            if (index.currency !== "EUR") {
                const fxTicker = index.currency === "USD" ? "EURUSD" : `${index.currency}EUR`;
                const fx = fxData[fxTicker];

                if (fx && fx.current && fx.start) {
                    // Growth adjusted for EUR: (Price_Now * FX_Now) / (Price_Start * FX_Start) - 1
                    // Note: EURUSD is USD per EUR, so we need 1/Rate for EUR value if it's quoted as BASE/QUOTE
                    // But our YAHOO_TICKER_MAP has EURUSD=X (USD per EUR) and JPYEUR=X (EUR per JPY?)
                    // Let's verify: JPYEUR=X is usually EUR per JPY.

                    let currentInEur, startInEur;

                    if (index.currency === "USD") {
                        // quote.price is in USD. Rate is USD per EUR. EUR = USD / Rate.
                        currentInEur = quote.price / fx.current;
                        startInEur = ytd.startPrice / fx.start;
                    } else {
                        // Rate is EUR per Local. EUR = Price * Rate.
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
