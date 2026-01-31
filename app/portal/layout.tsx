"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FileText,
  ShoppingCart,
  Package,
  CreditCard,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/invoices", label: "Invoices", icon: FileText },
  { href: "/portal/orders", label: "Orders", icon: ShoppingCart },
  { href: "/portal/payments", label: "Payments", icon: CreditCard },
];

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Portal Header */}
      <header className="bg-background border-b h-16 flex items-center justify-between px-6 lg:px-20">
        <div className="font-bold text-lg">
          SpendIQ{" "}
          <span className="text-muted-foreground font-normal">Portal</span>
        </div>
        <nav className="flex items-center gap-6">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </nav>
      </header>
      <main className="container mx-auto max-w-6xl py-8 px-6">{children}</main>
    </div>
  );
}
