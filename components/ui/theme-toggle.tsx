"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function ThemeToggle({ collapsed }: { collapsed?: boolean }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDarkMode = savedTheme === "dark" || (!savedTheme && prefersDark);
    
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <div
      className={cn(
        "relative flex items-center bg-white border border-border rounded-full p-1 cursor-pointer w-[84px] h-[40px] transition-all duration-300",
        collapsed && "w-[40px] h-[84px] flex-col",
        isDark ? "justify-end" : "justify-start",
      )}
      onClick={toggleTheme}
    >
      {/* Toggle Items Background - This creates the switch effect */}
      {/* We use absolute positioning for the background pill */}
      <div
        className={cn(
          "absolute bg-[#8B5CF6] rounded-full shadow-sm transition-all duration-300 z-0",
          collapsed ? "w-8 h-8 left-1" : "h-8 w-8 top-1",
          // Position logic based on state and orientation
          !collapsed && (!isDark ? "left-1" : "left-[48px]"),
          collapsed && (!isDark ? "top-1" : "top-[48px]"),
        )}
      />

      {/* Sun Icon */}
      <div
        className={cn(
          "z-10 w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-300",
          !isDark ? "text-white" : "text-muted-foreground",
        )}
      >
        <Sun className="h-5 w-5" />
      </div>

      {/* Moon Icon */}
      <div
        className={cn(
          "z-10 w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-300",
          isDark ? "text-white" : "text-muted-foreground",
        )}
      >
        <Moon className="h-5 w-5" />
      </div>
    </div>
  );
}
