export function generateStaticParams() {
  // Include known mock deal IDs + placeholder for static export
  // Client-side navigation to dynamically created deals also works
  return [
    { dealId: "placeholder" },
    { dealId: "deal-001" },
    { dealId: "deal-002" },
    { dealId: "deal-003" },
    { dealId: "deal-004" },
    { dealId: "deal-005" },
  ];
}

export default function DealLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
