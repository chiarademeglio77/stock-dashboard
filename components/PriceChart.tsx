"use client";

import {
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ComposedChart,
    Line,
    Brush,
    Bar,
    ReferenceLine,
    Cell,
    Legend,
} from "recharts";
import { AnalysisResult } from "@/lib/analysis-engine";
import { useMemo, useRef, useState } from "react";
import { Activity, BarChart2 } from "lucide-react";

interface PriceChartProps {
    data: AnalysisResult[];
    startIndex?: number;
    endIndex?: number;
    onZoomChange?: (range: { startIndex: number; endIndex: number }) => void;
    comparisonDataMap?: Record<string, AnalysisResult[]>;
    mainAssetId?: string;
    selectedPeriod?: number | "YTD";
    onPointClick?: (date: string, x: number, y: number) => void;
}

export function PriceChart({
    data,
    startIndex,
    endIndex,
    onZoomChange,
    comparisonDataMap = {},
    mainAssetId = "Asset",
    selectedPeriod = 365,
    onPointClick
}: PriceChartProps) {
    const [showRSI, setShowRSI] = useState(false);
    const [showMACD, setShowMACD] = useState(false);
    const [showSMA20, setShowSMA20] = useState(false);
    const [showEMA50, setShowEMA50] = useState(false);
    const [showEMA200, setShowEMA200] = useState(false);
    const [showBB, setShowBB] = useState(false);

    const lastDataRef = useRef(data);
    const lastDataChangeRef = useRef(0);

    if (lastDataRef.current !== data) {
        lastDataRef.current = data;
        lastDataChangeRef.current = Date.now();
    }

    const avgVolume = useMemo(() => {
        if (data.length === 0) return 0;
        const sum = data.reduce((acc, curr) => acc + curr.volume, 0);
        return sum / data.length;
    }, [data]);

    const normalizedData = useMemo(() => {
        if (data.length === 0) return [];

        const mainBase = data[0].close;
        const tickers = Object.keys(comparisonDataMap);

        // Pre-map the comparison data by date for O(1) lookup
        // AND pre-calculate the base value for normalization
        const tickerDataMaps: Record<string, Record<string, any>> = {};
        const tickerBases: Record<string, number> = {};

        tickers.forEach(ticker => {
            const cData = comparisonDataMap[ticker];
            if (!cData || cData.length === 0) return;

            const map: Record<string, any> = {};
            cData.forEach(cd => { map[cd.date] = cd; });
            tickerDataMaps[ticker] = map;

            const compBaseEntry = cData.find(cd => cd.date === data[0].date) || cData[0];
            if (compBaseEntry) {
                tickerBases[ticker] = compBaseEntry.close;
            }
        });

        const lastKnownValues: Record<string, number> = {};

        return data.map((d) => {
            const result: any = { ...d, mainIndex: (d.close / mainBase) * 100 };

            tickers.forEach(ticker => {
                const compBase = tickerBases[ticker];
                if (compBase === undefined) return;

                const compEntry = tickerDataMaps[ticker]?.[d.date];

                if (compEntry) {
                    lastKnownValues[ticker] = compEntry.close;
                }

                if (lastKnownValues[ticker] !== undefined) {
                    result[`${ticker}_Index`] = (lastKnownValues[ticker] / compBase) * 100;
                    result[`${ticker}_Value`] = lastKnownValues[ticker];
                }
            });
            return result;
        });
    }, [data, comparisonDataMap]);

    const handleBrushChange = (range: any) => {
        if (onZoomChange && range) {
            const isFullRange = range.startIndex === 0 && range.endIndex === data.length - 1;
            const justChangedData = Date.now() - lastDataChangeRef.current < 500;
            if (justChangedData && isFullRange && (startIndex !== 0 || endIndex !== (data.length - 1))) return;
            if (range.startIndex !== startIndex || range.endIndex !== endIndex) {
                onZoomChange({ startIndex: range.startIndex, endIndex: range.endIndex });
            }
        }
    };

    const commonXAxis = (hide: boolean = false) => (
        <XAxis
            dataKey="date"
            hide={hide}
            tickFormatter={(str) => {
                const date = new Date(str);
                // If the string length is > 10, it's likely an ISO string with time
                if (str.length > 10) {
                    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
                }
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            }}
            stroke="#0f172a"
            fontSize={10}
            tickLine={false}
            axisLine={false}
        />
    );

    const tooltipContentStyle = {
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "0.5rem",
        fontSize: '14px',
        color: '#0f172a',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
    };

    return (
        <div className="h-full w-full flex flex-col gap-2">
            <div className="flex gap-2 mb-1">
                <button
                    onClick={() => setShowRSI(!showRSI)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold transition-all border ${showRSI ? "bg-primary/10 border-primary text-primary" : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"}`}
                >
                    <Activity className="h-3 w-3" /> RSI
                </button>
                <button
                    onClick={() => setShowMACD(!showMACD)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold transition-all border ${showMACD ? "bg-primary/10 border-primary text-primary" : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"}`}
                >
                    <BarChart2 className="h-3 w-3" /> MACD
                </button>
                <div className="w-[1px] h-4 bg-border mx-1 self-center" />
                <button
                    onClick={() => setShowSMA20(!showSMA20)}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all border ${showSMA20 ? "bg-[#ffc658]/10 border-[#ffc658] text-[#ffc658]" : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"}`}
                >
                    SMA 20
                </button>
                <button
                    onClick={() => setShowEMA50(!showEMA50)}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all border ${showEMA50 ? "bg-[#82ca9d]/10 border-[#82ca9d] text-[#82ca9d]" : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"}`}
                >
                    EMA 50
                </button>
                <button
                    onClick={() => setShowEMA200(!showEMA200)}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all border ${showEMA200 ? "bg-[#ff7300]/10 border-[#ff7300] text-[#ff7300]" : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"}`}
                >
                    EMA 200
                </button>
                <button
                    onClick={() => setShowBB(!showBB)}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all border ${showBB ? "bg-[#8884d8]/10 border-[#8884d8] text-[#8884d8]" : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"}`}
                >
                    BB
                </button>
            </div>

            <div className={`flex-1 min-h-0 flex flex-col ${showRSI || showMACD ? 'gap-2' : ''}`}>
                {/* Main Price Chart */}
                <div style={{ height: showRSI && showMACD ? '60%' : (showRSI || showMACD ? '75%' : '100%'), minHeight: '400px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={normalizedData}
                            syncId="stockSync"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            onClick={(state: any) => {
                                if (onPointClick && state?.activeLabel) {
                                    onPointClick(state.activeLabel, state.chartX, state.chartY);
                                }
                            }}
                            className="cursor-pointer"
                        >
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingBottom: '10px' }} />
                            <ReferenceLine yAxisId="price" y={100} stroke="#cbd5e1" strokeDasharray="5 5" label={{ value: 'Baseline', position: 'right', fontSize: 10, fill: '#94a3b8' }} />
                            {commonXAxis(!showRSI && !showMACD ? false : true)}
                            <YAxis
                                yAxisId="price"
                                orientation={Object.keys(comparisonDataMap).length > 0 ? "right" : "left"}
                                domain={["auto", "auto"]}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(val) =>
                                    Object.keys(comparisonDataMap).length > 0
                                        ? `${(val - 100) >= 0 ? "+" : ""}${(val - 100).toFixed(0)}%`
                                        : `€${val.toLocaleString()}`
                                }
                                stroke={Object.keys(comparisonDataMap).length > 0 ? "#94a3b8" : "#1e293b"}
                                fontSize={Object.keys(comparisonDataMap).length > 0 ? 10 : 12}
                                width={Object.keys(comparisonDataMap).length > 0 ? 45 : 60}
                            />
                            <YAxis yAxisId="volume" orientation="right" domain={[0, (dataMax: number) => dataMax * 4]} hide />
                            <Tooltip
                                contentStyle={tooltipContentStyle}
                                itemStyle={{ color: "hsl(var(--foreground))" }}
                                labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                                formatter={((val: any, name: string, props: any) => {
                                    const tickers = Object.keys(comparisonDataMap);
                                    if (name === "Price" || tickers.includes(name)) {
                                        const originalPrice = name === "Price" ? props.payload.close : props.payload[`${name}_Value`];
                                        const indicatorColors: any = { "SPY": "#f97316", "QQQ": "#14b8a6", "VGK": "#8b5cf6" };
                                        const rotatingColors = ["#ef4444", "#10b981", "#3b82f6", "#f59e0b", "#6366f1"];

                                        let color = "#1e40af"; // Default for Price
                                        if (name !== "Price") {
                                            color = indicatorColors[name] || rotatingColors[tickers.indexOf(name) % rotatingColors.length];
                                        }

                                        return [
                                            <div key="val" className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black" style={{ color }}>{name}: {val.toFixed(2)}</span>
                                                    <span className="text-[10px] font-bold text-slate-500">({(val - 100).toFixed(2)}%)</span>
                                                </div>
                                                {originalPrice && <div className="text-[11px] font-medium text-slate-400">Value: {name === "Price" ? `€${originalPrice.toLocaleString()}` : originalPrice.toLocaleString()}</div>}
                                            </div>,
                                            ''
                                        ];
                                    }
                                    return [val.toLocaleString(), null];
                                }) as any}
                                labelFormatter={(label) => {
                                    const date = new Date(label);
                                    if (label.length > 10) {
                                        return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
                                    }
                                    return date.toLocaleDateString();
                                }}
                            />
                            <Bar
                                yAxisId="volume"
                                dataKey="volume"
                                legendType="none"
                            >
                                {normalizedData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.close >= (entry.open || entry.close) ? "oklch(0.7 0.2 140)" : "oklch(0.6 0.2 25)"}
                                        opacity={0.2}
                                    />
                                ))}
                            </Bar>
                            {Object.keys(comparisonDataMap).length > 0 ? (
                                <>
                                    {/* Main Asset Line */}
                                    <Line
                                        yAxisId="price"
                                        type="monotone"
                                        dataKey="mainIndex"
                                        stroke="#1e40af"
                                        strokeWidth={3}
                                        dot={false}
                                        name={`[${selectedPeriod === "YTD" ? "YTD" : `${selectedPeriod}D`} %] | ${mainAssetId}`}
                                        isAnimationActive={false}
                                    />
                                    {Object.keys(comparisonDataMap).map((ticker, idx) => {
                                        const indicatorColors: any = { "SPY": "#f97316", "QQQ": "#14b8a6", "VGK": "#8b5cf6" };
                                        const rotatingColors = ["#ef4444", "#10b981", "#3b82f6", "#f59e0b", "#6366f1"];
                                        const color = indicatorColors[ticker] || rotatingColors[idx % rotatingColors.length];

                                        const periodLabel = selectedPeriod === "YTD" ? "YTD" : `${selectedPeriod}D`;
                                        const legendName = `[${periodLabel} %] | ${ticker}`;

                                        return (
                                            <Line
                                                key={ticker}
                                                yAxisId="price"
                                                type="monotone"
                                                dataKey={`${ticker}_Index`}
                                                stroke={color}
                                                strokeWidth={3}
                                                dot={false}
                                                name={legendName}
                                                isAnimationActive={false}
                                            />
                                        );
                                    })}
                                </>
                            ) : (
                                <>
                                    <Area yAxisId="price" type="monotone" dataKey="close" stroke="#2563eb" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }} name={mainAssetId} />
                                    {showSMA20 && <Line yAxisId="price" type="monotone" dataKey="sma" stroke="#ffc658" strokeWidth={1.5} dot={false} name="SMA (20)" />}
                                    {showEMA50 && <Line yAxisId="price" type="monotone" dataKey="ema" stroke="#82ca9d" strokeWidth={1.5} dot={false} name="EMA (50)" />}
                                    {showEMA200 && <Line yAxisId="price" type="monotone" dataKey="ema200" stroke="#ff7300" strokeWidth={1.5} dot={false} name="EMA (200)" />}
                                    {showBB && (
                                        <>
                                            <Line yAxisId="price" type="monotone" dataKey="bbUpper" stroke="#8884d8" strokeWidth={1} strokeDasharray="5 5" dot={false} name="BB Upper" opacity={0.6} />
                                            <Line yAxisId="price" type="monotone" dataKey="bbLower" stroke="#8884d8" strokeWidth={1} strokeDasharray="5 5" dot={false} name="BB Lower" opacity={0.6} />
                                        </>
                                    )}
                                </>
                            )}
                            <Brush dataKey="date" height={20} stroke="#94a3b8" fill="#f8fafc" startIndex={startIndex} endIndex={endIndex} onChange={handleBrushChange} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* MACD Chart */}
                {showMACD && (
                    <div style={{ height: showRSI ? '20%' : '25%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data} syncId="stockSync" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                                {commonXAxis(showRSI ? true : false)}
                                <YAxis orientation="left" fontSize={12} tickLine={false} axisLine={false} stroke="#0f172a" />
                                <Tooltip contentStyle={{ ...tooltipContentStyle, fontSize: '10px' }} />
                                <Bar dataKey="macdHist" fill="#8884d8" name="Hist" />
                                <Line dataKey="macd" stroke="#ff7300" dot={false} name="MACD" strokeWidth={1} />
                                <Line dataKey="macdSignal" stroke="#387908" dot={false} name="Signal" strokeWidth={1} />
                                {!showRSI && (
                                    <Brush dataKey="date" height={20} stroke="#94a3b8" fill="#f8fafc" startIndex={startIndex} endIndex={endIndex} onChange={handleBrushChange} />
                                )}
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* RSI Chart */}
                {showRSI && (
                    <div style={{ height: showMACD ? '20%' : '25%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data} syncId="stockSync" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                                {commonXAxis(false)}
                                <YAxis domain={[0, 100]} orientation="left" fontSize={12} tickLine={false} axisLine={false} stroke="#0f172a" ticks={[30, 70]} />
                                <Tooltip contentStyle={{ ...tooltipContentStyle, fontSize: '10px' }} />
                                <ReferenceLine y={70} stroke="red" strokeDasharray="3 3" label={{ value: '70', fontSize: 8, fill: 'red', position: 'insideLeft' }} />
                                <ReferenceLine y={30} stroke="green" strokeDasharray="3 3" label={{ value: '30', fontSize: 8, fill: 'green', position: 'insideLeft' }} />
                                <Line dataKey="rsi" stroke="#7c3aed" dot={false} name="RSI" strokeWidth={2} />
                                <Brush dataKey="date" height={20} stroke="#94a3b8" fill="#f8fafc" startIndex={startIndex} endIndex={endIndex} onChange={handleBrushChange} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}
