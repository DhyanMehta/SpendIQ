"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const data = [
  { name: "Jan", income: 9500, expense: 8000 },
  { name: "Feb", income: 10500, expense: 12000 },
  { name: "Mar", income: 10500, expense: 9500 },
  { name: "Apr", income: 13500, expense: 12000 },
  { name: "May", income: 12000, expense: 11500 },
  { name: "Jun", income: 7000, expense: 6000 },
  { name: "Jul", income: 8000, expense: 6500 },
];

export function MoneyFlowChart() {
  return (
    <Card className="rounded-[1.5rem] border-none shadow-sm col-span-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-4">
          <CardTitle className="text-xl font-bold">Money flow</CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-muted-foreground font-medium">Income</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-primary/30" />
              <span className="text-muted-foreground font-medium">Expense</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-8 rounded-full text-xs font-normal border-border bg-transparent hover:bg-secondary"
          >
            All accounts <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            className="h-8 rounded-full text-xs font-normal border-border bg-transparent hover:bg-secondary"
          >
            This year <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              barGap={8}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 20px -5px rgba(0,0,0,0.1)",
                  padding: "8px 12px",
                }}
                itemStyle={{ fontSize: "13px", fontWeight: 600 }}
                formatter={(value: number) => [
                  `$${value.toLocaleString()}`,
                  "",
                ]}
              />
              <Bar
                dataKey="income"
                fill="hsl(var(--primary))"
                radius={[50, 50, 50, 50]}
                barSize={12}
              />
              <Bar
                dataKey="expense"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                radius={[50, 50, 50, 50]}
                barSize={12}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
