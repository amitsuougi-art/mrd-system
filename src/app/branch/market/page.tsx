"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import { MOCK_L_SHIKIRI_CURVE, MOCK_TIBOR_SWAP_CURVE } from "@/lib/mock-market-data";
import { formatDateTime } from "@/lib/format";
import { YieldCurvePoint } from "@/types/market-data";
import { Activity, TrendingUp, Info, Table2, BarChart2 } from "lucide-react";
import { useState } from "react";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function interpolateRate(points: YieldCurvePoint[], years: number): number {
  if (years <= points[0].tenorYears) return points[0].rate;
  if (years >= points[points.length - 1].tenorYears) return points[points.length - 1].rate;
  for (let i = 0; i < points.length - 1; i++) {
    if (years >= points[i].tenorYears && years <= points[i + 1].tenorYears) {
      const ratio =
        (years - points[i].tenorYears) /
        (points[i + 1].tenorYears - points[i].tenorYears);
      return points[i].rate + (points[i + 1].rate - points[i].rate) * ratio;
    }
  }
  return points[points.length - 1].rate;
}

// Build combined chart data (union of all tenors)
function buildChartData() {
  const tenorMap = new Map<number, { tenor: string; tenorYears: number; lShikiri?: number; tiborSwap?: number }>();
  MOCK_L_SHIKIRI_CURVE.points.forEach((p) => {
    tenorMap.set(p.tenorYears, { tenor: p.tenor, tenorYears: p.tenorYears, lShikiri: p.rate });
  });
  MOCK_TIBOR_SWAP_CURVE.points.forEach((p) => {
    const existing = tenorMap.get(p.tenorYears);
    if (existing) {
      existing.tiborSwap = p.rate;
    } else {
      tenorMap.set(p.tenorYears, { tenor: p.tenor, tenorYears: p.tenorYears, tiborSwap: p.rate });
    }
  });
  return Array.from(tenorMap.values()).sort((a, b) => a.tenorYears - b.tenorYears);
}

const CHART_DATA = buildChartData();
const CONTRACT_RATE = 1.52091;
const REMAINING_YEARS = 3.068;

// ─────────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────────
interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className="rounded-lg px-4 py-3 text-xs"
      style={{
        background: "rgba(8,15,30,0.95)",
        border: "1px solid rgba(0,200,255,0.25)",
        boxShadow: "0 0 16px rgba(0,200,255,0.15)",
      }}
    >
      <p className="font-semibold text-slate-200 mb-2">Tenor: {label}Y</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-2 mb-0.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-slate-400">{entry.name}:</span>
          <span className="font-mono font-semibold" style={{ color: entry.color }}>
            {entry.value.toFixed(5)}%
          </span>
        </p>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Curve table (compact)
