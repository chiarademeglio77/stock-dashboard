export interface ETF {
    id: string;
    name: string;
    description: string;
    price: number;
    previousPrice: number;
    changePercent: number;
    ytdChange: number;
    startOfYearPrice: number;
}

export const MOCK_ETFS: ETF[] = [
    {
        id: "ETFMIB",
        name: "iShares FTSE MIB UCITS ETF",
        description: "Tracks the FTSE MIB, the main Italian stock market index.",
        price: 28.45,
        previousPrice: 28.10,
        changePercent: 1.25,
        ytdChange: 4.80,
        startOfYearPrice: 27.15,
    },
    {
        id: "XBKA",
        name: "Xtrackers MSCI Europe Banks ETF",
        description: "Exposure to European banking sector including major Italian banks.",
        price: 14.72,
        previousPrice: 14.88,
        changePercent: -1.08,
        ytdChange: 8.20,
        startOfYearPrice: 13.60,
    },
    {
        id: "IENY",
        name: "iShares Oil & Gas Exploration ETF",
        description: "Covers oil & gas exploration companies, including ENI.",
        price: 21.30,
        previousPrice: 21.05,
        changePercent: 1.19,
        ytdChange: -2.10,
        startOfYearPrice: 21.76,
    },
    {
        id: "VEUR",
        name: "Vanguard FTSE Developed Europe ETF",
        description: "Broad European market exposure including Italian equities.",
        price: 38.90,
        previousPrice: 38.55,
        changePercent: 0.91,
        ytdChange: 6.50,
        startOfYearPrice: 36.53,
    },
    {
        id: "IITB",
        name: "Lyxor Italy Government Bond ETF",
        description: "Tracks Italian government bonds (BTP), fixed income exposure.",
        price: 102.40,
        previousPrice: 103.10,
        changePercent: -0.68,
        ytdChange: -1.30,
        startOfYearPrice: 103.75,
    },
    { id: "SWDA", name: "iShares MSCI World UCITS ETF", description: "Global equity exposure across developed markets.", price: 82.15, previousPrice: 81.90, changePercent: 0.31, ytdChange: 7.20, startOfYearPrice: 76.63 },
    { id: "EUEG", name: "iShares Core MSCI Europe ETF", description: "Large and mid-cap European stocks.", price: 31.45, previousPrice: 31.60, changePercent: -0.47, ytdChange: 5.10, startOfYearPrice: 29.92 },
    { id: "VUSA", name: "Vanguard S&P 500 UCITS ETF", description: "Top 500 US companies exposure.", price: 94.20, previousPrice: 93.85, changePercent: 0.37, ytdChange: 12.50, startOfYearPrice: 83.73 },
    { id: "CNX1", name: "iShares NASDAQ 100 UCITS ETF", description: "Tech-heavy index exposure.", price: 812.40, previousPrice: 805.10, changePercent: 0.91, ytdChange: 15.80, startOfYearPrice: 701.55 },
    { id: "CPXJ", name: "Amundi MSCI Emerging Markets", description: "Exposure to high-growth emerging economies.", price: 4.85, previousPrice: 4.88, changePercent: -0.61, ytdChange: 2.30, startOfYearPrice: 4.74 },
    { id: "IDRE", name: "iShares European Property Yield", description: "Listed real estate companies in Europe.", price: 24.12, previousPrice: 24.35, changePercent: -0.94, ytdChange: -4.20, startOfYearPrice: 25.18 },
    { id: "IUKP", name: "iShares UK Property UCITS ETF", description: "UK real estate sector focus.", price: 5.62, previousPrice: 5.65, changePercent: -0.53, ytdChange: -1.80, startOfYearPrice: 5.72 },
    { id: "PHAU", name: "WisdomTree Physical Gold", description: "Physically backed gold exposure.", price: 188.40, previousPrice: 187.10, changePercent: 0.69, ytdChange: 10.40, startOfYearPrice: 170.65 },
    { id: "CRUD", name: "WisdomTree WTI Crude Oil", description: "Exposure to West Texas Intermediate oil prices.", price: 8.42, previousPrice: 8.55, changePercent: -1.52, ytdChange: -8.50, startOfYearPrice: 9.20 },
    { id: "EGIN", name: "iShares Global Infrastructure", description: "Global utilities, transport, and energy infrastructure.", price: 29.80, previousPrice: 29.65, changePercent: 0.51, ytdChange: 3.40, startOfYearPrice: 28.82 },
    { id: "WREA", name: "iShares World Real Estate", description: "Global diversified real estate companies.", price: 19.45, previousPrice: 19.30, changePercent: 0.78, ytdChange: 1.10, startOfYearPrice: 19.24 },
    { id: "RBOT", name: "iShares Automation & Robotics", description: "Companies focused on robotics and AI.", price: 11.25, previousPrice: 11.10, changePercent: 1.35, ytdChange: 18.20, startOfYearPrice: 9.52 },
    { id: "HEAL", name: "iShares Healthcare Innovation", description: "Global medical and biotech innovators.", price: 6.85, previousPrice: 6.90, changePercent: -0.72, ytdChange: 4.50, startOfYearPrice: 6.55 },
    { id: "SEML", name: "VanEck Semiconductor UCITS ETF", description: "Focus on chip manufacturers and designers.", price: 28.40, previousPrice: 27.90, changePercent: 1.79, ytdChange: 28.50, startOfYearPrice: 22.10 },
    { id: "GREC", name: "Global X MSCI Greece ETF", description: "Pure-play exposure to Greek equities.", price: 34.12, previousPrice: 33.85, changePercent: 0.80, ytdChange: 12.30, startOfYearPrice: 30.38 },
    { id: "INRG", name: "iShares Global Clean Energy", description: "Focus on global renewable energy companies.", price: 8.15, previousPrice: 8.30, changePercent: -1.81, ytdChange: -12.40, startOfYearPrice: 9.30 },
    { id: "IQQP", name: "iShares Asia Pacific Property", description: "Listed property in developed Asia-Pacific.", price: 16.45, previousPrice: 16.60, changePercent: -0.90, ytdChange: -2.50, startOfYearPrice: 16.87 },
    { id: "SILV", name: "WisdomTree Physical Silver", description: "Physically backed silver exposure.", price: 22.15, previousPrice: 21.80, changePercent: 1.61, ytdChange: 14.20, startOfYearPrice: 19.40 },
    { id: "WTRE", name: "WisdomTree Physical Brent Oil", description: "Exposure to Brent crude oil prices.", price: 78.40, previousPrice: 79.20, changePercent: -1.01, ytdChange: -5.40, startOfYearPrice: 82.87 },
    { id: "IWRD", name: "iShares MSCI World Dist UCITS", description: "Broad world market with dividend focus.", price: 74.50, previousPrice: 74.20, changePercent: 0.40, ytdChange: 6.80, startOfYearPrice: 69.75 },
    { id: "EMSR", name: "iShares MSCI EM SRI UCITS", description: "Socially responsible emerging markets.", price: 5.12, previousPrice: 5.15, changePercent: -0.58, ytdChange: 3.10, startOfYearPrice: 4.97 },
];
