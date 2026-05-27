"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface PageProps {
  params: { dealId: string };
}

export default function DealDetailPage({ params }: PageProps) {
  const router = useRouter();
  useEffect(() => {
    router.push(`/mrd-system/branch/deals/${params.dealId}/result`);
  }, [params.dealId, router]);
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-400">読み込み中...</div>
    </div>
  );
}
