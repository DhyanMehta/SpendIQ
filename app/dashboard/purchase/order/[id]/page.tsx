import PurchaseOrderForm from "@/components/purchase/PurchaseOrderForm";

export default async function PurchaseOrderFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PurchaseOrderForm id={id} />;
}
