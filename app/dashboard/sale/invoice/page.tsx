"use client";

import { PageHeader, EmptyState } from "@/components/layout/page-components";
import { Receipt as ReceiptIcon } from "lucide-react";

export default function SaleInvoicePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sale Invoices"
        description="Create and manage customer invoices"
        actionLabel="New Invoice"
        onAction={() => console.log("New invoice")}
      />

      <EmptyState
        title="No invoices created"
        description="Generate professional invoices for your customers and track your accounts receivable."
        actionLabel="Create First Invoice"
        onAction={() => console.log("New invoice")}
        Icon={ReceiptIcon}
      />
    </div>
  );
}
