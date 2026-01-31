"use client";

import { PageHeader, EmptyState } from "@/components/layout/page-components";
import { ShoppingCart } from "lucide-react";

export default function PurchaseOrderPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Manage purchase orders from your vendors"
        actionLabel="New Purchase Order"
        onAction={() => console.log("New purchase order")}
      />

      <EmptyState
        title="No purchase orders"
        description="Create purchase orders to track items you're buying from vendors and suppliers."
        actionLabel="Create First Order"
        onAction={() => console.log("New purchase order")}
        Icon={ShoppingCart}
      />
    </div>
  );
}
