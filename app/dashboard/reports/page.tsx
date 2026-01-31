"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const reportData = [
  { name: "Jan", budget: 100000, actual: 95000, achievement: 95 },
  { name: "Feb", budget: 100000, actual: 102000, achievement: 102 },
  { name: "Mar", budget: 120000, actual: 115000, achievement: 95.8 },
  { name: "Apr", budget: 110000, actual: 108000, achievement: 98.1 },
  { name: "May", budget: 110000, actual: 125000, achievement: 113.6 },
  { name: "Jun", budget: 115000, actual: 110000, achievement: 95.6 },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Financial Reports
          </h2>
          <p className="text-muted-foreground">
            Budget achievement and variance analysis.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Chart Report */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Budget Achievement - H1 2026</CardTitle>
            <CardDescription>
              Monthly comparison of allocated budget vs actual spending.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={reportData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="stroke-muted"
                />
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                <Bar
                  dataKey="budget"
                  name="Budget"
                  fill="hsl(var(--secondary))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="actual"
                  name="Actual"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                >
                  {reportData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.actual > entry.budget
                          ? "hsl(var(--destructive))"
                          : "hsl(var(--primary))"
                      }
                    />
                  ))}
                </Bar>
                <ReferenceLine y={0} stroke="#000" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed Table */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Detailed Variance Report</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead className="text-right">Achievement %</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map((item) => {
                  const variance = item.actual - item.budget;
                  const isOver = variance > 0;
                  return (
                    <TableRow key={item.name}>
                      <TableCell className="font-medium">
                        {item.name} 2026
                      </TableCell>
                      <TableCell className="text-right">
                        ${item.budget.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${item.actual.toLocaleString()}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right",
                          isOver ? "text-destructive" : "text-green-600",
                        )}
                      >
                        {isOver ? "+" : ""}
                        {variance.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.achievement}%
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={isOver ? "destructive" : "success"}>
                          {isOver ? "Over Budget" : "On Track"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
