"use client";

import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FileText,
  Plus,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Note: I haven't implemented DropdownMenu primitives yet!
// I should use simple buttons or implement dropdown primitives soon.
// For now, I'll skip dropdown complex logic or use a simple overflow button implementation.

interface CostCenterNode {
  id: string;
  name: string;
  code: string;
  type: "view" | "account"; // View = Folder/Parent, Account = Leaf
  children?: CostCenterNode[];
  balance: number;
}

const initialData: CostCenterNode[] = [
  {
    id: "1",
    name: "Operational Expenses",
    code: "OPEX",
    type: "view",
    balance: 450000,
    children: [
      {
        id: "1-1",
        name: "IT Department",
        code: "IT",
        type: "view",
        balance: 150000,
        children: [
          {
            id: "1-1-1",
            name: "Hardware",
            code: "IT-HW",
            type: "account",
            balance: 80000,
          },
          {
            id: "1-1-2",
            name: "Software Licenses",
            code: "IT-SW",
            type: "account",
            balance: 50000,
          },
          {
            id: "1-1-3",
            name: "Cloud Services",
            code: "IT-CLOUD",
            type: "account",
            balance: 20000,
          },
        ],
      },
      {
        id: "1-2",
        name: "Marketing",
        code: "MKT",
        type: "view",
        balance: 200000,
        children: [
          {
            id: "1-2-1",
            name: "Online Ads",
            code: "MKT-ADS",
            type: "account",
            balance: 120000,
          },
          {
            id: "1-2-2",
            name: "Events",
            code: "MKT-EVT",
            type: "account",
            balance: 80000,
          },
        ],
      },
      {
        id: "1-3",
        name: "HR & Admin",
        code: "HR",
        type: "account",
        balance: 100000,
      },
    ],
  },
  {
    id: "2",
    name: "Capital Expenses",
    code: "CAPEX",
    type: "view",
    balance: 1200000,
    children: [
      {
        id: "2-1",
        name: "New HQ Construction",
        code: "HQ-BUILD",
        type: "account",
        balance: 1200000,
      },
    ],
  },
];

function TreeNode({
  node,
  level = 0,
}: {
  node: CostCenterNode;
  level?: number;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center justify-between py-2 px-2 hover:bg-muted/50 rounded-md transition-colors cursor-pointer group",
        )}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <div className="text-muted-foreground w-4 flex justify-center">
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          ) : (
            <div className="w-4" />
          )}

          {node.type === "view" ? (
            <Folder
              className={cn(
                "h-4 w-4",
                hasChildren
                  ? "text-blue-500 fill-blue-500/20"
                  : "text-slate-500",
              )}
            />
          ) : (
            <FileText className="h-4 w-4 text-emerald-500" />
          )}

          <span className="font-medium text-sm">
            <span className="text-muted-foreground mr-2 font-mono text-xs">
              [{node.code}]
            </span>
            {node.name}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold tabular-nums">
            ${node.balance.toLocaleString()}
          </span>
          {/* Actions - Hidden by default, show on hover */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {hasChildren && isOpen && (
        <div className="border-l ml-6 border-dashed border-muted-foreground/20">
          {node.children!.map((child) => (
            <TreeNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Analytical Accounts
          </h2>
          <p className="text-muted-foreground">
            Hierarchy of cost centers and projects.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Group
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost Structure</CardTitle>
          <CardDescription>
            Expand nodes to view detailed account balances.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-card">
            {initialData.map((node) => (
              <TreeNode key={node.id} node={node} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
