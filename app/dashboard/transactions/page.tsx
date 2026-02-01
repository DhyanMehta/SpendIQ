"use client";

import { useEffect, useState } from "react";
import { client } from "@/lib/api/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { JournalEntryDialog } from "@/components/accounting/journal-entry-dialog";

interface JournalEntryLine {
  id: string;
  debit: number;
  credit: number;
}

interface JournalEntry {
  id: string;
  date: string;
  reference: string | null;
  state: string;
  lines: JournalEntryLine[];
}

export default function TransactionsPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await client.get("/journal-entries");
      setEntries(res.data);
    } catch (error) {
      console.error("Failed to fetch entries:", error);
      toast.error("Failed to load journal entries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handlePost = async (id: string) => {
    try {
      setProcessingId(id);
      await client.post(`/journal-entries/${id}/post`);
      toast.success("Entry posted successfully");
      fetchEntries();
    } catch (error) {
      console.error("Failed to post entry:", error);
      toast.error("Failed to post entry");
    } finally {
      setProcessingId(null);
    }
  };

  const calculateTotal = (lines: JournalEntryLine[]) => {
    return lines.reduce((sum, line) => sum + Number(line.debit), 0).toFixed(2);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Journal Entries</h1>
          <p className="text-muted-foreground mt-2">
            Manage your accounting transactions and journal entries.
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Entry
        </Button>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>State</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading entries...
                  </div>
                </TableCell>
              </TableRow>
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No journal entries found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{format(new Date(entry.date), "PPP")}</TableCell>
                  <TableCell className="font-medium">
                    {entry.reference || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        entry.state === "POSTED" ? "default" : "secondary"
                      }
                    >
                      {entry.state}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {calculateTotal(entry.lines)}
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.state === "DRAFT" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePost(entry.id)}
                        disabled={!!processingId}
                      >
                        {processingId === entry.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        )}
                        Post
                      </Button>
                    )}
                    {entry.state === "POSTED" && (
                      <Button variant="ghost" size="sm" disabled>
                        <FileText className="h-4 w-4 mr-2" /> Posted
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <JournalEntryDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={fetchEntries}
      />
    </div>
  );
}
