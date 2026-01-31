"use client";

/**
 * Profile Page
 * 
 * Professional, enterprise-grade profile page for the Ledgerly ERP system.
 * Displays user information, settings, and preferences in a clean, minimal layout.
 * 
 * Route: /profile
 * Access: Authenticated users (Admin & Portal User)
 */

import { useProfile } from "@/lib/hooks/useProfile";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PersonalInfo } from "@/components/profile/PersonalInfo";
import { BusinessInfo } from "@/components/profile/BusinessInfo";
import { SecuritySettings } from "@/components/profile/SecuritySettings";
import { Preferences } from "@/components/profile/Preferences";
import { AuditInfo } from "@/components/profile/AuditInfo";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function ProfilePage() {
  const { data: profile, isLoading, isError, error } = useProfile();

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Failed to Load Profile
            </h2>
            <p className="text-slate-600 mb-6">
              {(error as Error)?.message || "An unexpected error occurred"}
            </p>
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
              <Link href="/dashboard">
                <Button variant="default" className="bg-slate-800 hover:bg-slate-700">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Container */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
              <p className="text-sm text-slate-500">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </motion.div>

        {/* Profile Content */}
        <div className="space-y-6">
          {/* Profile Header - Avatar, Name, Role, Status */}
          <ProfileHeader
            profile={profile!}
            isLoading={isLoading}
          />

          {/* Two Column Layout for Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Personal Information */}
              <PersonalInfo
                profile={profile!}
                isLoading={isLoading}
              />

              {/* Business Information */}
              <BusinessInfo
                profile={profile!}
                isLoading={isLoading}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Security Settings */}
              <SecuritySettings
                profile={profile!}
                isLoading={isLoading}
              />

              {/* Preferences */}
              <Preferences
                profile={profile!}
                isLoading={isLoading}
              />

              {/* Audit Information */}
              <AuditInfo
                profile={profile!}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="mt-12 pt-6 border-t border-slate-200"
        >
          <p className="text-center text-xs text-slate-400">
            Ledgerly • Budget Accounting System
          </p>
        </motion.div>
      </div>
    </div>
  );
}
