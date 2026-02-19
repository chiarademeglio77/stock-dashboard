
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
    "VUSA_US": "VOO",
    "EURUSD": "EURUSD=X",
    "USDCNY": "USDCNY=X"
};

export async function fetchYahooHistoricalData(ticker: string, periodDays: number = 365) {
    const symbol = YAHOO_TICKER_MAP[ticker] || (ticker.includes('.') ? ticker : `${ticker}.MI`);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - periodDays);

    try {
        const result = await yahooFinance.chart(symbol, {
            period1: startDate,
            period2: endDate,
            interval: '1d'
        });

        const results = result.quotes;
        if (!results || results.length === 0) return [];

        // Clean, filter nulls, and sort data
        return results
            .filter((item: any) => item.date && item.close !== null && item.close !== undefined)
            .map((item: any) => ({
                date: item.date instanceof Date ? item.date.toISOString().split('T')[0] : String(item.date).split('T')[0],
                open: item.open ?? item.close,
                high: item.high ?? item.close,
                low: item.low ?? item.close,
                close: item.adjclose ?? item.close,
                volume: item.volume ?? 0
            }))
            .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
            // Remove duplicates (keep the first occurrence of each day)
            .filter((item: any, index: number, self: any[]) =>
                index === self.findIndex((t: any) => t.date === item.date)
            );
    } catch (error) {
        console.error(`Yahoo Finance error for ${symbol}:`, error);
        throw error;
    }
}

export async function fetchYahooQuote(ticker: string) {
    const symbol = YAHOO_TICKER_MAP[ticker] || (ticker.includes('.') ? ticker : `${ticker}.MI`);
    try {
        const quote = await yahooFinance.quote(symbol) as any;
        return {
            symbol: ticker,
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
        const s = YAHOO_TICKER_MAP[t] || (t.includes('.') ? t : `${t}.MI`);
        reverseMap[s] = t;
        return s;
    });

    try {
        const results = await yahooFinance.quote(symbols) as any[];
        return results.map(quote => ({
            symbol: reverseMap[quote.symbol] || quote.symbol,
            price: quote.regularMarketPrice,
            changePercent: quote.regularMarketChangePercent,
            volume: quote.regularMarketVolume
        }));
    } catch (error) {
        console.error("Yahoo Batch Quote error:", error);
        return [];
    }
}
