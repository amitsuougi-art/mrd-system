import { YieldCurve } from "@/types/market-data";

export const MOCK_L_SHIKIRI_CURVE: YieldCurve = {
  curveType: "L_SHIKIRI",
  side: "BID",
  baseDate: "2026-05-27",
  acquiredAt: new Date().toISOString(),
  points: [
    { tenor: "1M",   tenorYears: 0.0833, rate: 0.71 },
    { tenor: "2M",   tenorYears: 0.1667, rate: 0.75 },
    { tenor: "3M",   tenorYears: 0.25,   rate: 0.75 },
    { tenor: "6M",   tenorYears: 0.5,    rate: 0.75 },
    { tenor: "9M",   tenorYears: 0.75,   rate: 0.75 },
    { tenor: "1Y",   tenorYears: 1.0,    rate: 0.75 },
    { tenor: "1.5Y", tenorYears: 1.5,    rate: 1.65 },
    { tenor: "2Y",   tenorYears: 2.0,    rate: 1.79 },
    { tenor: "3Y",   tenorYears: 3.0,    rate: 2.02 },
    { tenor: "4Y",   tenorYears: 4.0,    rate: 2.19 },
    { tenor: "5Y",   tenorYears: 5.0,    rate: 2.33 },
    { tenor: "6Y",   tenorYears: 6.0,    rate: 2.46 },
    { tenor: "7Y",   tenorYears: 7.0,    rate: 2.57 },
    { tenor: "8Y",   tenorYears: 8.0,    rate: 2.68 },
    { tenor: "9Y",   tenorYears: 9.0,    rate: 2.78 },
    { tenor: "10Y",  tenorYears: 10.0,   rate: 2.89 },
  ],
};

export const MOCK_TIBOR_SWAP_CURVE: YieldCurve = {
  curveType: "TIBOR_SWAP",
  side: "BID",
  baseDate: "2026-05-27",
  acquiredAt: new Date().toISOString(),
  points: [
    { tenor: "1M",  tenorYears: 0.0833, rate: 0.89436 },
    { tenor: "3M",  tenorYears: 0.25,   rate: 1.23800 },
    { tenor: "6M",  tenorYears: 0.5,    rate: 1.36091 },
    { tenor: "1Y",  tenorYears: 1.0,    rate: 1.33091 },
    { tenor: "2Y",  tenorYears: 2.0,    rate: 1.45000 },
    { tenor: "3Y",  tenorYears: 3.0,    rate: 1.62000 },
    { tenor: "5Y",  tenorYears: 5.0,    rate: 1.85000 },
    { tenor: "7Y",  tenorYears: 7.0,    rate: 2.05000 },
    { tenor: "10Y", tenorYears: 10.0,   rate: 2.35000 },
  ],
};
