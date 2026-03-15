import { NextRequest, NextResponse } from "next/server";
import { fetchYahooHistoricalData } from "@/lib/yahoo-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get("ticker");
    const days = parseInt(searchParams.get("days") || "365");
    const interval = searchParams.get("interval") || "1d";

    if (!ticker) {
        return NextResponse.json({ error: "Ticker is required" }, { status: 400 });
    }

    try {
        const data = await fetchYahooHistoricalData(ticker, days, interval);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Market data fetch error:", error);
        // Return an empty array so the frontend doesn't throw, 
        // triggering the simulation fallback instead
        return NextResponse.json([]);
    }
}