// ─────────────────────────────────────────────
function CurveTable({
  title,
  points,
  accentColor = "#00c8ff",
}: {
  title: string;
  points: YieldCurvePoint[];
  accentColor?: string;
}) {
  const maxRate = Math.max(...points.map((p) => p.rate));
  return (
    <div className="flex-1 min-w-0">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 ml-1">
        {title}
      </h3>
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "rgba(11,22,40,0.80)",
          border: `1px solid rgba(0,200,255,0.12)`,
        }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(0,200,255,0.08)" }}>
              <th className="text-left px-4 py-2 text-slate-500 text-[10px] uppercase tracking-wider">Tenor</th>
              <th className="text-right px-4 py-2 text-slate-500 text-[10px] uppercase tracking-wider">年数</th>
              <th className="text-right px-4 py-2 text-slate-500 text-[10px] uppercase tracking-wider">Bid Rate (%)</th>
              <th className="px-4 py-2 hidden sm:table-cell" />
            </tr>
          </thead>
          <tbody>
            {points.map((pt, idx) => (
              <tr
                key={pt.tenor}
                className="hover:bg-white/[0.03] transition-colors"
                style={{ borderBottom: idx < points.length - 1 ? "1px solid rgba(0,200,255,0.06)" : undefined }}
              >
                <td className="px-4 py-2 text-slate-200 text-xs font-medium">{pt.tenor}</td>
                <td className="px-4 py-2 text-right font-mono text-slate-500 text-[11px]">{pt.tenorYears.toFixed(4)}</td>
                <td
                  className="px-4 py-2 text-right font-mono text-xs font-semibold"
                  style={{ color: accentColor }}
                >
                  {pt.rate.toFixed(5)}
                </td>
                <td className="px-4 py-2 hidden sm:table-cell">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${Math.round((pt.rate / maxRate) * 100)}px`,
                      background: `linear-gradient(90deg, ${accentColor}88, ${accentColor}cc)`,
                      boxShadow: `0 0 4px ${accentColor}44`,
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────
export default function MarketDataPage() {
  const [view, setView] = useState<"chart" | "table">("chart");

  const tiborRate = interpolateRate(MOCK_TIBOR_SWAP_CURVE.points, REMAINING_YEARS);
  const rateDiff = CONTRACT_RATE - tiborRate;
  const acquiredAt = MOCK_TIBOR_SWAP_CURVE.acquiredAt;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-cyber-cyan" />
            <h1 className="text-2xl font-bold text-slate-100">
              市場データ確認 / 仕切レート照会
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 ml-9">
            取得日時：
            <span className="font-mono text-slate-400">{formatDateTime(acquiredAt)}</span>
            &nbsp;|&nbsp;Base Date：
            <span className="font-mono text-slate-400">{MOCK_TIBOR_SWAP_CURVE.baseDate}</span>
          </p>
        </div>

        {/* View toggle */}
        <div
          className="flex items-center rounded-lg p-0.5 self-start sm:self-auto"
          style={{ background: "rgba(11,22,40,0.9)", border: "1px solid rgba(0,200,255,0.15)" }}
        >
          {(["chart", "table"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
              style={
                view === v
                  ? { background: "rgba(0,200,255,0.15)", color: "#00c8ff", boxShadow: "0 0 8px rgba(0,200,255,0.2)" }
                  : { color: "#64748b" }
              }
            >
              {v === "chart" ? <BarChart2 className="h-3.5 w-3.5" /> : <Table2 className="h-3.5 w-3.5" />}
              {v === "chart" ? "グラフ" : "テーブル"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chart view ── */}
      {view === "chart" && (
        <div
          className="rounded-xl p-6"
          style={{ background: "rgba(11,22,40,0.85)", border: "1px solid rgba(0,200,255,0.12)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-cyber-cyan" />
            <h2 className="text-sm font-semibold text-slate-200">イールドカーブ比較</h2>
          </div>
          <p className="text-[11px] text-slate-500 mb-6 ml-6">L仕切カーブ vs 日本円TIBORスワップ — Bid Rate (%)</p>

          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={CHART_DATA} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradL" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00c8ff" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#00c8ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradT" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(0,200,255,0.06)"
                vertical={false}
              />
              <XAxis
                dataKey="tenorYears"
                type="number"
                domain={[0, 10]}
                ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                tickFormatter={(v) => `${v}Y`}
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={{ stroke: "rgba(0,200,255,0.1)" }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 1.4]}
                tickFormatter={(v) => `${v.toFixed(2)}%`}
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={58}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(0,200,255,0.2)", strokeWidth: 1 }} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "#94a3b8", paddingTop: 12 }}
                formatter={(value) =>
                  value === "lShikiri" ? "L仕切カーブ" : "TIBORスワップ"
                }
              />

              {/* Contract rate reference line */}
              <ReferenceLine
                y={CONTRACT_RATE}
                stroke="rgba(251,191,36,0.6)"
                strokeDasharray="5 4"
                label={{
                  value: `約定金利 ${CONTRACT_RATE}%`,
                  position: "insideTopRight",
                  fill: "#fbbf24",
                  fontSize: 10,
                }}
              />

              {/* Remaining years reference line */}
              <ReferenceLine
                x={REMAINING_YEARS}
                stroke="rgba(255,255,255,0.15)"
                strokeDasharray="4 4"
                label={{
                  value: `残存 ${REMAINING_YEARS}Y`,
                  position: "top",
                  fill: "#94a3b8",
                  fontSize: 10,
                }}
              />

              <Area
                type="monotone"
                dataKey="lShikiri"
                name="lShikiri"
                stroke="#00c8ff"
                strokeWidth={2}
                fill="url(#gradL)"
                dot={{ fill: "#00c8ff", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#00c8ff", strokeWidth: 0 }}
                connectNulls
              />
              <Area
                type="monotone"
                dataKey="tiborSwap"
                name="tiborSwap"
                stroke="#a78bfa"
                strokeWidth={2}
                fill="url(#gradT)"
                dot={{ fill: "#a78bfa", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#a78bfa", strokeWidth: 0 }}
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Legend annotation */}
          <div className="flex flex-wrap gap-4 mt-4 ml-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-px w-8 bg-amber-400/60" style={{ borderTop: "2px dashed rgba(251,191,36,0.6)" }} />
              約定金利ライン
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-px w-8" style={{ borderTop: "2px dashed rgba(255,255,255,0.2)" }} />
              残存年数ライン（参考）
            </span>
          </div>
        </div>
      )}

      {/* ── Table view ── */}
      {view === "table" && (
        <div className="flex flex-col lg:flex-row gap-4">
          <CurveTable
            title="L仕切カーブ（Bid）"
            points={MOCK_L_SHIKIRI_CURVE.points}
            accentColor="#00c8ff"
          />
          <CurveTable
            title="日本円TIBORスワップ（Bid）"
            points={MOCK_TIBOR_SWAP_CURVE.points}
            accentColor="#a78bfa"
          />
        </div>
      )}

      {/* Info card */}
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "約定金利",
                  value: `${CONTRACT_RATE.toFixed(5)}%`,
                  sub: "contractRate",
                  color: "#00c8ff",
                  bg: "rgba(0,200,255,0.06)",
                  border: "rgba(0,200,255,0.18)",
                },
                {
                  label: "残存年数",
                  value: `${REMAINING_YEARS.toFixed(3)}Y`,
                  sub: "3Yテナーバンド",
                  color: "#94a3b8",
                  bg: "rgba(255,255,255,0.03)",
                  border: "rgba(0,200,255,0.10)",
                },
                {
                  label: "TIBOR補間レート",
                  value: `${tiborRate.toFixed(5)}%`,
                  sub: "3Y〜5Y 線形補間",
                  color: "#a78bfa",
                  bg: "rgba(167,139,250,0.06)",
                  border: "rgba(167,139,250,0.20)",
                },
                {
                  label: "金利差（A−B）",
                  value: `${rateDiff.toFixed(5)}%`,
                  sub: "→ 手数料が発生",
                  color: "#10b981",
                  bg: "rgba(16,185,129,0.06)",
                  border: "rgba(16,185,129,0.20)",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg px-4 py-3 text-center"
                  style={{ background: item.bg, border: `1px solid ${item.border}` }}
                >
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{item.label}</p>
                  <p
                    className="font-mono text-lg font-bold"
                    style={{ color: item.color }}
                  >
                    {item.value}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">{item.sub}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-600 mt-3">
              ※ 約定金利 {CONTRACT_RATE}%、繰上返済日 2026-06-05、固定期日 2029-06-30（残存 ≈ {REMAINING_YEARS}Y）の場合、
              TIBORスワップ 3Y（0.55%）〜5Y（0.75%）を線形補間し再運用レート {tiborRate.toFixed(5)}% を算出。
              金利差 {rateDiff.toFixed(5)}% に元本・期間を乗じて PV 計算した結果が期限前弁済手数料となります。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
