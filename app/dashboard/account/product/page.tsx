"use client";

import { PageHeader, EmptyState } from "@/components/layout/page-components";
import { Package } from "lucide-react";

export default function ProductPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your product catalog and inventory"
        actionLabel="Add Product"
        onAction={() => console.log("Add product")}
      />

      <EmptyState
        title="No products yet"
        description="Create your product catalog by adding items you sell or purchase for your business."
        actionLabel="Add First Product"
        onAction={() => console.log("Add product")}
        Icon={Package}
      />
    </div>
  );
}
