"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PurchaseOrderForm } from "@/components/purchase/PurchaseOrderForm";
import { Separator } from "@/components/ui/separator";
import { purchaseApi } from "@/lib/purchase/api";
import { PurchaseOrder } from "@/lib/purchase/types";

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPo();
    }
  }, [id]);

  const loadPo = async () => {
    try {
      const data = await purchaseApi.getOne(id);
      setPo(data);
    } catch (error) {
      console.error("Failed to load PO", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!po) return <div>Purchase Order not found.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Purchase Order {po.poNumber}</h3>
        <p className="text-sm text-muted-foreground">
          View and manage purchase order details.
        </p>
      </div>
      <Separator />

      {/* Key is important to re-render form when initialData changes or resets */}
      <PurchaseOrderForm initialData={po} key={po.id} />
    </div>
  );
}
