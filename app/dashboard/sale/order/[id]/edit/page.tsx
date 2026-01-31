import SalesOrderForm from "@/components/sale/SalesOrderForm";

export default async function EditSalesOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SalesOrderForm id={id} />;
}
