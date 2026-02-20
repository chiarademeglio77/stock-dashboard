import { NextRequest, NextResponse } from "next/server";
import { fetchYahooNews } from "@/lib/yahoo-service";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get("ticker");

    if (!ticker) {
        return NextResponse.json({ error: "Ticker is required" }, { status: 400 });
    }

    try {
        const news = await fetchYahooNews(ticker);
        return NextResponse.json(news);
    } catch (error) {
        console.error("News fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
    }
}
