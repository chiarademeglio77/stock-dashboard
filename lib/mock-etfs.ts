export interface ETF {
    id: string;
    name: string;
    description: string;
    price: number;
    previousPrice: number;
    changePercent: number;
    ytdChange: number;
    startOfYearPrice: number;
    sector?: string;
    region?: string;
}

export const MOCK_ETFS: ETF[] = [
    { id: "A2A.MI", name: "A2A", description: "Life is energy - Italian utility company.", price: 1.82, previousPrice: 1.80, changePercent: 1.11, ytdChange: 5.2, startOfYearPrice: 1.73, sector: "Utilities", region: "Italy" },
    { id: "AMP.MI", name: "Amplifon", description: "Global leader in hearing care solutions.", price: 32.45, previousPrice: 32.10, changePercent: 1.09, ytdChange: 4.8, startOfYearPrice: 30.96, sector: "Healthcare", region: "Italy" },
    { id: "AZM.MI", name: "Azimut Holding", description: "Leading independent asset management group.", price: 24.12, previousPrice: 24.35, changePercent: -0.94, ytdChange: 6.1, startOfYearPrice: 22.73, sector: "Financials", region: "Italy" },
    { id: "BMED.MI", name: "Banca Mediolanum", description: "Multi-channel bank and asset manager.", price: 10.15, previousPrice: 10.05, changePercent: 0.99, ytdChange: 6.5, startOfYearPrice: 9.53, sector: "Financials", region: "Italy" },
    { id: "BMPS.MI", name: "Banca Monte dei Paschi di Siena", description: "The oldest surviving bank in the world.", price: 4.85, previousPrice: 4.70, changePercent: 3.19, ytdChange: 29.9, startOfYearPrice: 3.73, sector: "Financials", region: "Italy" },
    { id: "BAMI.MI", name: "Banco BPM", description: "Large Italian commercial banking group.", price: 6.12, previousPrice: 6.05, changePercent: 1.16, ytdChange: 30.1, startOfYearPrice: 4.70, sector: "Financials", region: "Italy" },
    { id: "BPE.MI", name: "BPER Banca", description: "Regional banking group with nationwide presence.", price: 4.35, previousPrice: 4.30, changePercent: 1.16, ytdChange: 25.5, startOfYearPrice: 3.47, sector: "Financials", region: "Italy" },
    { id: "BPSO.MI", name: "Banca Popolare di Sondrio", description: "Cooperative commercial bank based in Sondrio.", price: 7.12, previousPrice: 7.05, changePercent: 0.99, ytdChange: 2.3, startOfYearPrice: 6.96, sector: "Financials", region: "Italy" },
    { id: "BC.MI", name: "Brunello Cucinelli", description: "Luxury fashion brand specializing in cashmere.", price: 98.40, previousPrice: 97.50, changePercent: 0.92, ytdChange: 5.2, startOfYearPrice: 93.54, sector: "Consumer Cyclical", region: "Italy" },
    { id: "BZU.MI", name: "Buzzi", description: "International group focused on cement and concrete.", price: 34.12, previousPrice: 33.80, changePercent: 0.95, ytdChange: 6.7, startOfYearPrice: 31.98, sector: "Basic Materials", region: "Italy" },
    { id: "CPR.MI", name: "Campari", description: "Global player in the premium spirits industry.", price: 9.45, previousPrice: 9.40, changePercent: 0.53, ytdChange: 4.9, startOfYearPrice: 9.01, sector: "Consumer Defensive", region: "Italy" },
    { id: "DIA.MI", name: "DiaSorin", description: "Leader in the field of immunodiagnostics.", price: 92.15, previousPrice: 91.80, changePercent: 0.38, ytdChange: 2.3, startOfYearPrice: 90.08, sector: "Healthcare", region: "Italy" },
    { id: "ENEL.MI", name: "Enel", description: "Global leader in renewable energy and distribution.", price: 6.12, previousPrice: 6.05, changePercent: 1.16, ytdChange: 10.83, startOfYearPrice: 5.52, sector: "Utilities", region: "Italy" },
    { id: "ENI.MI", name: "Eni", description: "Global energy company engaged in exploration and production.", price: 14.35, previousPrice: 14.10, changePercent: 1.77, ytdChange: 5.09, startOfYearPrice: 13.66, sector: "Energy", region: "Italy" },
    { id: "RACE.MI", name: "Ferrari", description: "Legendary luxury sports car manufacturer.", price: 385.40, previousPrice: 380.10, changePercent: 1.39, ytdChange: 5.97, startOfYearPrice: 363.69, sector: "Consumer Cyclical", region: "Italy" },
    { id: "FCT.MI", name: "Fincantieri", description: "One of the world's largest shipbuilding groups.", price: 0.85, previousPrice: 0.84, changePercent: 1.19, ytdChange: 2.4, startOfYearPrice: 0.83, sector: "Industrials", region: "Italy" },
    { id: "FBK.MI", name: "FinecoBank", description: "Direct multichannel bank in Italy.", price: 14.12, previousPrice: 14.25, changePercent: -0.91, ytdChange: 21.4, startOfYearPrice: 11.63, sector: "Financials", region: "Italy" },
    { id: "G.MI", name: "Generali", description: "One of the largest global insurance providers.", price: 22.40, previousPrice: 22.15, changePercent: 1.13, ytdChange: 5.44, startOfYearPrice: 21.24, sector: "Financials", region: "Italy" },
    { id: "HER.MI", name: "Hera", description: "Multi-utility company involved in environment and energy.", price: 3.12, previousPrice: 3.08, changePercent: 1.30, ytdChange: 4.9, startOfYearPrice: 2.97, sector: "Utilities", region: "Italy" },
    { id: "ISP.MI", name: "Intesa Sanpaolo", description: "Major bank with a leadership in Italy.", price: 3.42, previousPrice: 3.38, changePercent: 1.18, ytdChange: 14.29, startOfYearPrice: 2.99, sector: "Financials", region: "Italy" },
    { id: "INW.MI", name: "Inwit", description: "Leader in telecommunications infrastructure in Italy.", price: 10.45, previousPrice: 10.30, changePercent: 1.46, ytdChange: 3.9, startOfYearPrice: 10.06, sector: "Real Estate", region: "Italy" },
    { id: "IG.MI", name: "Italgas", description: "Leader in the natural gas distribution sector in Italy.", price: 5.12, previousPrice: 5.05, changePercent: 1.39, ytdChange: 9.2, startOfYearPrice: 4.69, sector: "Utilities", region: "Italy" },
    { id: "IVG.MI", name: "Iveco Group", description: "Global leader in commercial and specialty vehicles.", price: 11.15, previousPrice: 11.05, changePercent: 0.90, ytdChange: 5.6, startOfYearPrice: 10.56, sector: "Industrials", region: "Italy" },
    { id: "LDO.MI", name: "Leonardo", description: "Global player in Aerospace, Defence and Security.", price: 22.15, previousPrice: 21.80, changePercent: 1.61, ytdChange: 31.1, startOfYearPrice: 16.90, sector: "Industrials", region: "Italy" },
    { id: "LTMC.MI", name: "Lottomatica", description: "The leading Italian group in the legal gaming market.", price: 11.45, previousPrice: 11.30, changePercent: 1.33, ytdChange: 8.7, startOfYearPrice: 10.53, sector: "Consumer Cyclical", region: "Italy" },
    { id: "MB.MI", name: "Mediobanca", description: "Prestigious Italian investment bank.", price: 13.12, previousPrice: 13.25, changePercent: -0.98, ytdChange: 3.1, startOfYearPrice: 12.73, sector: "Financials", region: "Italy" },
    { id: "MONC.MI", name: "Moncler", description: "Luxury fashion house specialized in down jackets.", price: 62.15, previousPrice: 61.80, changePercent: 0.57, ytdChange: 19.4, startOfYearPrice: 52.05, sector: "Consumer Cyclical", region: "Italy" },
    { id: "NEXI.MI", name: "Nexi", description: "The PayTech company in Europe.", price: 6.85, previousPrice: 6.90, changePercent: -0.72, ytdChange: 3.4, startOfYearPrice: 6.62, sector: "Technology", region: "Italy" },
    { id: "PST.MI", name: "Poste Italiane", description: "Italy's largest service distribution network.", price: 11.40, previousPrice: 11.25, changePercent: 1.33, ytdChange: 15.4, startOfYearPrice: 9.88, sector: "Financials", region: "Italy" },
    { id: "PRY.MI", name: "Prysmian", description: "World leader in the energy and telecom cables industry.", price: 52.15, previousPrice: 51.50, changePercent: 1.26, ytdChange: 3.89, startOfYearPrice: 50.20, sector: "Industrials", region: "Italy" },
    { id: "REC.MI", name: "Recordati", description: "International pharmaceutical group.", price: 50.12, previousPrice: 50.45, changePercent: -0.65, ytdChange: 8.3, startOfYearPrice: 46.28, sector: "Healthcare", region: "Italy" },
    { id: "SPM.MI", name: "Saipem", description: "Global leader in engineering and drilling services.", price: 1.85, previousPrice: 1.80, changePercent: 2.78, ytdChange: 4.9, startOfYearPrice: 1.76, sector: "Energy", region: "Italy" },
    { id: "SRG.MI", name: "Snam", description: "Operator of one of the largest gas transit systems.", price: 4.85, previousPrice: 4.80, changePercent: 1.04, ytdChange: 18.2, startOfYearPrice: 4.10, sector: "Utilities", region: "Italy" },
    { id: "STLAM.MI", name: "Stellantis", description: "Global automotive group (Fiat, Peugeot, Chrysler).", price: 14.72, previousPrice: 14.85, changePercent: -0.87, ytdChange: -33.2, startOfYearPrice: 22.04, sector: "Consumer Cyclical", region: "Italy" },
    { id: "STM.MI", name: "STMicroelectronics", description: "Global semiconductor leader.", price: 21.45, previousPrice: 21.80, changePercent: -1.6, ytdChange: -37.5, startOfYearPrice: 34.35, sector: "Technology", region: "Italy" },
    { id: "TIT.MI", name: "Telecom Italia", description: "Main telecommunications group in Italy.", price: 0.18, previousPrice: 0.185, changePercent: -2.7, ytdChange: -30.0, startOfYearPrice: 0.257, sector: "Communication Services", region: "Italy" },
    { id: "TEN.MI", name: "Tenaris", description: "Supplier of steel pipes for the energy industry.", price: 16.45, previousPrice: 16.20, changePercent: 1.54, ytdChange: 9.0, startOfYearPrice: 15.09, sector: "Energy", region: "Italy" },
    { id: "TRN.MI", name: "Terna", description: "Manager of the Italian national electricity grid.", price: 7.45, previousPrice: 7.38, changePercent: 0.95, ytdChange: 2.00, startOfYearPrice: 7.30, sector: "Utilities", region: "Italy" },
    { id: "UCG.MI", name: "UniCredit", description: "Major European commercial bank.", price: 36.48, previousPrice: 36.12, changePercent: 0.99, ytdChange: 114.22, startOfYearPrice: 29.61, sector: "Financials", region: "Italy" },
    { id: "UNI.MI", name: "Unipol", description: "Leading insurance group in Italy.", price: 7.45, previousPrice: 7.30, changePercent: 2.05, ytdChange: 12.2, startOfYearPrice: 6.64, sector: "Financials", region: "Italy" },
];
