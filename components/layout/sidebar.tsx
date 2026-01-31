"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  PieChart,
  Receipt,
  Settings,
  Wallet,
  LogOut,
  HelpCircle,
  Menu,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Receipt, label: "Transactions", href: "/dashboard/transactions" },
  { icon: Wallet, label: "Wallet", href: "/dashboard/budgets" },
  { icon: PieChart, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function Sidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: any) {
  const pathname = usePathname();

  return (
    <>
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 80 : 260,
          x: isMobileOpen ? 0 : ("0%" as any),
        }}
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-background border-r-0 lg:border-r border-border transition-all duration-300 ease-in-out hidden lg:flex flex-col py-6 shadow-xl shadow-purple-500/5",
          // Mobile adjustments
          isMobileOpen ? "flex translate-x-0" : "hidden lg:flex",
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "px-6 mb-8 flex items-center gap-3",
            isCollapsed && "justify-center px-0",
          )}
        >
          <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
            <span className="font-bold text-xl">S</span>
          </div>
          {!isCollapsed && (
            <span className="font-bold text-xl text-foreground tracking-tight">
              SpendIQ
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-primary",
                  )}
                />
                {!isCollapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="px-4 mt-auto space-y-2">
          <Link
            href="/help"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200",
            )}
          >
            <HelpCircle className="h-5 w-5" />
            {!isCollapsed && <span className="font-medium text-sm">Help</span>}
          </Link>
          <button
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200",
            )}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && (
              <span className="font-medium text-sm">Log out</span>
            )}
          </button>

          {/* Theme Toggle */}
          <div className="pt-4 border-t border-border mt-2 flex justify-center">
            <ThemeToggle collapsed={isCollapsed} />
          </div>
        </div>
      </motion.aside>
    </>
  );
}
