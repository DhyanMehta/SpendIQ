"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

const data = [
  { name: "Cafe & Restaurants", value: 400, color: "#8B5CF6" }, // Primary
  { name: "Entertainment", value: 300, color: "#C4B5FD" }, // Light Purple
  { name: "Investments", value: 200, color: "#F3F4F6" }, // Very light gray
  { name: "Food & Groceries", value: 500, color: "#4B5563" }, // Dark Gray
  { name: "Health & Beauty", value: 250, color: "#9CA3AF" }, // Gray
  { name: "Traveling", value: 350, color: "#D1D5DB" }, // Light Gray
];

export function BudgetDonutChart() {
  return (
    <Card className="rounded-[1.5rem] border-none shadow-sm col-span-3">
      <CardHeader className="flex flex-row items-start justify-between pb-0">
        <CardTitle className="text-xl font-bold">Budget</CardTitle>
        <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary cursor-pointer transition-colors">
          <ArrowUpRight className="h-5 w-5 text-foreground" />
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between p-6">
        {/* Legend Left Side */}
        <div className="space-y-3 w-1/2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium text-foreground">
                {item.name}
              </span>
            </div>
          ))}
        </div>

        {/* Donut Chart Right Side */}
        <div className="relative w-1/2 h-[220px]">
          {/* Floating Badge Mockup */}
          <div className="absolute top-2 left-0 bg-white/90 backdrop-blur shadow-sm p-2 rounded-xl z-10 border border-slate-100">
            <div className="text-[10px] text-muted-foreground font-bold">
              7%
            </div>
            <div className="text-xs font-bold text-foreground">$400</div>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={65}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                cornerRadius={40} // Round edges
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-muted-foreground font-medium">
              Total for month
            </span>
            <span className="text-2xl font-bold text-foreground mt-1">
              $5,950<span className="text-muted-foreground text-lg">.00</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
