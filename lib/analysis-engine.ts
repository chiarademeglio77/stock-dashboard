import { MarketData } from './data-engine';

export interface AnalysisResult extends MarketData {
    sma?: number;
    ema?: number;
    stdDev?: number;
}

export function calculateSMA(data: MarketData[], period: number): (number | null)[] {
    const sma: (number | null)[] = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            sma.push(null);
            continue;
        }

        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += data[i - j].close;
        }
        sma.push(sum / period);
    }
    return sma;
}

export function calculateEMA(data: MarketData[], period: number): (number | null)[] {
    const ema: (number | null)[] = [];
    const k = 2 / (period + 1);

    // If data is too short for the period, return all nulls
    if (data.length < period) {
        return new Array(data.length).fill(null);
    }

    // Initialize first EMA with SMA or just the first price if period is 1 (though usually SMA first)
    // Standard practice: First EMA is SMA of first 'period' elements
    let firstSMA = 0;
    for (let i = 0; i < period; i++) {
        firstSMA += data[i].close;
    }
    firstSMA /= period;

    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            ema.push(null);
        } else if (i === period - 1) {
            ema.push(firstSMA);
        } else {
            const prevEMA = ema[i - 1]!;
            const currentEMA = (data[i].close - prevEMA) * k + prevEMA;
            ema.push(currentEMA);
        }
    }
    return ema;
}

export function combineAnalysis(data: MarketData[], smaPeriod: number = 20, emaPeriod: number = 50): AnalysisResult[] {
    const sma = calculateSMA(data, smaPeriod);
    const ema = calculateEMA(data, emaPeriod);

    return data.map((d, i) => ({
        ...d,
        sma: sma[i] ?? undefined,
        ema: ema[i] ?? undefined
    }));
}

export function calculateStandardDeviation(data: MarketData[], period: number): (number | null)[] {
    const stdDev: (number | null)[] = [];
    // We can rely on the existing calculateSMA or a quick inline mean
    // However, usually SD is relative to the Mean (SMA)
    // To be efficient, we calculate mean for the window separately or use SMA if we had it passed in. 
    // Here we will calculate the mean independently for clarity.

    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            stdDev.push(null);
            continue;
        }

        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += data[i - j].close;
        }
        const mean = sum / period;

        let sumSqDiff = 0;
        for (let j = 0; j < period; j++) {
            const diff = data[i - j].close - mean;
            sumSqDiff += diff * diff;
        }

        const variance = sumSqDiff / period;
        stdDev.push(Math.sqrt(variance));
    }
    return stdDev;
}
