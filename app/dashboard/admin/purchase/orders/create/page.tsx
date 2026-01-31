import { PurchaseOrderForm } from "@/components/purchase/PurchaseOrderForm";
import { Separator } from "@/components/ui/separator";

export default function CreatePurchaseOrderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Create Purchase Order</h3>
        <p className="text-sm text-muted-foreground">
          Create a new purchase order for a vendor.
        </p>
      </div>
      <Separator />
      <PurchaseOrderForm />
    </div>
  );
}
