import { NextRequest, NextResponse } from "next/server";
import { fetchYahooQuotesBatch } from "@/lib/yahoo-service";
import { MOCK_ETFS } from "@/lib/mock-etfs";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');

    // Fetch all tickers from our mock list to provide real quotes
    let tickers = [...MOCK_ETFS.map(etf => etf.id), "EURUSD", "EURGBP", "EURCNY"];

    // Appending the custom configured assets to our master request list
    if (symbolsParam) {
        const extraSymbols = symbolsParam.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
        tickers = Array.from(new Set([...tickers, ...extraSymbols]));
    }

    try {
        const quotes = await fetchYahooQuotesBatch(tickers);
        return NextResponse.json(quotes);
    } catch (error: any) {
        console.error("Batch quote fetch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
