import VendorBillForm from "@/components/purchase/bill/VendorBillForm";

export default async function VendorBillFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ poId?: string }>;
}) {
  const { id } = await params;
  const { poId } = await searchParams;
  
  return <VendorBillForm id={id} poId={poId} />;
}
