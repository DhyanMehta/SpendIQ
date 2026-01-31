import PaymentForm from "@/components/purchase/payment/PaymentForm";

export default async function PaymentFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  return <PaymentForm id={id} />;
}
