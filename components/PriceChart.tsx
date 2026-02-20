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
} from "recharts";
import { AnalysisResult } from "@/lib/analysis-engine";
import { useMemo, useRef, useState } from "react";
import { Activity, BarChart2 } from "lucide-react";

interface PriceChartProps {
    data: AnalysisResult[];
    startIndex?: number;
    endIndex?: number;
    onZoomChange?: (range: { startIndex: number; endIndex: number }) => void;
}

export function PriceChart({ data, startIndex, endIndex, onZoomChange }: PriceChartProps) {
    const [showRSI, setShowRSI] = useState(false);
    const [showMACD, setShowMACD] = useState(false);

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
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            }}
            stroke="hsl(var(--muted-foreground))"
            fontSize={10}
            tickLine={false}
            axisLine={false}
        />
    );

    const tooltipContentStyle = {
        backgroundColor: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "0.5rem",
        fontSize: '12px'
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
            </div>

            <div className={`flex-1 min-h-0 flex flex-col ${showRSI || showMACD ? 'gap-2' : ''}`}>
                {/* Main Price Chart */}
                <div style={{ height: showRSI && showMACD ? '60%' : (showRSI || showMACD ? '75%' : '100%') }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data} syncId="stockSync" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                            {commonXAxis(!showRSI && !showMACD ? false : true)}
                            <YAxis yAxisId="price" domain={["auto", "auto"]} stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `€${val.toFixed(0)}`} />
                            <YAxis yAxisId="volume" orientation="right" domain={[0, (dataMax: number) => dataMax * 4]} hide />
                            <Tooltip
                                contentStyle={tooltipContentStyle}
                                itemStyle={{ color: "hsl(var(--foreground))" }}
                                labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                                formatter={((val: any, name: string) => [
                                    name === "volume" ? val.toLocaleString() : `€${val.toFixed(2)}`,
                                    name === "close" ? "Price" : name === "sma" ? "SMA (20)" : name === "ema" ? "EMA (50)" : name
                                ]) as any}
                                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                            />
                            <Bar yAxisId="volume" dataKey="volume" fill="hsl(var(--muted-foreground))" opacity={0.2} name="volume" />
                            <Area yAxisId="price" type="monotone" dataKey="close" stroke="#8884d8" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} name="Price" />
                            <Line yAxisId="price" type="monotone" dataKey="sma" stroke="#ffc658" strokeWidth={2} dot={false} name="SMA (20)" />
                            <Line yAxisId="price" type="monotone" dataKey="ema" stroke="#82ca9d" strokeWidth={2} dot={false} name="EMA (50)" />
                            {!showRSI && !showMACD && (
                                <Brush dataKey="date" height={30} stroke="hsl(var(--primary))" fill="hsl(var(--background))" startIndex={startIndex} endIndex={endIndex} onChange={handleBrushChange} />
                            )}
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
                                <YAxis orientation="left" fontSize={10} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                                <Tooltip contentStyle={{ ...tooltipContentStyle, fontSize: '10px' }} />
                                <Bar dataKey="macdHist" fill="#8884d8" name="Hist" />
                                <Line dataKey="macd" stroke="#ff7300" dot={false} name="MACD" strokeWidth={1} />
                                <Line dataKey="macdSignal" stroke="#387908" dot={false} name="Signal" strokeWidth={1} />
                                {!showRSI && (
                                    <Brush dataKey="date" height={20} stroke="hsl(var(--primary))" fill="hsl(var(--background))" startIndex={startIndex} endIndex={endIndex} onChange={handleBrushChange} />
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
                                <YAxis domain={[0, 100]} orientation="left" fontSize={10} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" ticks={[30, 70]} />
                                <Tooltip contentStyle={{ ...tooltipContentStyle, fontSize: '10px' }} />
                                <ReferenceLine y={70} stroke="red" strokeDasharray="3 3" label={{ value: '70', fontSize: 8, fill: 'red', position: 'insideLeft' }} />
                                <ReferenceLine y={30} stroke="green" strokeDasharray="3 3" label={{ value: '30', fontSize: 8, fill: 'green', position: 'insideLeft' }} />
                                <Line dataKey="rsi" stroke="#8884d8" dot={false} name="RSI" strokeWidth={2} />
                                <Brush dataKey="date" height={20} stroke="hsl(var(--primary))" fill="hsl(var(--background))" startIndex={startIndex} endIndex={endIndex} onChange={handleBrushChange} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}
