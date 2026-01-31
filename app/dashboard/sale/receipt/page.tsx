"use client";

import { PageHeader, EmptyState } from "@/components/layout/page-components";
import { Banknote } from "lucide-react";

export default function ReceiptPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Receipts"
        description="Manage customer payment receipts"
        actionLabel="Record Receipt"
        onAction={() => console.log("Record receipt")}
      />

      <EmptyState
        title="No receipts recorded"
        description="Track payments received from customers to manage your cash inflow and reconcile accounts."
        actionLabel="Record First Receipt"
        onAction={() => console.log("Record receipt")}
        Icon={Banknote}
      />
    </div>
  );
}
