
import YahooFinance from 'yahoo-finance2';
// @ts-ignore - yahoo-finance2 v3 exports the class as default but types can be tricky
const yahooFinance = new (YahooFinance as any)();

export const YAHOO_TICKER_MAP: Record<string, string> = {
    "ETFMIB": "FTSEMIB.MI",
    "XBKA": "EXV3.DE",     // STOXX Europe 600 Banks
    "IENY": "IUES.L",     // iShares Oil & Gas (London)
    "VEUR": "VEUR.AS",    // Vanguard Developed Europe
    "SWDA": "SWDA.MI",
    "VUSA": "VUSA.MI",
    "CNX1": "EQQQ.MI",
    "PHAU": "PHAU.MI",
    "CRUD": "CRUD.MI",
    "SEML": "SMH.MI",
    "RBOT": "RBOT.MI",
    "IITB": "BTP.MI",      // Lyxor Italy Government Bond
    "CPXJ": "EIMI.MI",    // Emerging Markets IMI
    "IDRE": "IPRP.MI",    // European Property Yield
    "IUKP": "IUKP.L",     // UK Property (LSE)
    "EUEG": "SXRB.MI",    // Core MSCI Europe
    "IQQP": "IQQP.MI",    // Asia Pacific Property
    "INRG": "INRG.MI",    // Clean Energy
    "HEAL": "HEAL.MI",    // Healthcare Innovation
    "GREC": "GREC",       // Global X Greece (US)
    "NIKKEI": "^N225",    // Nikkei 225
    "KOSPI": "^KS11",     // KOSPI Composite
    "VGK": "VGK",         // Vanguard FTSE Europe ETF
    "VUSA_US": "VOO",
    "EURUSD": "EURUSD=X",
    "EURGBP": "EURGBP=X",
    "EURCNY": "EURCNY=X",
    "USDCNY": "USDCNY=X",
    "JPYEUR": "JPYEUR=X",
    "KRWEUR": "KRWEUR=X",
    "CNYEUR": "CNYEUR=X",
    "TRYEUR": "TRYEUR=X",
    "GBPEUR": "GBPEUR=X",
    "ENEL": "ENEL.MI",
    "ENI": "ENI.MI",
    "RACE": "RACE.MI",
    "ISP": "ISP.MI",
    "UCG": "UCG.MI",
    "STLAM": "STLAM.MI",
    "G": "G.MI"
};

export function resolveSymbol(ticker: string): string {
    if (YAHOO_TICKER_MAP[ticker]) return YAHOO_TICKER_MAP[ticker];
    if (ticker.includes('.') || ticker.includes('^') || ticker.includes('=X')) return ticker;
    // No longer force .MI suffix. Trust the ticker as is or let search handle it.
    return ticker;
}

export async function fetchYahooHistoricalData(ticker: string, periodDays: number = 365, interval: string = '1d') {
    const symbol = resolveSymbol(ticker);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - periodDays);

    try {
        const result = await yahooFinance.chart(symbol, {
            period1: startDate,
            period2: endDate,
            interval: interval as any
        });

        const results = result.quotes;
        if (!results || results.length === 0) return [];

        // Clean, filter nulls, and sort data
        return results
            .filter((item: any) => item.date && item.close !== null && item.close !== undefined)
            .map((item: any) => {
                const date = item.date instanceof Date ? item.date : new Date(item.date);
                return {
                    // For intraday (1D), we keep the full ISO string to preserve time
                    date: interval === '1d' ? date.toISOString().split('T')[0] : date.toISOString(),
                    open: item.open ?? item.close,
                    high: item.high ?? item.close,
                    low: item.low ?? item.close,
                    close: item.adjclose ?? item.close,
                    volume: item.volume ?? 0
                };
            })
            .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
            // Remove duplicates (keep the first occurrence of each time slot)
            .filter((item: any, index: number, self: any[]) =>
                index === self.findIndex((t: any) => t.date === item.date)
            );
    } catch (error) {
        console.error(`Yahoo Finance error for ${symbol}:`, error);
        throw error;
    }
}

export async function fetchYahooQuote(ticker: string) {
    const symbol = resolveSymbol(ticker);
    try {
        const quote = await yahooFinance.quote(symbol) as any;
        return {
            symbol: ticker,
            name: quote.longName || quote.shortName || ticker,
            price: quote.regularMarketPrice,
            changePercent: quote.regularMarketChangePercent,
            volume: quote.regularMarketVolume,
            high: quote.regularMarketDayHigh,
            low: quote.regularMarketDayLow
        };
    } catch (error) {
        console.error(`Yahoo Quote error for ${symbol}:`, error);
        return null;
    }
}

export async function fetchYahooQuotesBatch(tickers: string[]) {
    // Create reversed map for mapping back results
    const reverseMap: Record<string, string> = {};
    const symbols = tickers.map(t => {
        const s = resolveSymbol(t);
        reverseMap[s] = t;
        return s;
    });

    try {
        const results = await yahooFinance.quote(symbols) as any[];
        return results.map(quote => ({
            symbol: reverseMap[quote.symbol] || quote.symbol,
            name: quote.longName || quote.shortName || quote.symbol,
            price: quote.regularMarketPrice,
            change: quote.regularMarketChange,
            changePercent: quote.regularMarketChangePercent,
            volume: quote.regularMarketVolume
        }));
    } catch (error) {
        console.error("Yahoo Batch Quote error:", error);
        return [];
    }
}

export async function searchYahooTicker(query: string) {
    try {
        const result = await yahooFinance.search(query, {
            quotesCount: 1,
            newsCount: 0
        });
        if (result.quotes && result.quotes.length > 0) {
            const bestMatch = result.quotes[0] as any;
            return {
                ticker: bestMatch.symbol,
                name: bestMatch.longname || bestMatch.shortname || bestMatch.symbol,
                type: bestMatch.quoteType
            };
        }
        return null;
    } catch (error) {
        console.error(`Yahoo Search error for ${query}:`, error);
        return null;
    }
}

export async function fetchYahooYTDData(ticker: string) {
    const symbol = resolveSymbol(ticker);
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    try {
        const result = await yahooFinance.chart(symbol, {
            period1: startOfYear,
            period2: now,
            interval: '1d'
        });

        const quotes = result.quotes;
        if (!quotes || quotes.length === 0) return null;

        const firstQuote = quotes.find((q: any) => q.close !== null && q.close !== undefined);
        const lastQuote = [...quotes].reverse().find((q: any) => q.close !== null && q.close !== undefined);

        if (!firstQuote || !lastQuote) return null;

        return {
            symbol: ticker,
            startPrice: firstQuote.adjclose ?? firstQuote.close,
            currentPrice: lastQuote.adjclose ?? lastQuote.close,
            changePercent: ((lastQuote.adjclose ?? lastQuote.close) / (firstQuote.adjclose ?? firstQuote.close) - 1) * 100
        };
    } catch (error) {
        console.error(`Yahoo YTD error for ${symbol}:`, error);
        return null;
    }
}

export async function fetchYahooNews(ticker: string) {
    const symbol = resolveSymbol(ticker);
    try {
        const result = await yahooFinance.search(symbol, {
            newsCount: 5,
            quotesCount: 0
        });
        return result.news || [];
    } catch (error) {
        console.error(`Yahoo News error for ${symbol}:`, error);
        return [];
    }
}
