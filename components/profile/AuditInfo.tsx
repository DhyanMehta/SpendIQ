"use client";

/**
 * AuditInfo Component
 * 
 * Displays meta information about the account including creation date,
 * last update, and role. Reinforces ERP seriousness.
 */

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfile } from "@/lib/hooks/useProfile";
import { Info, Calendar, RefreshCw, UserCheck } from "lucide-react";

interface AuditInfoProps {
  profile: UserProfile;
  isLoading?: boolean;
}

/**
 * Formats a date string to a readable format
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
function formatDate(dateString: string): string {
  if (!dateString) return "—";
  
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function AuditInfo({ profile, isLoading }: AuditInfoProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-24 bg-slate-200 rounded" />
                <div className="h-4 w-32 bg-slate-200 rounded" />
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
      transition={{ duration: 0.3, delay: 0.5, ease: "easeOut" }}
    >
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Info className="h-5 w-5 text-slate-600" />
            Account Information
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Account Created */}
            <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="h-4 w-4" />
                Account Created
              </div>
              <span className="text-sm font-medium text-slate-800">
                {formatDate(profile.createdAt)}
              </span>
            </div>

            {/* Last Updated */}
            <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <RefreshCw className="h-4 w-4" />
                Last Updated
              </div>
              <span className="text-sm font-medium text-slate-800">
                {formatDate(profile.updatedAt)}
              </span>
            </div>

            {/* Role */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <UserCheck className="h-4 w-4" />
                Account Role
              </div>
              <span className="text-sm font-medium text-slate-800">
                {profile.role === "ADMIN" ? "Administrator" : "Portal User"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default AuditInfo;
