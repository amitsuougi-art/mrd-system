export function generateStaticParams() {
  return [
    { dealId: "placeholder" },
    { dealId: "deal-001" },
    { dealId: "deal-002" },
    { dealId: "deal-003" },
    { dealId: "deal-004" },
    { dealId: "deal-005" },
  ];
}

export default function HQDealLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
