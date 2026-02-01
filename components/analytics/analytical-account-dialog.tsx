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

interface AnalyticalAccount {
  id: string;
  code: string;
  name: string;
  status: string;
  parentId?: string | null;
}

interface AnalyticalAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: AnalyticalAccount | null;
  onSuccess: () => void;
  availableParents: AnalyticalAccount[];
}

export function AnalyticalAccountDialog({
  open,
  onOpenChange,
  account,
  onSuccess,
  availableParents,
}: AnalyticalAccountDialogProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("none");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (account) {
      setCode(account.code);
      setName(account.name);
      setParentId(account.parentId || "none");
    } else {
      setCode("");
      setName("");
      setParentId("none");
    }
  }, [account, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim() || !name.trim()) {
      toast.error("Code and name are required");
      return;
    }

    try {
      setLoading(true);

      const data = {
        code: code.trim(),
        name: name.trim(),
        parentId: parentId === "none" ? null : parentId,
      };

      if (account) {
        await apiClient.patch(`/analytical-accounts/${account.id}`, data);
        toast.success("Analytical account updated");
      } else {
        await apiClient.post("/analytical-accounts", data);
        toast.success("Analytical account created");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to save analytical account:", error);
      toast.error(
        error.response?.data?.message || "Failed to save analytical account",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {account ? "Edit Analytical Account" : "Create Analytical Account"}
          </DialogTitle>
          <DialogDescription>
            {account
              ? "Update the analytical account details"
              : "Create a new analytical dimension for tracking financial data"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Code *</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g., MKTG, R&D, PROJ-001"
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Marketing Department"
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent">Parent (Optional)</Label>
            <Select
              value={parentId}
              onValueChange={setParentId}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {availableParents
                  .filter((p) => p.id !== account?.id)
                  .map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>
                      {parent.code} - {parent.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
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
              {loading ? "Saving..." : account ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
