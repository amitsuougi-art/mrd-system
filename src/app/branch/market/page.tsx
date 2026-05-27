"use client";

import { MOCK_L_SHIKIRI_CURVE, MOCK_TIBOR_SWAP_CURVE } from "@/lib/mock-market-data";
import { formatDateTime } from "@/lib/format";
import { YieldCurvePoint } from "@/types/market-data";
import { Activity, TrendingUp, Info } from "lucide-react";

// Maximum rate across both curves for bar scaling
const ALL_RATES = [
  ...MOCK_L_SHIKIRI_CURVE.points.map((p) => p.rate),
  ...MOCK_TIBOR_SWAP_CURVE.points.map((p) => p.rate),
];
const MAX_RATE = Math.max(...ALL_RATES);

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

interface CurveTableProps {
  title: string;
  subtitle: string;
  points: YieldCurvePoint[];
  accentColor?: string;
}

function CurveTable({ title, subtitle, points, accentColor = "#00c8ff" }: CurveTableProps) {
  return (
    <div
      className="flex-1 min-w-0 rounded-xl overflow-hidden"
      style={{
        background: "rgba(11,22,40,0.80)",
        border: "1px solid rgba(0,200,255,0.15)",
      }}
    >
      {/* Table header */}
      <div
        className="px-5 py-4"
        style={{ borderBottom: "1px solid rgba(0,200,255,0.10)" }}
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" style={{ color: accentColor }} />
          <h2 className="font-semibold text-slate-100 text-sm">{title}</h2>
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5 ml-6">{subtitle}</p>
      </div>

      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(0,200,255,0.08)" }}>
            <th className="text-left px-5 py-2.5 text-slate-400 text-xs uppercase tracking-wider font-medium">
              Tenor
            </th>
            <th className="text-right px-4 py-2.5 text-slate-400 text-xs uppercase tracking-wider font-medium">
              残存年数
            </th>
            <th className="text-right px-4 py-2.5 text-slate-400 text-xs uppercase tracking-wider font-medium">
              Bid Rate (%)
            </th>
            <th className="px-5 py-2.5 text-slate-400 text-xs uppercase tracking-wider font-medium hidden sm:table-cell">
              &nbsp;
            </th>
          </tr>
        </thead>
        <tbody>
          {points.map((pt, idx) => {
            const barWidth = Math.round((pt.rate / MAX_RATE) * 120);
            return (
              <tr
                key={pt.tenor}
                className="hover:bg-cyber-surface/40 transition-colors duration-100"
                style={{
                  borderBottom:
                    idx < points.length - 1
                      ? "1px solid rgba(0,200,255,0.07)"
                      : undefined,
                }}
              >
                {/* Tenor */}
                <td className="px-5 py-2.5 text-slate-200 text-sm font-medium">
                  {pt.tenor}
                </td>
                {/* Residual years */}
                <td className="px-4 py-2.5 text-right font-mono text-slate-400 text-xs">
                  {pt.tenorYears.toFixed(4)}Y
                </td>
                {/* Rate */}
                <td
                  className="px-4 py-2.5 text-right font-mono text-sm font-semibold"
                  style={{ color: accentColor }}
                >
                  {pt.rate.toFixed(5)}
                </td>
                {/* Mini bar */}
                <td className="px-5 py-2.5 hidden sm:table-cell">
                  <div className="flex items-center h-full">
                    <div
                      className="h-2 rounded-sm"
                      style={{
                        width: `${barWidth}px`,
                        background: `linear-gradient(90deg, ${accentColor}99, ${accentColor}cc)`,
                        boxShadow: `0 0 6px ${accentColor}44`,
                      }}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function MarketDataPage() {
  // Sample deal parameters for the info card
  const contractRate = 1.52091;
  const remainingYears = 3.068; // fixedEnd 2029-06-30 minus prepaymentDate 2026-06-05
  const tiborRate = interpolateRate(MOCK_TIBOR_SWAP_CURVE.points, remainingYears);
  const rateDiff = contractRate - tiborRate;

  const acquiredAt = MOCK_TIBOR_SWAP_CURVE.acquiredAt;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page title */}
      <div>
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-cyber-cyan" />
          <h1 className="text-2xl font-bold text-slate-100">
            市場データ確認 / 仕切レート照会
          </h1>
        </div>
        <p className="text-sm text-slate-500 mt-1 ml-9">
          データ取得日時：
          <span className="font-mono text-slate-400">{formatDateTime(acquiredAt)}</span>
          &nbsp;|&nbsp;Base Date：
          <span className="font-mono text-slate-400">{MOCK_TIBOR_SWAP_CURVE.baseDate}</span>
        </p>
      </div>

      {/* Curve tables — side by side on large screens */}
      <div className="flex flex-col lg:flex-row gap-4">
        <CurveTable
          title="L仕切カーブ（Bid）"
          subtitle={`全${MOCK_L_SHIKIRI_CURVE.points.length}テナー ／ curveType: ${MOCK_L_SHIKIRI_CURVE.curveType}`}
          points={MOCK_L_SHIKIRI_CURVE.points}
          accentColor="#00c8ff"
        />
        <CurveTable
          title="日本円TIBORスワップ（Bid）"
          subtitle={`全${MOCK_TIBOR_SWAP_CURVE.points.length}テナー ／ curveType: ${MOCK_TIBOR_SWAP_CURVE.curveType}`}
          points={MOCK_TIBOR_SWAP_CURVE.points}
          accentColor="#a78bfa"
        />
      </div>

      {/* Info card — sample deal rate derivation */}
      <div
        className="rounded-xl p-5"
        style={{
          background: "rgba(11,22,40,0.80)",
          border: "1px solid rgba(0,200,255,0.15)",
        }}
      >
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-cyber-cyan shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">
              適用レート参考例（サンプル案件）
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div
                className="rounded-lg px-4 py-3 text-center"
                style={{ background: "rgba(0,200,255,0.06)", border: "1px solid rgba(0,200,255,0.15)" }}
              >
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">約定金利</p>
                <p className="font-mono text-lg font-bold text-slate-100">
                  {contractRate.toFixed(5)}
                  <span className="text-xs text-slate-400 ml-0.5">%</span>
                </p>
                <p className="text-[10px] text-slate-600 mt-0.5">contractRate</p>
              </div>
              <div
                className="rounded-lg px-4 py-3 text-center"
                style={{ background: "rgba(11,22,40,0.80)", border: "1px solid rgba(0,200,255,0.10)" }}
              >
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">残存年数</p>
                <p className="font-mono text-lg font-bold text-slate-300">
                  {remainingYears.toFixed(3)}
                  <span className="text-xs text-slate-400 ml-0.5">Y</span>
                </p>
                <p className="text-[10px] text-slate-600 mt-0.5">3Y テナーバンド</p>
              </div>
              <div
                className="rounded-lg px-4 py-3 text-center"
                style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.20)" }}
              >
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">TIBOR補間レート</p>
                <p className="font-mono text-lg font-bold" style={{ color: "#a78bfa" }}>
                  {tiborRate.toFixed(5)}
                  <span className="text-xs text-slate-400 ml-0.5">%</span>
                </p>
                <p className="text-[10px] text-slate-600 mt-0.5">3Y〜5Y 線形補間</p>
              </div>
              <div
                className="rounded-lg px-4 py-3 text-center"
                style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.20)" }}
              >
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">金利差（A−B）</p>
                <p className="font-mono text-lg font-bold text-cyber-green">
                  {rateDiff.toFixed(5)}
                  <span className="text-xs text-slate-400 ml-0.5">%</span>
                </p>
                <p className="text-[10px] text-slate-600 mt-0.5">→ 手数料が発生</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-3">
              ※ 参考例：約定金利 {contractRate}%、繰上返済日 2026-06-05、固定期日 2029-06-30（残存 ≈ {remainingYears}Y）の場合、
              TIBORスワップ 3Y（0.55%）〜5Y（0.75%）を線形補間し再運用レート {tiborRate.toFixed(5)}% を算出。
              金利差 {rateDiff.toFixed(5)}% に元本・期間を乗じて PV 計算した結果が期限前弁済手数料となります。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
