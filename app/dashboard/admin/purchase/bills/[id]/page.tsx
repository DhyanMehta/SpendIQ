"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { VendorBillForm } from "@/components/purchase/VendorBillForm";
import { billApi } from "@/lib/purchase/api-bills";
import { VendorBill } from "@/lib/purchase/types";

export default function VendorBillDetailPage() {
  const params = useParams();
  const [bill, setBill] = useState<VendorBill | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadBill(params.id as string);
    }
  }, [params.id]);

  const loadBill = async (id: string) => {
    try {
      const data = await billApi.getOne(id);
      setBill(data);
    } catch (error) {
      console.error("Failed to load bill:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <VendorBillForm initialData={bill} />
    </div>
  );
}
