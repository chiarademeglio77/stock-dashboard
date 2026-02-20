import { MarketData } from './data-engine';

export interface AnalysisResult extends MarketData {
    sma?: number;
    ema?: number;
    stdDev?: number;
    rsi?: number;
    macd?: number;
    macdSignal?: number;
    macdHist?: number;
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

export function calculateRSI(data: MarketData[], period: number = 14): (number | null)[] {
    const rsi: (number | null)[] = [];
    if (data.length < period + 1) return new Array(data.length).fill(null);

    let gains = 0;
    let losses = 0;

    // Initial average gain and loss
    for (let i = 1; i <= period; i++) {
        const change = data[i].close - data[i - 1].close;
        if (change > 0) gains += change;
        else losses -= change;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = 0; i < data.length; i++) {
        if (i < period) {
            rsi.push(null);
        } else if (i === period) {
            const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            rsi.push(100 - 100 / (1 + rs));
        } else {
            const change = data[i].close - data[i - 1].close;
            const gain = change > 0 ? change : 0;
            const loss = change < 0 ? -change : 0;

            avgGain = (avgGain * (period - 1) + gain) / period;
            avgLoss = (avgLoss * (period - 1) + loss) / period;

            const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            rsi.push(100 - 100 / (1 + rs));
        }
    }
    return rsi;
}

export function calculateMACD(data: MarketData[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) {
    const fastEMA = calculateEMA(data, fastPeriod);
    const slowEMA = calculateEMA(data, slowPeriod);

    const macdLine: (number | null)[] = [];
    for (let i = 0; i < data.length; i++) {
        if (fastEMA[i] !== null && slowEMA[i] !== null) {
            macdLine.push(fastEMA[i]! - slowEMA[i]!);
        } else {
            macdLine.push(null);
        }
    }

    // To calculate Signal Line (EMA of MACD Line), we need a helper or wrap it
    // EMA usually takes MarketData[]. Let's create a simpler EMA for numbers.
    function calculateNumberEMA(values: (number | null)[], period: number): (number | null)[] {
        const ema: (number | null)[] = [];
        const k = 2 / (period + 1);

        let firstValidIndex = values.findIndex(v => v !== null);
        if (firstValidIndex === -1 || values.length - firstValidIndex < period) {
            return new Array(values.length).fill(null);
        }

        let firstEMA = 0;
        for (let i = firstValidIndex; i < firstValidIndex + period; i++) {
            firstEMA += values[i]!;
        }
        firstEMA /= period;

        for (let i = 0; i < values.length; i++) {
            if (i < firstValidIndex + period - 1) {
                ema.push(null);
            } else if (i === firstValidIndex + period - 1) {
                ema.push(firstEMA);
            } else {
                const prevEMA = ema[i - 1]!;
                const currentEMA = (values[i]! - prevEMA) * k + prevEMA;
                ema.push(currentEMA);
            }
        }
        return ema;
    }

    const signalLine = calculateNumberEMA(macdLine, signalPeriod);
    const histogram: (number | null)[] = [];

    for (let i = 0; i < data.length; i++) {
        if (macdLine[i] !== null && signalLine[i] !== null) {
            histogram.push(macdLine[i]! - signalLine[i]!);
        } else {
            histogram.push(null);
        }
    }

    return { macdLine, signalLine, histogram };
}
