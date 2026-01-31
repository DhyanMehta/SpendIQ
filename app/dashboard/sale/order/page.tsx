"use client";

import { PageHeader, EmptyState } from "@/components/layout/page-components";
import { ShoppingBag } from "lucide-react";

export default function SaleOrderPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sale Orders"
        description="Manage customer orders and quotations"
        actionLabel="New Sale Order"
        onAction={() => console.log("New sale order")}
      />

      <EmptyState
        title="No sale orders"
        description="Create quotations and sales orders to manage your customer orders and track revenue."
        actionLabel="Create First Order"
        onAction={() => console.log("New sale order")}
        Icon={ShoppingBag}
      />
    </div>
  );
}
