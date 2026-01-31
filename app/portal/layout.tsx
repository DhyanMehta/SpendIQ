"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  ShoppingCart,
  CreditCard,
  LayoutDashboard,
  LogOut,
  User,
  KeyRound,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

const navItems = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/invoices", label: "Invoices", icon: FileText },
  { href: "/portal/orders", label: "Orders", icon: ShoppingCart },
  { href: "/portal/payments", label: "Payments", icon: CreditCard },
];

interface UserProfile {
  id: string;
  loginId: string;
  email: string;
  name: string;
  role: string;
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiRequest("/auth/profile");
        if (data) {
          setProfile(data);
          // Also update localStorage for other components
          localStorage.setItem("userName", data.name || "");
          localStorage.setItem("userRole", data.role || "");
        }
      } catch (e) {
        console.error("Failed to fetch profile:", e);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  const handleResetPassword = async () => {
    setResetting(true);
    setResetMessage("");
    try {
      const data = await apiRequest("/auth/reset-password", { method: "POST" });
      if (data?.success) {
        setResetMessage("A new password has been sent to your email address. Please check your inbox.");
      } else {
        setResetMessage("Failed to reset password. Please try again.");
      }
    } catch (e: any) {
      setResetMessage(e.message || "Failed to reset password. Please try again.");
    } finally {
      setResetting(false);
    }
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

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{profile?.name || "User"}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-medium leading-none">{profile?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground">Login ID: {profile?.loginId || "-"}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email || "-"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setResetDialogOpen(true)}>
                <KeyRound className="mr-2 h-4 w-4" />
                Reset Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </header>
      <main className="container mx-auto max-w-6xl py-8 px-6">{children}</main>

      {/* Reset Password Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Click the button below to reset your password. A new password will be sent to your email address ({profile?.email}).
            </DialogDescription>
          </DialogHeader>
          {resetMessage && (
            <div className={cn(
              "p-3 rounded-md text-sm",
              resetMessage.includes("sent") ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
            )}>
              {resetMessage}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setResetDialogOpen(false); setResetMessage(""); }}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword} disabled={resetting || resetMessage.includes("sent")}>
              {resetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {resetMessage.includes("sent") ? "Email Sent" : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
