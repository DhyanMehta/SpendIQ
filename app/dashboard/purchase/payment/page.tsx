"use client";

import { PageHeader, EmptyState } from "@/components/layout/page-components";
import { CreditCard } from "lucide-react";

export default function PaymentPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Track and manage vendor payments"
        actionLabel="Record Payment"
        onAction={() => console.log("Record payment")}
      />

      <EmptyState
        title="No payments recorded"
        description="Keep track of all payments made to vendors and suppliers for better cash flow management."
        actionLabel="Record First Payment"
        onAction={() => console.log("Record payment")}
        Icon={CreditCard}
      />
    </div>
  );
}
