"use client";

import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  // In a real app, isCollapsed would be lifted state from a context (e.g. useLayoutStore)
  // For now, we keep it simple or accept it might desync if strictly local to Sidebar.
  // Ideally: use a small zustand store for sidebar state to share with Header/Main content margin.

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
          "lg:ml-[280px]", // Default width, should match Sidebar's expanded width
          // If collapsed support is needed globally, we need that state here.
          // For MVP/Hackathon, fixed width or responsive hide is safer and cleaner unless requested dynamic.
        )}
      >
        <Header />
        <main className="flex-1 p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
