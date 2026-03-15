export interface MarketData {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export function generateHistoricalData(days: number = 365, startPrice: number = 150.0): MarketData[] {
    const data: MarketData[] = [];
    let price = startPrice;
    const now = new Date();

    // To make it look like 'yesterday' ended at the startPrice,
    // we generate backwards then reverse, or just generate with minor shifts.
    for (let i = 0; i < days; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (days - i));
        const dateStr = date.toISOString().split('T')[0];

        const volatility = price * 0.015; // 1.5% daily volatility
        const change = (Math.random() - 0.48) * volatility; // Slight upward bias
        const open = price;
        const close = price + change;
        const high = Math.max(open, close) + Math.random() * volatility * 0.3;
        const low = Math.min(open, close) - Math.random() * volatility * 0.3;
        const volume = Math.floor(Math.random() * 800000) + 200000;

        data.push({
            date: dateStr,
            open,
            high,
            low,
            close,
            volume,
        });

        price = close;
    }

    return data;
}
