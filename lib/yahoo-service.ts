import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();
import { MOCK_ETFS } from './mock-etfs';
import { generateHistoricalData } from './data-engine';

// The default export is already an instance in yahoo-finance2 v2

// Remove complex headers that might be triggering bot detection
const DEFAULT_OPTIONS = {};

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
    "KOSPI": "^KS11",     // KOSPI Composite
    "VGK": "VGK",         // Vanguard FTSE Europe ETF
    "SP500": "^GSPC",
    "DAX": "^GDAXI",
    "CAC40": "^FCHI",
    "NASDAQ": "^IXIC",
    "FTSEMIB": "FTSEMIB.MI",
    "NIKKEI": "^N225",
    "FTSE100": "^FTSE",
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
        const result = (await yahooFinance.chart(symbol, {
            period1: startDate,
            period2: endDate,
            interval: interval as any
        }, DEFAULT_OPTIONS)) as any;

        const results = result.quotes;
        if (!results || results.length === 0) return [];

        // Clean, filter nulls, and sort data
        return results
            .filter((item: any) => item.date && item.close !== null && (item.close !== undefined || item.adjclose !== undefined))
            .map((item: any) => {
                const date = item.date instanceof Date ? item.date : new Date(item.date);
                // Standardize date as ISO string
                const isoDate = date.toISOString();
                
                return {
                    // For intraday (lower than 1d), we keep the full ISO string to preserve time
                    // For 1d or higher, we split it to get only YYYY-MM-DD
                    date: (interval === '1d' || interval.includes('wk') || interval.includes('mo')) 
                        ? isoDate.split('T')[0] 
                        : isoDate,
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
        const quote = await yahooFinance.quote(symbol, {}, DEFAULT_OPTIONS) as any;
        return {
            symbol: ticker,
            name: quote.longName || quote.shortName || ticker,
            price: quote.regularMarketPrice,
            open: quote.regularMarketOpen,
            changePercent: quote.regularMarketChangePercent,
            volume: quote.regularMarketVolume,
            high: quote.regularMarketDayHigh,
            low: quote.regularMarketDayLow
        };
    } catch (error) {
        console.error(`Yahoo Quote error for ${symbol} - Falling back to mock data:`, error);
        
        const mockEtf = MOCK_ETFS.find(e => e.id === symbol);
        if (mockEtf) {
            return {
                symbol: symbol,
                name: mockEtf.name,
                price: mockEtf.price,
                change: (mockEtf.changePercent / 100) * mockEtf.price,
                changePercent: mockEtf.changePercent,
                volume: 1000000,
                high: mockEtf.price * 1.02,
                low: mockEtf.price * 0.98
            };
        }
        
        const isCurrency = symbol.length === 6 && symbol.toUpperCase() === symbol;
        const basePrice = isCurrency ? (Math.random() * 0.5 + 0.8) : (Math.random() * 200 + 50);
        return {
            symbol: symbol,
            name: symbol,
            price: parseFloat(basePrice.toFixed(4)),
            change: parseFloat((Math.random() * 2 - 1).toFixed(4)),
            changePercent: parseFloat((Math.random() * 2 - 1).toFixed(2)),
            volume: Math.floor(Math.random() * 5000000),
            high: parseFloat((basePrice * 1.02).toFixed(4)),
            low: parseFloat((basePrice * 0.98).toFixed(4))
        };
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
        const results = await yahooFinance.quote(symbols, {}, DEFAULT_OPTIONS) as any[];
        const quoteMap: Record<string, any> = {};
        
        results.forEach(quote => {
            const originalTicker = reverseMap[quote.symbol] || quote.symbol;
            // Ensure we don't overwrite if multiple symbols mapped to same ticker, 
            // but here we want to ensure we have the most specific one.
            quoteMap[originalTicker] = {
                symbol: originalTicker,
                name: quote.longName || quote.shortName || quote.symbol,
                price: quote.regularMarketPrice,
                open: quote.regularMarketOpen,
                change: quote.regularMarketChange,
                changePercent: quote.regularMarketChangePercent,
                volume: quote.regularMarketVolume,
                high: quote.regularMarketDayHigh,
                low: quote.regularMarketDayLow
            };
            
            // Also store by the actual symbol returned by Yahoo
            quoteMap[quote.symbol] = quoteMap[originalTicker];
        });
        
        return quoteMap;
    } catch (error) {
        console.error("Yahoo Batch Quote error - Falling back to mock data:", error);
        
        const quoteMap: Record<string, any> = {};
        tickers.forEach(ticker => {
            const mockEtf = MOCK_ETFS.find(e => e.id === ticker);
            if (mockEtf) {
                quoteMap[ticker] = {
                    symbol: ticker,
                    name: mockEtf.name,
                    price: mockEtf.price,
                    change: (mockEtf.changePercent / 100) * mockEtf.price,
                    changePercent: mockEtf.changePercent,
                    volume: 1000000
                };
            } else {
                // Generic mock for unknown tickers like EURUSD
                const isCurrency = ticker.length === 6 && ticker.toUpperCase() === ticker;
                const basePrice = isCurrency ? (Math.random() * 0.5 + 0.8) : (Math.random() * 200 + 50);
                quoteMap[ticker] = {
                    symbol: ticker,
                    name: ticker,
                    price: parseFloat(basePrice.toFixed(4)),
                    change: parseFloat((Math.random() * 2 - 1).toFixed(4)),
                    changePercent: parseFloat((Math.random() * 2 - 1).toFixed(2)),
                    volume: Math.floor(Math.random() * 5000000)
                };
            }
        });
        return quoteMap;
    }
}
// Batch fetch quotes
export async function fetchYahooQuotes(tickers: string[]) {
    const symbols = tickers.map(resolveSymbol);
    try {
        const result = (await yahooFinance.quote(symbols, {}, DEFAULT_OPTIONS)) as any;
        // result is an array of quotes
        return result.map((quote: any) => ({
            symbol: quote.symbol,
            price: quote.regularMarketPrice,
            change: quote.regularMarketChange,
            changePercent: quote.regularMarketChangePercent,
            currency: quote.currency,
            marketState: quote.marketState,
            displayName: quote.displayName || quote.shortName || quote.symbol
        }));
    } catch (error) {
        console.error(`Yahoo Batch Quotes error - Falling back to mock data:`, error);
        return tickers.map(ticker => {
            const mockEtf = MOCK_ETFS.find(e => e.id === ticker);
            if (mockEtf) {
                return {
                    symbol: ticker,
                    price: mockEtf.price,
                    change: (mockEtf.changePercent / 100) * mockEtf.price,
                    changePercent: mockEtf.changePercent,
                    currency: "EUR",
                    marketState: "REGULAR",
                    displayName: mockEtf.name
                };
            }
            return {
                symbol: ticker,
                price: 100,
                change: 0,
                changePercent: 0,
                currency: "EUR",
                marketState: "REGULAR",
                displayName: ticker
            };
        });
    }
}

export async function searchYahooTicker(query: string) {
    try {
        const result = (await yahooFinance.search(query, {
            quotesCount: 1,
            newsCount: 0
        }, DEFAULT_OPTIONS)) as any;
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
        const result = (await yahooFinance.chart(symbol, {
            period1: startOfYear,
            period2: now,
            interval: '1d'
        }, DEFAULT_OPTIONS)) as any;

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
        const result = (await yahooFinance.search(symbol, {
            newsCount: 5,
            quotesCount: 0
        }, DEFAULT_OPTIONS)) as any;
        return result.news || [];
    } catch (error) {
        console.error(`Yahoo News error for ${symbol}:`, error);
        return [];
    }
}
