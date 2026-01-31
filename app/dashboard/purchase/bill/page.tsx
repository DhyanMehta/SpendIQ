"use client";

import { PageHeader, EmptyState } from "@/components/layout/page-components";
import { FileText } from "lucide-react";

export default function PurchaseBillPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Bills"
        description="Record and manage vendor bills and invoices"
        actionLabel="New Bill"
        onAction={() => console.log("New bill")}
      />

      <EmptyState
        title="No bills recorded"
        description="Register vendor bills to track your payables and manage what you owe to suppliers."
        actionLabel="Record First Bill"
        onAction={() => console.log("New bill")}
        Icon={FileText}
      />
    </div>
  );
}
