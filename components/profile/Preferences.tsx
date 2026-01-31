"use client";

/**
 * Preferences Component
 * 
 * User preferences for theme, language, and notifications.
 * Provides a clean, minimal interface for user customization.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserProfile, useUpdatePreferences } from "@/lib/hooks/useProfile";
import { Settings2, Loader2, Save, Sun, Moon, Monitor, Globe, Bell } from "lucide-react";

interface PreferencesProps {
  profile: UserProfile;
  isLoading?: boolean;
}

interface PreferencesData {
  theme: "light" | "dark" | "system";
  language: string;
  notifications: boolean;
}

/**
 * Custom hook for theme management using localStorage
 */
function useThemePreference() {
  const [theme, setThemeState] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null;
    if (savedTheme) {
      setThemeState(savedTheme);
    }
  }, []);

  const setTheme = (newTheme: "light" | "dark" | "system") => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);

    // Apply theme to document
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (newTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // System preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  return { theme, setTheme };
}

export function Preferences({ profile, isLoading }: PreferencesProps) {
  const { theme, setTheme } = useThemePreference();
  const { mutate: updatePreferences, isPending: isSaving } = useUpdatePreferences();

  const [preferences, setPreferences] = useState<PreferencesData>({
    theme: "system",
    language: "en",
    notifications: true,
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync with current theme on mount
  useEffect(() => {
    if (theme) {
      setPreferences((prev) => ({
        ...prev,
        theme: theme as "light" | "dark" | "system",
      }));
    }
  }, [theme]);

  const handleThemeChange = (value: string) => {
    const newTheme = value as "light" | "dark" | "system";
    setPreferences((prev) => ({ ...prev, theme: newTheme }));
    setTheme(newTheme);
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleLanguageChange = (value: string) => {
    setPreferences((prev) => ({ ...prev, language: value }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleNotificationsToggle = () => {
    setPreferences((prev) => ({ ...prev, notifications: !prev.notifications }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSave = () => {
    updatePreferences(preferences, {
      onSuccess: () => {
        setHasChanges(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      },
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-slate-200 rounded" />
                <div className="h-10 w-full bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4, ease: "easeOut" }}
    >
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Settings2 className="h-5 w-5 text-slate-600" />
              Preferences
            </CardTitle>
            
            {saveSuccess && (
              <span className="text-sm text-emerald-600 font-medium">
                Preferences saved
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Theme Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700">
              Theme
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {/* Light Theme */}
              <button
                onClick={() => handleThemeChange("light")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  preferences.theme === "light"
                    ? "border-slate-700 bg-slate-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <Sun className="h-6 w-6 text-amber-500" />
                <span className="text-sm font-medium text-slate-700">Light</span>
              </button>

              {/* Dark Theme */}
              <button
                onClick={() => handleThemeChange("dark")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  preferences.theme === "dark"
                    ? "border-slate-700 bg-slate-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <Moon className="h-6 w-6 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Dark</span>
              </button>

              {/* System Theme */}
              <button
                onClick={() => handleThemeChange("system")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  preferences.theme === "system"
                    ? "border-slate-700 bg-slate-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <Monitor className="h-6 w-6 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">System</span>
              </button>
            </div>
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Globe className="h-4 w-4 text-slate-500" />
              Language
            </Label>
            <Select value={preferences.language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi" disabled>
                  Hindi (Coming Soon)
                </SelectItem>
                <SelectItem value="ta" disabled>
                  Tamil (Coming Soon)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              Additional languages will be available in future updates.
            </p>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Bell className="h-4 w-4 text-slate-500" />
              Email Notifications
            </Label>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Receive email notifications
                </p>
                <p className="text-xs text-slate-500">
                  Get updates about invoices, payments, and budgets
                </p>
              </div>
              <button
                onClick={handleNotificationsToggle}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  preferences.notifications ? "bg-slate-700" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    preferences.notifications ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="bg-slate-800 hover:bg-slate-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default Preferences;
