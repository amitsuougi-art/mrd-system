export interface YieldCurvePoint {
  tenor: string;
  tenorYears: number;
  rate: number;
}

export interface YieldCurve {
  curveType: "OIS" | "TIBOR_SWAP" | "INTERNAL_OIS" | "L_SHIKIRI" | "S_SHIKIRI";
  side: "OFFER" | "BID" | "MID";
  baseDate: string;
  acquiredAt: string;
  points: YieldCurvePoint[];
}
