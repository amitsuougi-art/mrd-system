/**
 * 【重要】デモ用の簡易計算ロジック
 * 本番システムでは MILIZE 社の金融計算エンジンを使用します。
 * このコードは画面動作確認・デモ提示のみを目的としています。
 */

import { DealInput, CalculationResult, CashFlowItem } from "@/types/deal";
import { YieldCurvePoint } from "@/types/market-data";
import { MOCK_L_SHIKIRI_CURVE, MOCK_TIBOR_SWAP_CURVE } from "./mock-market-data";

export function calculatePrepaymentFee(input: DealInput): CalculationResult {
  const { originalContract, prepayment } = input;

  const prepayDate = new Date(prepayment.prepaymentDate);
  const fixedEnd = new Date(originalContract.fixedEndDate);
  const remainingYears = (fixedEnd.getTime() - prepayDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

  const curve = remainingYears < 1 ? MOCK_L_SHIKIRI_CURVE : MOCK_TIBOR_SWAP_CURVE;
  const applicableRate = interpolateRate(curve.points, remainingYears);

  const cashflows: CashFlowItem[] = [];
  const monthsRemaining = Math.max(1, Math.floor(remainingYears * 12));
  const balance = prepayment.outstandingBalance;
  const contractRate = originalContract.contractRate / 100;
  const reinvestRate = applicableRate / 100;

  let sideATotal = 0;
  let sideBTotal = 0;
  let pvTotal = 0;

  for (let m = 1; m <= monthsRemaining; m++) {
    const t = m / 12;
    const interestA = (balance * contractRate) / 12;
    const interestB = (balance * reinvestRate) / 12;
    const diff = interestA - interestB;
    const discountFactor = 1 / Math.pow(1 + reinvestRate, t);
    const pv = diff * discountFactor;

    const date = new Date(prepayDate);
    date.setMonth(date.getMonth() + m);

    cashflows.push({
      sequence: m,
      cashflowType: "A_SIDE",
      cashflowDate: date.toISOString().split("T")[0],
      amount: Math.round(interestA),
      discountFactor: Number(discountFactor.toFixed(10)),
      presentValue: Math.round(pv),
      appliedRate: applicableRate,
    });

    sideATotal += interestA;
    sideBTotal += interestB;
    pvTotal += pv;
  }

  const prepaymentFee = Math.max(0, Math.round(pvTotal));

  return {
    prepaymentFee,
    sideATotal: Math.round(sideATotal),
    sideBTotal: Math.round(sideBTotal),
    pvAdjustedDiff: prepaymentFee,
    appliedCurveType: remainingYears < 1 ? "L仕切（Bid）" : "日本円TIBORスワップ（Bid）",
    appliedTenorBand: getTenorBandLabel(remainingYears),
    amountBandApplied: balance >= 300_000_000 ? "L仕切（3億円以上）" : "S仕切（3億円未満）",
    cashflows,
    aiCheckResult: {
      logicConsistency: { status: "OK", message: "キャッシュフロー合計と元本が一致" },
      marketDataValidity: { status: "OK", message: "取得カーブの値域は妥当範囲内" },
      similarDealComparison: prepaymentFee > 1_000_000
        ? { status: "WARN", message: "類似案件平均比 +18%（要確認）" }
        : { status: "OK", message: "類似案件と整合的" },
      anomalyDetection: { status: "OK", message: "異常値なし" },
    },
    calculatedAt: new Date().toISOString(),
    marketDataAcquiredAt: curve.acquiredAt,
    calculationEngineVersion: "v1.0.0-demo",
  };
}

function interpolateRate(points: YieldCurvePoint[], years: number): number {
  if (years <= points[0].tenorYears) return points[0].rate;
  if (years >= points[points.length - 1].tenorYears) return points[points.length - 1].rate;
  for (let i = 0; i < points.length - 1; i++) {
    if (years >= points[i].tenorYears && years <= points[i + 1].tenorYears) {
      const ratio = (years - points[i].tenorYears) / (points[i + 1].tenorYears - points[i].tenorYears);
      return points[i].rate + (points[i + 1].rate - points[i].rate) * ratio;
    }
  }
  return points[points.length - 1].rate;
}

export function getTenorBandLabel(years: number): string {
  if (years < 0.5) return "6M";
  if (years < 1) return "1Y";
  if (years < 2) return "2Y";
  if (years < 3) return "3Y";
  if (years < 5) return "5Y";
  if (years < 7) return "7Y";
  return "10Y";
}
