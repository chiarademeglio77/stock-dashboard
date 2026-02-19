import { NextRequest, NextResponse } from "next/server";
import { fetchYahooHistoricalData } from "@/lib/yahoo-service";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get("ticker");
    const days = parseInt(searchParams.get("days") || "365");

    if (!ticker) {
        return NextResponse.json({ error: "Ticker is required" }, { status: 400 });
    }

    try {
        const data = await fetchYahooHistoricalData(ticker, days);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Market data fetch error:", error);
        // Return an empty array so the frontend doesn't throw, 
        // triggering the simulation fallback instead
        return NextResponse.json([]);
    }
}
