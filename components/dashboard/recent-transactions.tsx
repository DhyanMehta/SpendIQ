"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";

// Helper to render mock logos if image not available
const MockLogo = ({ color, icon }: { color: string; icon: string }) => (
  <div
    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm`}
    style={{ backgroundColor: color }}
  >
    {icon}
  </div>
);

const transactions = [
  {
    id: 1,
    date: "25 Jul 12:30",
    amount: -10,
    name: "YouTube",
    method: "VISA **3254",
    category: "Subscription",
    logo: (
      <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-xs">
        ▶
      </div>
    ),
  },
  {
    id: 2,
    date: "26 Jul 15:00",
    amount: -150,
    name: "Reserved",
    method: "Mastercard **2154",
    category: "Shopping",
    logo: (
      <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-serif text-[10px]">
        RE
      </div>
    ),
  },
  {
    id: 3,
    date: "27 Jul 9:00",
    amount: -80,
    name: "Yaposhka",
    method: "Mastercard **2154",
    category: "Cafe & Restaurants",
    logo: (
      <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center text-xs">
        ☺
      </div>
    ),
  },
];

export function RecentTransactionsList() {
  return (
    <Card className="rounded-[1.5rem] border-none shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <CardTitle className="text-xl font-bold">Recent transactions</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" className="h-9 rounded-full px-4 text-xs">
            All accounts <ChevronDown className="ml-2 h-3 w-3" />
          </Button>
          <Button variant="outline" className="h-9 rounded-full px-4 text-xs">
            See all <ChevronRight className="ml-2 h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-8 py-3 bg-[#F8F7FF] text-[#8B5CF6] text-xs font-bold uppercase tracking-wider">
            <div className="col-span-2">Date</div>
            <div className="col-span-1 text-right">Amount</div>
            <div className="col-span-3 pl-8">Payment Name</div>
            <div className="col-span-3">Method</div>
            <div className="col-span-3">Category</div>
          </div>

          {/* Table Body */}
          <div className="px-6">
            {transactions.map((t) => (
              <div
                key={t.id}
                className="grid grid-cols-12 gap-4 px-2 py-5 items-center border-b border-border last:border-0 hover:bg-slate-50/50 transition-colors"
              >
                <div className="col-span-2 text-sm text-foreground font-medium">
                  {t.date}
                </div>
                <div className="col-span-1 text-sm font-bold text-foreground text-right">
                  {t.amount < 0 ? `- $${Math.abs(t.amount)}` : `+ $${t.amount}`}
                </div>
                <div className="col-span-3 flex items-center gap-3 pl-8">
                  {t.logo}
                  <span className="font-semibold text-sm">{t.name}</span>
                </div>
                <div className="col-span-3 text-sm text-foreground font-medium">
                  {t.method}
                </div>
                <div className="col-span-3 text-sm text-foreground font-medium">
                  {t.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
