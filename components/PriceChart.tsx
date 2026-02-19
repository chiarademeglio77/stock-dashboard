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
    Legend,
} from "recharts";
import { AnalysisResult } from "@/lib/analysis-engine";
import { useMemo, useRef } from "react";

interface PriceChartProps {
    data: AnalysisResult[];
    startIndex?: number;
    endIndex?: number;
    onZoomChange?: (range: { startIndex: number; endIndex: number }) => void;
}

export function PriceChart({ data, startIndex, endIndex, onZoomChange }: PriceChartProps) {
    const lastDataRef = useRef(data);
    const lastDataChangeRef = useRef(0);

    // If data reference changes, we want to ignore the next reset event from Recharts
    if (lastDataRef.current !== data) {
        lastDataRef.current = data;
        lastDataChangeRef.current = Date.now();
    }

    const avgVolume = useMemo(() => {
        if (data.length === 0) return 0;
        const sum = data.reduce((acc, curr) => acc + curr.volume, 0);
        return sum / data.length;
    }, [data]);

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="hsl(var(--muted-foreground))"
                        opacity={0.1}
                    />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(str) => {
                            const date = new Date(str);
                            return date.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                            });
                        }}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        yAxisId="price"
                        domain={["auto", "auto"]}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `€${val.toFixed(0)}`}
                    />
                    <YAxis
                        yAxisId="volume"
                        orientation="right"
                        domain={[0, (dataMax: number) => dataMax * 4]} // Keep volume at bottom
                        hide
                    />
                    <Legend
                        verticalAlign="top"
                        height={36}
                        formatter={(value) => {
                            if (value === "close") return "Price";
                            if (value === "sma") return "SMA (20)";
                            if (value === "ema") return "EMA (50)";
                            if (value === "volume") return "Volume";
                            return value;
                        }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "0.5rem",
                        }}
                        itemStyle={{ color: "hsl(var(--foreground))" }}
                        labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={((value: number | undefined, name: string | undefined) => [
                            name === "volume" ? (value ?? 0).toLocaleString() : `€${(value ?? 0).toFixed(2)}`,
                            name === "close" ? "Price" :
                                name === "sma" ? "SMA (20)" :
                                    name === "ema" ? "EMA (50)" :
                                        name === "volume" ? "Volume" : (name ?? "")
                        ]) as any}
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Bar
                        yAxisId="volume"
                        dataKey="volume"
                        fill="hsl(var(--muted-foreground))"
                        opacity={0.2}
                        name="volume"
                    />
                    <ReferenceLine
                        yAxisId="volume"
                        y={avgVolume}
                        stroke="#f97316"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        label={{
                            value: 'Avg vol',
                            position: 'insideBottomRight',
                            fill: '#f97316',
                            fontSize: 12,
                            fontWeight: 'bold',
                            dy: -10
                        }}
                    />
                    <Area
                        yAxisId="price"
                        type="monotone"
                        dataKey="close"
                        stroke="#8884d8"
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                        strokeWidth={2}
                    />
                    <Line
                        yAxisId="price"
                        type="monotone"
                        dataKey="sma"
                        stroke="#ffc658"
                        strokeWidth={2}
                        dot={false}
                        name="sma"
                    />
                    <Line
                        yAxisId="price"
                        type="monotone"
                        dataKey="ema"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        dot={false}
                        name="ema"
                    />
                    <Brush
                        dataKey="date"
                        height={40}
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--background))"
                        startIndex={startIndex}
                        endIndex={endIndex}
                        onChange={(range: any) => {
                            if (onZoomChange && range) {
                                const isFullRange = range.startIndex === 0 && range.endIndex === data.length - 1;
                                const justChangedData = Date.now() - lastDataChangeRef.current < 500;

                                // Ignore full-range reset signals that happen automatically after data change
                                if (justChangedData && isFullRange && (startIndex !== 0 || endIndex !== (data.length - 1))) {
                                    return;
                                }

                                // Use a small check to avoid infinite loops but allow updates
                                if (range.startIndex !== startIndex || range.endIndex !== endIndex) {
                                    onZoomChange({
                                        startIndex: range.startIndex,
                                        endIndex: range.endIndex
                                    });
                                }
                            }
                        }}
                        tickFormatter={(str) => {
                            const date = new Date(str);
                            return date.toLocaleDateString("en-US", { month: "short" });
                        }}
                        travellerWidth={24}
                        traveller={(props: any) => {
                            const { x, y, width, height } = props;
                            return (
                                <circle
                                    cx={x + width / 2}
                                    cy={y + height / 2}
                                    r={8}
                                    fill="#ef4444"
                                    stroke="#fff"
                                    strokeWidth={2}
                                    style={{ cursor: 'grab' }}
                                />
                            );
                        }}
                    >
                        <ComposedChart data={data}>
                            <Bar dataKey="volume" fill="hsl(var(--primary))" opacity={0.3} />
                        </ComposedChart>
                    </Brush>
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
