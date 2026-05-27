"use client";

import { useRouter } from "next/navigation";
import { Zap, ArrowRight, AlertCircle } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { MOCK_USERS } from "@/lib/mock-data";

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useAppStore();

  const loginAsBranch = () => {
    const branchUser = MOCK_USERS.find((u) => u.role === "BRANCH_STAFF");
    setCurrentUser(branchUser || MOCK_USERS[0]);
    router.push("/branch/dashboard");
  };

  const loginAsHq = () => {
    const hqUser = MOCK_USERS.find((u) => u.role === "HQ_APPROVER");
    setCurrentUser(hqUser || MOCK_USERS[2]);
    router.push("/headquarters/dashboard");
  };

  return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center p-4" style={{ background: "radial-gradient(ellipse at 50% 30%, #0a1f3d 0%, #070d1a 60%)" }}>
      <div className="w-full max-w-md">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 mb-4" style={{ boxShadow: "0 0 24px rgba(0,200,255,0.2)" }}>
            <Zap className="h-8 w-8 text-cyber-cyan" />
          </div>
          <h1 className="text-2xl font-bold" style={{ background: "linear-gradient(90deg, #ffffff 0%, #00c8ff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            市場営業部 業務システム
          </h1>
          <p className="text-slate-400 text-sm mt-2">固定金利融資 仕切レート算出 / 期限前弁済手数料算出</p>
          <span className="inline-block mt-2 bg-cyber-amber/20 text-cyber-amber border border-cyber-amber/30 text-xs px-2 py-0.5 rounded">デモ版 v1.0</span>
        </div>

        {/* Card */}
        <div className="bg-cyber-card/80 backdrop-blur-sm border border-cyber-border/60 rounded-xl p-8" style={{ boxShadow: "0 0 40px rgba(0,200,255,0.05)" }}>
          <h2 className="text-base font-semibold text-slate-300 mb-6 text-center">システムへのログイン</h2>
          <div className="space-y-4">
            {/* Branch login button */}
            <button
              onClick={loginAsBranch}
              className="w-full flex items-center justify-between px-5 py-4 bg-cyber-cyan text-cyber-bg font-bold rounded-lg hover:brightness-110 transition-all group"
              style={{ boxShadow: "0 0 20px rgba(0,200,255,0.3)" }}
            >
              <div className="text-left">
                <div className="font-semibold">行内SSO でログイン</div>
                <div className="text-xs mt-0.5 opacity-70">営業店担当者（山田 太郎 / 横浜支店）</div>
              </div>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* HQ login button */}
            <button
              onClick={loginAsHq}
              className="w-full flex items-center justify-between px-5 py-4 border border-cyber-cyan/30 text-cyber-cyan bg-transparent hover:bg-cyber-cyan/10 rounded-lg transition-all group"
            >
              <div className="text-left">
                <div className="font-medium">本部担当者としてログイン</div>
                <div className="text-xs text-slate-500 mt-0.5">本部承認者（佐藤 花子）</div>
              </div>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Demo warning */}
          <div className="mt-6 p-3 bg-cyber-amber/10 border border-cyber-amber/20 rounded-lg flex gap-2">
            <AlertCircle className="h-4 w-4 text-cyber-amber/80 mt-0.5 shrink-0" />
            <p className="text-xs text-cyber-amber/80">
              これはデモアプリケーションです。実際の認証は行われません。計算ロジックは簡易版であり、実際の金融計算とは異なります。
            </p>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          © 2026 MILIZE株式会社 | 本番システムでは金融計算エンジンを使用
        </p>
      </div>
    </div>
  );
}
