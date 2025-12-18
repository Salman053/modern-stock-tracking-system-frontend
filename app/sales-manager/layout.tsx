import SaleLayout from "@/components/sales/sale-layout";

export default function SalesManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SaleLayout>
    {children}
  </SaleLayout>

}
