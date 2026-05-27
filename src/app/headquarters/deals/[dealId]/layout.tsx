export const dynamicParams = false;

export function generateStaticParams() {
  // Return placeholder for static export; actual routing handled client-side via zustand
  return [{ dealId: "placeholder" }];
}

export default function HQDealLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
