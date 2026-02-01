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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { client as apiClient } from "@/lib/api/client";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface JournalEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface SelectOption {
  id: string;
  name: string;
  code?: string;
}

interface Line {
  id: number; // Temporary UI ID
  accountId: string;
  partnerId: string | null;
  label: string;
  debit: number;
  credit: number;
  analyticAccountId: string | null;
}

export function JournalEntryDialog({
  open,
  onOpenChange,
  onSuccess,
}: JournalEntryDialogProps) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [reference, setReference] = useState("");
  const [lines, setLines] = useState<Line[]>([
    {
      id: Date.now(),
      accountId: "",
      partnerId: null,
      label: "/",
      debit: 0,
      credit: 0,
      analyticAccountId: null,
    },
    {
      id: Date.now() + 1,
      accountId: "",
      partnerId: null,
      label: "/",
      debit: 0,
      credit: 0,
      analyticAccountId: null,
    },
  ]);
  const [loading, setLoading] = useState(false);

  // Options
  const [accounts, setAccounts] = useState<SelectOption[]>([]);
  const [contacts, setContacts] = useState<SelectOption[]>([]);
  const [analyticAccounts, setAnalyticAccounts] = useState<SelectOption[]>([]);

  useEffect(() => {
    if (open) {
      fetchOptions();
    }
  }, [open]);

  const fetchOptions = async () => {
    try {
      const [accountsRes, contactsRes, analyticsRes] = await Promise.all([
        apiClient.get("/accounts").catch(() => ({ data: [] })),
        apiClient.get("/contacts").catch(() => ({ data: [] })),
        apiClient.get("/analytical-accounts").catch(() => ({ data: [] })),
      ]);

      setAccounts(accountsRes.data);
      setContacts(contactsRes.data);
      setAnalyticAccounts(analyticsRes.data);
    } catch (error) {
      console.error("Failed to fetch options:", error);
      toast.error("Failed to load account data");
    }
  };

  const handleAddLine = () => {
    setLines([
      ...lines,
      {
        id: Date.now(),
        accountId: "",
        partnerId: null,
        label: "/",
        debit: 0,
        credit: 0,
        analyticAccountId: null,
      },
    ]);
  };

  const handleRemoveLine = (id: number) => {
    if (lines.length > 1) {
      setLines(lines.filter((l) => l.id !== id));
    }
  };

  const updateLine = (id: number, field: keyof Line, value: any) => {
    setLines(
      lines.map((l) => {
        if (l.id === id) {
          // Logic for handling 'none' from Select
          if (field === "partnerId" && value === "none") value = null;
          if (field === "analyticAccountId" && value === "none") value = null;
          return { ...l, [field]: value };
        }
        return l;
      }),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const totalDebit = lines.reduce((sum, l) => sum + Number(l.debit), 0);
    const totalCredit = lines.reduce((sum, l) => sum + Number(l.credit), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      toast.error(
        `Unbalanced Entry: Debit ${totalDebit} != Credit ${totalCredit}`,
      );
      return;
    }

    if (lines.some((l) => !l.accountId)) {
      toast.error("All lines must have an account selected");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        date: new Date(date),
        reference,
        lines: lines.map((l) => ({
          accountId: l.accountId,
          partnerId: l.partnerId,
          label: l.label,
          debit: Number(l.debit),
          credit: Number(l.credit),
          analyticAccountId: l.analyticAccountId,
        })),
      };

      await apiClient.post("/journal-entries", payload);

      toast.success("Journal Entry created successfully");
      onSuccess();
      onOpenChange(false);
      // Reset form
      setReference("");
      setLines([
        {
          id: Date.now(),
          accountId: "",
          partnerId: null,
          label: "/",
          debit: 0,
          credit: 0,
          analyticAccountId: null,
        },
      ]);
    } catch (error: any) {
      console.error("Failed to create entry:", error);
      toast.error(error.response?.data?.message || "Failed to create entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Create Journal Entry</DialogTitle>
          <DialogDescription>
            Record a new manual journal entry.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Reference</Label>
              <Input
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. MISC/2023/001"
              />
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Account</TableHead>
                  <TableHead className="w-[150px]">Partner</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead className="w-[120px] text-right">Debit</TableHead>
                  <TableHead className="w-[120px] text-right">Credit</TableHead>
                  <TableHead className="w-[150px]">Analytic</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>
                      <Select
                        value={line.accountId}
                        onValueChange={(val) =>
                          updateLine(line.id, "accountId", val)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((acc) => (
                            <SelectItem key={acc.id} value={acc.id}>
                              {acc.code} - {acc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={line.partnerId || "none"}
                        onValueChange={(val) =>
                          updateLine(line.id, "partnerId", val)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {contacts.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={line.label}
                        onChange={(e) =>
                          updateLine(line.id, "label", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="text-right"
                        value={line.debit}
                        onChange={(e) =>
                          updateLine(line.id, "debit", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="text-right"
                        value={line.credit}
                        onChange={(e) =>
                          updateLine(line.id, "credit", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={line.analyticAccountId || "none"}
                        onValueChange={(val) =>
                          updateLine(line.id, "analyticAccountId", val)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {analyticAccounts.map((aa) => (
                            <SelectItem key={aa.id} value={aa.id}>
                              {aa.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => handleRemoveLine(line.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-2 border-t bg-muted/50">
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleAddLine}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Line
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Journal Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
