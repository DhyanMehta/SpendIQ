"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

// Mock Data
const budgets = [
  {
    id: 1,
    name: "Q1 Marketing",
    department: "Marketing",
    allocated: 50000,
    spent: 24000,
    status: "Active",
  },
  {
    id: 2,
    name: "IT Infrastructure Upgrade",
    department: "IT",
    allocated: 120000,
    spent: 115000,
    status: "Warning",
  },
  {
    id: 3,
    name: "Annual Team Retreat",
    department: "HR",
    allocated: 15000,
    spent: 0,
    status: "Pending",
  },
  {
    id: 4,
    name: "Office Supplies 2026",
    department: "Admin",
    allocated: 12000,
    spent: 3400,
    status: "Active",
  },
  {
    id: 5,
    name: "New Product R&D",
    department: "R&D",
    allocated: 250000,
    spent: 180000,
    status: "Active",
  },
];

export default function BudgetListPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Budgets</h2>
          <p className="text-muted-foreground">
            Manage and track departmental allocations.
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> New Budget
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">
              Active Budgets
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search budgets..." className="pl-8" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Budget Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Allocated</TableHead>
                <TableHead className="text-right">Spent</TableHead>
                <TableHead className="text-right">Utilization</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map((budget) => {
                const utilization = (budget.spent / budget.allocated) * 100;
                return (
                  <TableRow key={budget.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/budgets/${budget.id}`}
                        className="hover:underline text-primary"
                      >
                        {budget.name}
                      </Link>
                    </TableCell>
                    <TableCell>{budget.department}</TableCell>
                    <TableCell className="text-right">
                      ${budget.allocated.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ${budget.spent.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-muted-foreground">
                          {utilization.toFixed(1)}%
                        </span>
                        <div className="h-2 w-16 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${Math.min(utilization, 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          budget.status === "Warning" ? "warning" : "default"
                        }
                      >
                        {budget.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
