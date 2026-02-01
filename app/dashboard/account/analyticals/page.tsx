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
import { Plus, Pencil, Trash2, Check, Archive } from "lucide-react";
import { client as apiClient } from "@/lib/api/client";
import { toast } from "sonner";
import { AnalyticalAccountDialog } from "@/components/analytics/analytical-account-dialog";
import { DeleteConfirmDialog } from "@/components/analytics/delete-confirm-dialog";

interface AnalyticalAccount {
  id: string;
  code: string;
  name: string;
  status: "DRAFT" | "CONFIRMED" | "ARCHIVED";
  parentId?: string | null;
  parent?: {
    id: string;
    code: string;
    name: string;
  } | null;
  children?: AnalyticalAccount[];
  createdAt: string;
  updatedAt: string;
}

export default function AnalyticalsPage() {
  const [accounts, setAccounts] = useState<AnalyticalAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] =
    useState<AnalyticalAccount | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/analytical-accounts");
      setAccounts(response.data);
    } catch (error) {
      console.error("Failed to fetch analytical accounts:", error);
      toast.error("Failed to load analytical accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedAccount(null);
    setDialogOpen(true);
  };

  const handleEdit = (account: AnalyticalAccount) => {
    setSelectedAccount(account);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setAccountToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!accountToDelete) return;

    try {
      await apiClient.delete(`/analytical-accounts/${accountToDelete}`);
      toast.success("Analytical account deleted");
      fetchAccounts();
    } catch (error: any) {
      console.error("Failed to delete analytical account:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete analytical account",
      );
    } finally {
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await apiClient.post(`/analytical-accounts/${id}/confirm`);
      toast.success("Analytical account confirmed");
      fetchAccounts();
    } catch (error: any) {
      console.error("Failed to confirm analytical account:", error);
      toast.error(
        error.response?.data?.message || "Failed to confirm analytical account",
      );
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await apiClient.post(`/analytical-accounts/${id}/archive`);
      toast.success("Analytical account archived");
      fetchAccounts();
    } catch (error: any) {
      console.error("Failed to archive analytical account:", error);
      toast.error(
        error.response?.data?.message || "Failed to archive analytical account",
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytical Accounts"
        description="Configure analytical dimensions for detailed financial tracking across departments, projects, or custom categories"
        actionLabel="Add Analytical Account"
        onAction={handleCreate}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : accounts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No analytical accounts found. Create your first one to get
                  started.
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.code}</TableCell>
                  <TableCell>{account.name}</TableCell>
                  <TableCell>
                    {account.parent ? (
                      <span className="text-sm text-muted-foreground">
                        {account.parent.code} - {account.parent.name}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(account.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {account.status === "DRAFT" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(account)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleConfirm(account.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(account.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {account.status === "CONFIRMED" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleArchive(account.id)}
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

      <AnalyticalAccountDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        account={selectedAccount}
        onSuccess={fetchAccounts}
        availableParents={accounts.filter((a) => a.status !== "ARCHIVED")}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Analytical Account"
        description="Are you sure you want to delete this analytical account? This action cannot be undone."
      />
    </div>
  );
}
