"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { client as apiClient } from "@/lib/api/client";
import { toast } from "sonner";

interface AutoAnalyticalRule {
  id: string;
  name: string;
  partnerTagId?: string | null;
  partnerId?: string | null;
  productCategoryId?: string | null;
  productId?: string | null;
  analyticalAccountId: string;
}

interface AutoAnalyticalRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: AutoAnalyticalRule | null;
  onSuccess: () => void;
}

interface SelectOption {
  id: string;
  name: string;
  code?: string;
}

export function AutoAnalyticalRuleDialog({
  open,
  onOpenChange,
  rule,
  onSuccess,
}: AutoAnalyticalRuleDialogProps) {
  const [name, setName] = useState("");
  const [partnerTagId, setPartnerTagId] = useState<string>("");
  const [partnerId, setPartnerId] = useState<string>("");
  const [productCategoryId, setProductCategoryId] = useState<string>("");
  const [productId, setProductId] = useState<string>("");
  const [analyticalAccountId, setAnalyticalAccountId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Options for dropdowns
  const [partnerTags, setPartnerTags] = useState<SelectOption[]>([]);
  const [partners, setPartners] = useState<SelectOption[]>([]);
  const [productCategories, setProductCategories] = useState<SelectOption[]>(
    [],
  );
  const [products, setProducts] = useState<SelectOption[]>([]);
  const [analyticalAccounts, setAnalyticalAccounts] = useState<SelectOption[]>(
    [],
  );

  useEffect(() => {
    if (open) {
      fetchOptions();
    }
  }, [open]);

  useEffect(() => {
    if (rule) {
      setName(rule.name);
      setPartnerTagId(rule.partnerTagId || "none");
      setPartnerId(rule.partnerId || "none");
      setProductCategoryId(rule.productCategoryId || "none");
      setProductId(rule.productId || "none");
      setAnalyticalAccountId(rule.analyticalAccountId);
    } else {
      setName("");
      setPartnerTagId("none");
      setPartnerId("none");
      setProductCategoryId("none");
      setProductId("none");
      setAnalyticalAccountId("");
    }
  }, [rule, open]);

  const fetchOptions = async () => {
    try {
      const [tagsRes, partnersRes, categoriesRes, productsRes, accountsRes] =
        await Promise.all([
          apiClient.get("/partner-tags").catch(() => ({ data: [] })),
          apiClient.get("/partners").catch(() => ({ data: [] })),
          apiClient.get("/products/categories").catch(() => ({ data: [] })),
          apiClient.get("/products").catch(() => ({ data: [] })),
          apiClient.get("/analytical-accounts").catch(() => ({ data: [] })),
        ]);

      setPartnerTags(tagsRes.data);
      setPartners(partnersRes.data);
      setProductCategories(categoriesRes.data);
      setProducts(productsRes.data);
      setAnalyticalAccounts(
        accountsRes.data.filter(
          (a: { status: string }) => a.status !== "ARCHIVED",
        ),
      );
    } catch (error) {
      console.error("Failed to fetch options:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!analyticalAccountId) {
      toast.error("Analytical account is required");
      return;
    }

    if (
      (partnerTagId === "none" || !partnerTagId) &&
      (partnerId === "none" || !partnerId) &&
      (productCategoryId === "none" || !productCategoryId) &&
      (productId === "none" || !productId)
    ) {
      toast.error("At least one condition must be selected");
      return;
    }

    try {
      setLoading(true);

      const data = {
        name: name.trim(),
        partnerTagId: partnerTagId === "none" ? null : partnerTagId,
        partnerId: partnerId === "none" ? null : partnerId,
        productCategoryId:
          productCategoryId === "none" ? null : productCategoryId,
        productId: productId === "none" ? null : productId,
        analyticalAccountId,
      };

      if (rule) {
        await apiClient.patch(`/auto-analytical-rules/${rule.id}`, data);
        toast.success("Auto-analytical rule updated");
      } else {
        await apiClient.post("/auto-analytical-rules", data);
        toast.success("Auto-analytical rule created");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to save auto-analytical rule:", error);
      toast.error(
        error.response?.data?.message || "Failed to save auto-analytical rule",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {rule ? "Edit Auto-Analytical Rule" : "Create Auto-Analytical Rule"}
          </DialogTitle>
          <DialogDescription>
            {rule
              ? "Update the automation rule details"
              : "Create a rule to automatically assign analytical accounts based on transaction criteria"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Rule Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Marketing Expenses Auto-Distribution"
              disabled={loading}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="partnerTag">Partner Tag</Label>
              <Select
                value={partnerTagId}
                onValueChange={setPartnerTagId}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select partner tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {partnerTags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="partner">Partner</Label>
              <Select
                value={partnerId}
                onValueChange={setPartnerId}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select partner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {partners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productCategory">Product Category</Label>
              <Select
                value={productCategoryId}
                onValueChange={setProductCategoryId}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {productCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <Select
                value={productId}
                onValueChange={setProductId}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="analyticalAccount">Analytical Account *</Label>
            <Select
              value={analyticalAccountId}
              onValueChange={setAnalyticalAccountId}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select analytical account" />
              </SelectTrigger>
              <SelectContent>
                {analyticalAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.code!} - {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            * At least one condition (Partner Tag, Partner, Product Category, or
            Product) must be selected. Rules with more conditions have higher
            priority.
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : rule ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
