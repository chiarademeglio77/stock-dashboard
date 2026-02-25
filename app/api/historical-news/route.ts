import { NextResponse } from "next/server";

// Hardcoded "Real" Market Knowledge Base
const HISTORICAL_EVENTS: Record<string, { title: string; publisher: string; type: "index" | "market" | "stock" }> = {
    "2024-05-14": { title: "Eurozone GDP Growth Beats Expectations; Italy Leads Recovery", publisher: "Reuters", type: "index" },
    "2024-04-11": { title: "ECB Signals Rate Cuts as Inflation Cools Across Eurozone", publisher: "Bloomberg", type: "index" },
    "2024-03-07": { title: "FTSE MIB Hits multi-year High as Banking Sector Rallies", publisher: "Il Sole 24 Ore", type: "index" },
    "2024-02-06": { title: "UniCredit Reports Record Net Profit; Largest Dividend in Decade", publisher: "Financial Times", type: "stock" },
    "2023-10-26": { title: "Global Markets Steady After ECB Decides to Hold Rates", publisher: "CNBC", type: "market" },
    "2023-08-08": { title: "Italian Bank Stocks Slump After Surprise Windfall Tax Announcement", publisher: "Reuters", type: "index" },
    "2023-03-15": { title: "Banking Panic Spreads as Credit Suisse Seeks Central Bank Support", publisher: "Bloomberg", type: "market" },
    "2022-02-24": { title: "Global Market Sell-off Following Start of Conflict in Ukraine", publisher: "Reuters", type: "market" },
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get("ticker");
    const dateStr = searchParams.get("date"); // Format: YYYY-MM-DD

    if (!ticker || !dateStr) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const results = [];
    const event = HISTORICAL_EVENTS[dateStr];

    // 1. Check if we have a specific event for this date
    if (event) {
        results.push({
            ...event,
            link: "#", // Clicking "Source" in UI will lead to Google News Search
            time: "09:30 AM"
        });
    } else {
        // 2. Fallback: Provide Index Context based on Ticker
        const italianStocks = ["UCG", "ISP", "ENI", "ENEL", "RACE", "G", "STLAM", "ETFMIB"];
        const isItalian = italianStocks.includes(ticker) || ticker.endsWith(".MI");

        if (isItalian) {
            results.push({
                title: `Focus: FTSE MIB Performance & Italian Market Context`,
                publisher: "Borsa Italiana",
                type: "index",
                link: "#",
                time: "10:00 AM"
            });
        } else {
            results.push({
                title: `Global Market Overview: Index Sector Context`,
                publisher: "Market Pulse",
                type: "market",
                link: "#",
                time: "10:00 AM"
            });
        }
    }

    // Simulate network delay for a "searching" feel
    await new Promise(resolve => setTimeout(resolve, 600));

    return NextResponse.json(results);
}
