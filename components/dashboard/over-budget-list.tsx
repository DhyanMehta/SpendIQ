import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

// Mock Data
const overBudgetItems = [
  {
    id: "CC-001",
    name: "IT Infrastructure",
    budget: 50000,
    actual: 54200,
    variance: -4200,
    status: "Critical",
  },
  {
    id: "CC-045",
    name: "Q1 Marketing Campaign",
    budget: 12000,
    actual: 12500,
    variance: -500,
    status: "Warning",
  },
  {
    id: "CC-102",
    name: "Office Supplies",
    budget: 2000,
    actual: 2150,
    variance: -150,
    status: "Warning",
  },
  {
    id: "CC-099",
    name: "Travel Expenses",
    budget: 15000,
    actual: 18000,
    variance: -3000,
    status: "Critical",
  },
];

export function OverBudgetList() {
  return (
    <Card className="col-span-4 lg:col-span-3 h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          Over Budget Alerts
        </CardTitle>
        <CardDescription>
          Cost centers exceeding allocated budget this month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cost Center</TableHead>
              <TableHead className="text-right">Variance</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {overBudgetItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{item.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.id}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-destructive font-semibold">
                  -${Math.abs(item.variance).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={
                      item.status === "Critical" ? "destructive" : "warning"
                    }
                  >
                    {item.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Minimal Badge component inline if not exists, or I typically need components/ui/badge.tsx
// I haven't created badge.tsx yet! I need to create it.
