"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ETF } from "@/lib/mock-etfs";
import { useMemo } from "react";

interface DiversificationChartProps {
    portfolio: { id: string; quantity: number; purchasePrice: number }[];
    etfs: ETF[];
    realQuotes: Record<string, any>;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#ff7300"];

export function DiversificationChart({ portfolio, etfs, realQuotes }: DiversificationChartProps) {
    const { sectorData, regionData } = useMemo(() => {
        const sectors: Record<string, number> = {};
        const regions: Record<string, number> = {};
        let totalValue = 0;

        portfolio.forEach(item => {
            const etf = etfs.find(e => e.id === item.id);
            if (!etf) return;

            const quote = realQuotes[item.id] || { price: etf.price };
            const value = item.quantity * quote.price;
            totalValue += value;

            const sector = etf.sector || "Other";
            const region = etf.region || "Other";

            sectors[sector] = (sectors[sector] || 0) + value;
            regions[region] = (regions[region] || 0) + value;
        });

        const sectorArray = Object.entries(sectors).map(([name, value]) => ({
            name,
            value,
            percent: totalValue > 0 ? (value / totalValue) * 100 : 0
        })).sort((a, b) => b.value - a.value);

        const regionArray = Object.entries(regions).map(([name, value]) => ({
            name,
            value,
            percent: totalValue > 0 ? (value / totalValue) * 100 : 0
        })).sort((a, b) => b.value - a.value);

        return { sectorData: sectorArray, regionData: regionArray };
    }, [portfolio, etfs, realQuotes]);

    const renderTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-card border rounded-lg p-2 shadow-sm text-xs">
                    <p className="font-bold">{data.name}</p>
                    <p className="text-muted-foreground">{data.percent.toFixed(1)}%</p>
                    <p className="text-primary font-mono">€{data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
            );
        }
        return null;
    };

    if (portfolio.length === 0) {
        return (
            <div className="h-full flex items-center justify-center border rounded-xl bg-card/30 border-dashed">
                <p className="text-sm text-muted-foreground">Add assets to your portfolio to see diversification</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <div className="flex flex-col">
                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-4 text-center">Sector Distribution</h4>
                <div className="flex-1 min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={sectorData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {sectorData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={renderTooltip} />
                            <Legend
                                verticalAlign="bottom"
                                align="center"
                                iconType="circle"
                                wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="flex flex-col">
                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-4 text-center">Geographic Distribution</h4>
                <div className="flex-1 min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={regionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {regionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={renderTooltip} />
                            <Legend
                                verticalAlign="bottom"
                                align="center"
                                iconType="circle"
                                wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
