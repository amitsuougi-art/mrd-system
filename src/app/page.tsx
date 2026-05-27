"use client";

import { useRouter } from "next/navigation";
import { Building2, ArrowRight, AlertCircle } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { MOCK_USERS } from "@/lib/mock-data";

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useAppStore();

  const loginAsBranch = () => {
    const branchUser = MOCK_USERS.find((u) => u.role === "BRANCH_STAFF");
    setCurrentUser(branchUser || MOCK_USERS[0]);
    router.push("/mrd-system/branch/dashboard");
  };

  const loginAsHq = () => {
    const hqUser = MOCK_USERS.find((u) => u.role === "HQ_APPROVER");
    setCurrentUser(hqUser || MOCK_USERS[2]);
    router.push("/mrd-system/headquarters/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bank-primary to-bank-primary-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/20 mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">市場営業部 業務システム</h1>
          <p className="text-blue-200 text-sm mt-2">固定金利融資 仕切レート算出 / 期限前弁済手数料算出</p>
          <span className="inline-block mt-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded">デモ版 v1.0</span>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 text-center">システムへのログイン</h2>

          <div className="space-y-4">
            {/* Branch Login */}
            <button
              onClick={loginAsBranch}
              className="w-full flex items-center justify-between px-5 py-4 bg-bank-primary text-white rounded-lg hover:bg-bank-primary-light transition-colors group"
            >
              <div className="text-left">
                <div className="font-medium">行内SSO でログイン</div>
                <div className="text-xs text-blue-200 mt-0.5">営業店担当者（山田 太郎 / 横浜支店）</div>
              </div>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* HQ Login */}
            <button
              onClick={loginAsHq}
              className="w-full flex items-center justify-between px-5 py-4 bg-white border-2 border-bank-primary text-bank-primary rounded-lg hover:bg-blue-50 transition-colors group"
            >
              <div className="text-left">
                <div className="font-medium">本部担当者としてログイン</div>
                <div className="text-xs text-gray-500 mt-0.5">本部承認者（佐藤 花子）</div>
              </div>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Info box */}
          <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700">
              これはデモアプリケーションです。実際の認証は行われません。計算ロジックは簡易版であり、実際の金融計算とは異なります。
            </p>
          </div>
        </div>

        <p className="text-center text-blue-200 text-xs mt-6">
          © 2026 MILIZE株式会社 | 本番システムでは金融計算エンジンを使用
        </p>
      </div>
    </div>
  );
}
