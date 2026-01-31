"use client";

import ProductForm from "@/components/products/ProductForm";
import { useProduct } from "@/lib/hooks/useProducts";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return <ProductForm id={id} initialData={product} />;
}
