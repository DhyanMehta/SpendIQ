"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-components";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Check, Archive } from "lucide-react";
import { client as apiClient } from "@/lib/api/client";
import { toast } from "sonner";
import { AutoAnalyticalRuleDialog } from "@/components/analytics/auto-analytical-rule-dialog";
import { DeleteConfirmDialog } from "@/components/analytics/delete-confirm-dialog";

interface AutoAnalyticalRule {
  id: string;
  name: string;
  status: "DRAFT" | "CONFIRMED" | "ARCHIVED";
  priority: number;
  partnerTagId?: string | null;
  partnerId?: string | null;
  productCategoryId?: string | null;
  productId?: string | null;
  analyticalAccountId: string;
  partnerTag?: { id: string; name: string } | null;
  partner?: { id: string; name: string } | null;
  productCategory?: { id: string; name: string } | null;
  product?: { id: string; name: string } | null;
  analyticalAccount: { id: string; code: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export default function AutoAnalyticPage() {
  const [rules, setRules] = useState<AutoAnalyticalRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AutoAnalyticalRule | null>(
    null,
  );
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/auto-analytical-rules");
      setRules(response.data);
    } catch (error) {
      console.error("Failed to fetch auto-analytical rules:", error);
      toast.error("Failed to load auto-analytical rules");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedRule(null);
    setDialogOpen(true);
  };

  const handleEdit = (rule: AutoAnalyticalRule) => {
    setSelectedRule(rule);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setRuleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!ruleToDelete) return;

    try {
      await apiClient.delete(`/auto-analytical-rules/${ruleToDelete}`);
      toast.success("Auto-analytical rule deleted");
      fetchRules();
    } catch (error: any) {
      console.error("Failed to delete auto-analytical rule:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to delete auto-analytical rule",
      );
    } finally {
      setDeleteDialogOpen(false);
      setRuleToDelete(null);
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await apiClient.post(`/auto-analytical-rules/${id}/confirm`);
      toast.success("Auto-analytical rule confirmed");
      fetchRules();
    } catch (error: any) {
      console.error("Failed to confirm auto-analytical rule:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to confirm auto-analytical rule",
      );
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await apiClient.post(`/auto-analytical-rules/${id}/archive`);
      toast.success("Auto-analytical rule archived");
      fetchRules();
    } catch (error: any) {
      console.error("Failed to archive auto-analytical rule:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to archive auto-analytical rule",
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="outline">Draft</Badge>;
      case "CONFIRMED":
        return <Badge variant="default">Confirmed</Badge>;
      case "ARCHIVED":
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getConditions = (rule: AutoAnalyticalRule) => {
    const conditions: string[] = [];
    if (rule.partnerTag) conditions.push(`Tag: ${rule.partnerTag.name}`);
    if (rule.partner) conditions.push(`Partner: ${rule.partner.name}`);
    if (rule.productCategory)
      conditions.push(`Category: ${rule.productCategory.name}`);
    if (rule.product) conditions.push(`Product: ${rule.product.name}`);
    return conditions.length > 0 ? conditions.join(", ") : "No conditions";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Auto Analytic Model"
        description="Automate analytical distribution with intelligent models based on predefined criteria"
        actionLabel="Create Model"
        onAction={handleCreate}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Conditions</TableHead>
              <TableHead>Analytical Account</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : rules.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No automation models found. Create your first one to
                  automatically distribute transactions.
                </TableCell>
              </TableRow>
            ) : (
              rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {getConditions(rule)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {rule.analyticalAccount.code} -{" "}
                      {rule.analyticalAccount.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{rule.priority}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(rule.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {rule.status === "DRAFT" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(rule)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleConfirm(rule.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(rule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {rule.status === "CONFIRMED" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleArchive(rule.id)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AutoAnalyticalRuleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        rule={selectedRule}
        onSuccess={fetchRules}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Auto-Analytical Rule"
        description="Are you sure you want to delete this automation rule? This action cannot be undone."
      />
    </div>
  );
}
