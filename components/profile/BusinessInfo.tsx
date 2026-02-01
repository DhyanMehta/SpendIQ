"use client";

/**
 * BusinessInfo Component
 * 
 * Displays business-related information based on user role.
 * Admin users see full company details, Portal users see linked company info.
 * All fields are read-only as business info is managed elsewhere.
 */

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/lib/hooks/useProfile";
import { Building2, Globe, Receipt, DollarSign, Clock } from "lucide-react";

interface BusinessInfoProps {
  profile: UserProfile;
  isLoading?: boolean;
}

export function BusinessInfo({ profile, isLoading }: BusinessInfoProps) {
  const isAdmin = profile?.role === "ADMIN";

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-32 bg-slate-200 rounded" />
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
      transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
    >
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Building2 className="h-5 w-5 text-slate-600" />
            Business Information
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {isAdmin ? (
            // Admin View - Full business details
            <>
              {/* Company Name */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  Company Name
                </Label>
                <Input
                  value={profile.companyName || "Ledgerly Inc."}
                  disabled
                  className="bg-slate-50 text-slate-700 cursor-not-allowed"
                />
              </div>

              {/* Business Email */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-500" />
                  Business Email
                </Label>
                <Input
                  value={profile.businessEmail || profile.email}
                  disabled
                  className="bg-slate-50 text-slate-700 cursor-not-allowed"
                />
              </div>

              {/* GST Number */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-slate-500" />
                  GST Number
                </Label>
                <Input
                  value={profile.gstNumber || "Not configured"}
                  disabled
                  className="bg-slate-50 text-slate-700 cursor-not-allowed"
                />
              </div>

              {/* Two-column layout for currency and timezone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Default Currency */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    Default Currency
                  </Label>
                  <Input
                    value={profile.defaultCurrency || "INR (₹)"}
                    disabled
                    className="bg-slate-50 text-slate-700 cursor-not-allowed"
                  />
                </div>

                {/* Timezone */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    Timezone
                  </Label>
                  <Input
                    value={profile.timezone || "Asia/Kolkata (IST)"}
                    disabled
                    className="bg-slate-50 text-slate-700 cursor-not-allowed"
                  />
                </div>
              </div>

              <p className="text-xs text-slate-500 pt-2">
                Business information can be updated in System Settings.
              </p>
            </>
          ) : (
            // Portal User View - Limited info
            <>
              {/* Linked Company */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  Linked Company
                </Label>
                <Input
                  value={profile.linkedCompanyName || "Ledgerly Inc."}
                  disabled
                  className="bg-slate-50 text-slate-700 cursor-not-allowed"
                />
              </div>

              {/* Customer/Vendor Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Account Type
                </Label>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`font-medium ${
                      profile.contactType === "CUSTOMER"
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {profile.contactType === "CUSTOMER" ? "Customer" : "Vendor"}
                  </Badge>
                </div>
              </div>

              {/* GST Number (Read-only for portal users) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-slate-500" />
                  GST Number
                </Label>
                <Input
                  value={profile.gstNumber || "Not provided"}
                  disabled
                  className="bg-slate-50 text-slate-700 cursor-not-allowed"
                />
              </div>

              <p className="text-xs text-slate-500 pt-2">
                Contact your administrator to update business information.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default BusinessInfo;
