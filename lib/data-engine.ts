export interface MarketData {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export function generateHistoricalData(days: number = 365): MarketData[] {
    const data: MarketData[] = [];
    let price = 150.0; // Start price
    const now = new Date();

    for (let i = 0; i < days; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (days - i));
        const dateStr = date.toISOString().split('T')[0];

        const volatility = price * 0.02; // 2% daily volatility
        const change = (Math.random() - 0.5) * volatility;
        const open = price;
        const close = price + change;
        const high = Math.max(open, close) + Math.random() * volatility * 0.5;
        const low = Math.min(open, close) - Math.random() * volatility * 0.5;
        const volume = Math.floor(Math.random() * 1000000) + 500000;

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
