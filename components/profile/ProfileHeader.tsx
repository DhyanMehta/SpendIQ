"use client";

/**
 * ProfileHeader Component
 * 
 * Displays the user's avatar, name, role, email, and account status.
 * Professional, minimal design suitable for enterprise ERP applications.
 */

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { UserProfile } from "@/lib/hooks/useProfile";

interface ProfileHeaderProps {
  profile: UserProfile;
  isLoading?: boolean;
}

/**
 * Generates initials from a full name
 * @param name - Full name string
 * @returns Two-letter initials
 */
function getInitials(name: string): string {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Returns appropriate styling for role badge
 * @param role - User role
 * @returns Tailwind classes for badge
 */
function getRoleBadgeStyle(role: string): string {
  switch (role) {
    case "ADMIN":
      return "bg-slate-700 text-slate-100 hover:bg-slate-700";
    case "PORTAL_USER":
      return "bg-slate-500 text-slate-100 hover:bg-slate-500";
    default:
      return "bg-slate-400 text-slate-100 hover:bg-slate-400";
  }
}

/**
 * Returns human-readable role label
 * @param role - User role
 * @returns Display label
 */
function getRoleLabel(role: string): string {
  switch (role) {
    case "ADMIN":
      return "Administrator";
    case "PORTAL_USER":
      return "Portal User";
    default:
      return role;
  }
}

export function ProfileHeader({ profile, isLoading }: ProfileHeaderProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-6 animate-pulse">
          <div className="h-20 w-20 rounded-full bg-slate-200" />
          <div className="space-y-3 flex-1">
            <div className="h-6 w-48 bg-slate-200 rounded" />
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-4 w-56 bg-slate-200 rounded" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card className="p-6 shadow-sm border-slate-200">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-slate-700 flex items-center justify-center text-white text-2xl font-semibold shadow-sm">
              {getInitials(profile.name)}
            </div>
            {/* Status indicator */}
            <div
              className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white ${
                profile.status === "ACTIVE" ? "bg-emerald-500" : "bg-slate-400"
              }`}
              title={profile.status === "ACTIVE" ? "Active" : "Inactive"}
            />
          </div>

          {/* User Information */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-slate-900">
                {profile.name}
              </h1>
              <Badge className={getRoleBadgeStyle(profile.role)}>
                {getRoleLabel(profile.role)}
              </Badge>
            </div>

            <p className="text-slate-600 text-sm">{profile.email}</p>

            <div className="flex items-center gap-4 pt-1">
              <span className="text-xs text-slate-500">
                Login ID: <span className="font-medium text-slate-700">{profile.loginId}</span>
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className={`text-xs font-medium ${
                profile.status === "ACTIVE" ? "text-emerald-600" : "text-slate-500"
              }`}>
                {profile.status === "ACTIVE" ? "Active Account" : "Inactive Account"}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default ProfileHeader;
