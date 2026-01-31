"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";
import { NavigationMenu } from "./navigation-menu";

export function Header({ isCollapsed = false }: { isCollapsed?: boolean }) {
  // Breadcrumb logic normally goes here
  const pathname = usePathname();
  const title = pathname?.split("/").pop() || "Dashboard";
  const displayTitle = title.charAt(0).toUpperCase() + title.slice(1);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6",
        "transition-all duration-300 ease-in-out",
      )}
    >
      <div className="flex items-center gap-6">
        <h1 className="text-lg font-semibold md:text-xl text-foreground/80">
          {displayTitle}
        </h1>
        <div className="hidden lg:block">
          <NavigationMenu />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="gap-2">
          <span className="hidden md:inline-block text-sm font-medium text-muted-foreground">
            Admin User
          </span>
          <UserCircle className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
