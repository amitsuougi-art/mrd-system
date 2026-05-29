"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight, AlertCircle, User } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { MOCK_USERS } from "@/lib/mock-data";

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useAppStore();
  const [name, setName] = useState("");

  const handleLogin = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    // 山田太郎 → 営業店
    const branchUser = MOCK_USERS.find((u) => u.role === "BRANCH_STAFF");
    if (trimmed === "山田太郎" || trimmed === "山田 太郎") {
      setCurrentUser(branchUser ?? MOCK_USERS[0]);
      router.push("/branch/dashboard");
      return;
    }

    // 既存ユーザーに一致する場合はそのユーザーを使う
    const matched = MOCK_USERS.find((u) => u.name === trimmed || u.name.replace(" ", "") === trimmed);
    if (matched) {
      setCurrentUser(matched);
      router.push("/headquarters/dashboard");
      return;
    }

    // それ以外 → 本部担当者として動的生成
    setCurrentUser({
      userId: `u-${Date.now()}`,
      employeeNo: "99999999",
      name: trimmed,
      email: `${trimmed}@bank.example.jp`,
      role: "HQ_APPROVER",
      branchCode: null,
      branchName: null,
    });
    router.push("/headquarters/dashboard");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "radial-gradient(ellipse at 50% 30%, #0a1f3d 0%, #070d1a 60%)" }}
    >
      <div className="w-full max-w-md">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center h-16 w-16 rounded-full mb-4"
            style={{ background: "rgba(0,200,255,0.1)", border: "1px solid rgba(0,200,255,0.3)", boxShadow: "0 0 24px rgba(0,200,255,0.2)" }}
          >
            <Zap className="h-8 w-8 text-cyber-cyan" />
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ background: "linear-gradient(90deg, #ffffff 0%, #00c8ff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            市場営業部 業務システム
          </h1>
          <p className="text-slate-400 text-sm mt-2">固定金利融資 / 期限前弁済手数料算出</p>
          <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}>
            デモ版 v1.0
          </span>
        </div>

        {/* ログインカード */}
        <div
          className="rounded-xl p-8"
          style={{ background: "rgba(13,31,54,0.85)", border: "1px solid rgba(0,200,255,0.15)", boxShadow: "0 0 40px rgba(0,200,255,0.06)" }}
        >
          <h2 className="text-base font-semibold text-slate-300 mb-6 text-center">お名前を入力してください</h2>

          {/* 名前入力 */}
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="例：山田太郎"
                className="w-full pl-10 pr-4 py-3 rounded-lg text-slate-200 placeholder-slate-600 text-sm outline-none transition-all"
                style={{
                  background: "rgba(11,22,40,0.8)",
                  border: "1px solid rgba(0,200,255,0.2)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(0,200,255,0.6)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(0,200,255,0.2)")}
                autoFocus
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={!name.trim()}
              className="w-full flex items-center justify-between px-5 py-4 rounded-lg font-semibold text-sm transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: name.trim() ? "#00c8ff" : "rgba(0,200,255,0.3)",
                color: "#070d1a",
                boxShadow: name.trim() ? "0 0 20px rgba(0,200,255,0.3)" : "none",
              }}
            >
              <span>ログイン</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* ヒント */}
          <div className="mt-5 space-y-2">
            <p className="text-[11px] text-slate-600 text-center">
              ※ 山田太郎 → 営業店（申込）　／　それ以外 → 本部（承認）
            </p>
          </div>

          {/* デモ注意 */}
          <div
            className="mt-5 p-3 rounded-lg flex gap-2"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.18)" }}
          >
            <AlertCircle className="h-4 w-4 text-amber-400/80 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-400/80">
              デモアプリケーションです。実際の認証は行われません。
            </p>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          © 2026 MILIZE株式会社 | 本番システムでは行内SSOを使用
        </p>
      </div>
    </div>
  );
}
