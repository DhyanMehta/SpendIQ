"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";
import { NavigationMenu } from "./navigation-menu";

export function Header({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const pathname = usePathname();

  // Generate user-friendly title from pathname
  const getDisplayTitle = () => {
    if (!pathname) return "Dashboard";

    const segments = pathname.split("/").filter(Boolean);

    // Skip dashboard prefix
    const relevantSegments = segments.filter(s => s !== "dashboard");

    if (relevantSegments.length === 0) return "Dashboard";

    // Get the last meaningful segment (not a UUID)
    const lastSegment = relevantSegments[relevantSegments.length - 1];

    // Check if it looks like a UUID or ID (contains hyphens with numbers/letters pattern)
    const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lastSegment) ||
      /^[a-z0-9]{20,}$/i.test(lastSegment) ||
      lastSegment === "new";

    if (isId) {
      // Use the second-to-last segment if available
      const parentSegment = relevantSegments[relevantSegments.length - 2];
      if (parentSegment) {
        // Capitalize and singularize common patterns
        const formatted = parentSegment.charAt(0).toUpperCase() + parentSegment.slice(1);
        if (lastSegment === "new") {
          return `New ${formatted.replace(/s$/, "")}`;
        }
        return `Edit ${formatted.replace(/s$/, "")}`;
      }
    }

    // Format the segment name
    return lastSegment
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const displayTitle = getDisplayTitle();

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
