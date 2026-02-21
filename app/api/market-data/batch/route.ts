import { NextRequest, NextResponse } from "next/server";
import { fetchYahooQuotesBatch } from "@/lib/yahoo-service";
import { MOCK_ETFS } from "@/lib/mock-etfs";

export async function GET(request: NextRequest) {
    // Fetch all tickers from our mock list to provide real quotes
    const tickers = [...MOCK_ETFS.map(etf => etf.id), "EURUSD", "EURGBP", "EURCNY"];

    try {
        const quotes = await fetchYahooQuotesBatch(tickers);
        return NextResponse.json(quotes);
    } catch (error: any) {
        console.error("Batch quote fetch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
