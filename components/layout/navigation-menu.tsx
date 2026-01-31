"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  label: string;
  href: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: "Account",
    items: [
      { label: "Contact", href: "/dashboard/account/contact" },
      { label: "Product", href: "/dashboard/account/product" },
      { label: "Analyticals", href: "/dashboard/account/analyticals" },
      {
        label: "Auto Analytic Model",
        href: "/dashboard/account/auto-analytic",
      },
      { label: "Budget", href: "/dashboard" },
    ],
  },
  {
    title: "Purchase",
    items: [
      { label: "Purchase Order", href: "/dashboard/purchase/order" },
      { label: "Purchase Bill", href: "/dashboard/purchase/bill" },
      { label: "Payment", href: "/dashboard/purchase/payment" },
    ],
  },
  {
    title: "Sale",
    items: [
      { label: "Sale Order", href: "/dashboard/sale/order" },
      { label: "Sale Invoice", href: "/dashboard/sale/invoice" },
      { label: "Receipt", href: "/dashboard/sale/receipt" },
    ],
  },
];

export function NavigationMenu() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <nav className="flex items-center gap-1">
      {menuSections.map((section) => (
        <div
          key={section.title}
          className="relative"
          onMouseEnter={() => setActiveMenu(section.title)}
          onMouseLeave={() => setActiveMenu(null)}
        >
          <button
            className={cn(
              "flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-md",
              "transition-all duration-200",
              "hover:bg-primary/10 hover:text-primary",
              activeMenu === section.title && "bg-primary/10 text-primary",
            )}
          >
            {section.title}
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                activeMenu === section.title && "rotate-180",
              )}
            />
          </button>

          {/* Dropdown Menu */}
          <div
            className={cn(
              "absolute top-full left-0 mt-1 w-56 rounded-lg border bg-background shadow-lg",
              "transition-all duration-200 origin-top",
              activeMenu === section.title
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none",
            )}
          >
            <div className="p-2">
              <div className="text-xs font-semibold text-muted-foreground px-3 py-2 mb-1">
                {section.title}
              </div>
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block px-3 py-2 text-sm rounded-md",
                    "transition-colors duration-150",
                    "hover:bg-primary/10 hover:text-primary",
                    "focus:bg-primary/10 focus:text-primary focus:outline-none",
                  )}
                  onClick={() => setActiveMenu(null)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ))}
    </nav>
  );
}
