"use client";

/**
 * SecuritySettings Component
 * 
 * Provides security-related settings including password change functionality
 * and displays last login time and session information.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserProfile, useChangePassword } from "@/lib/hooks/useProfile";
import { Shield, Eye, EyeOff, Loader2, Clock, AlertCircle } from "lucide-react";

interface SecuritySettingsProps {
  profile: UserProfile;
  isLoading?: boolean;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

/**
 * Validates the password change form
 * @param data - Form data to validate
 * @returns Object containing any validation errors
 */
function validatePasswordForm(data: PasswordFormData): PasswordErrors {
  const errors: PasswordErrors = {};

  if (!data.currentPassword) {
    errors.currentPassword = "Current password is required";
  }

  if (!data.newPassword) {
    errors.newPassword = "New password is required";
  } else if (data.newPassword.length < 8) {
    errors.newPassword = "Password must be at least 8 characters";
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.newPassword)) {
    errors.newPassword = "Password must contain uppercase, lowercase, and number";
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = "Please confirm your new password";
  } else if (data.newPassword !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}

/**
 * Formats a date string to a readable format
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
function formatDate(dateString?: string): string {
  if (!dateString) return "Never";
  
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SecuritySettings({ profile, isLoading }: SecuritySettingsProps) {
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword();

  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<PasswordErrors>({});
  const [changeSuccess, setChangeSuccess] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);

  const handleChange = (field: keyof PasswordFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear field error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    
    // Clear messages
    setChangeSuccess(false);
    setChangeError(null);
  };

  const handleSubmit = () => {
    // Validate
    const validationErrors = validatePasswordForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Submit
    changePassword(
      {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      },
      {
        onSuccess: () => {
          setFormData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          setChangeSuccess(true);
          setTimeout(() => setChangeSuccess(false), 5000);
        },
        onError: (error: any) => {
          setChangeError(error.message || "Failed to change password");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
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
      transition={{ duration: 0.3, delay: 0.3, ease: "easeOut" }}
    >
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Shield className="h-5 w-5 text-slate-600" />
            Security Settings
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Last Login Information */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-slate-500" />
              <div>
                <p className="text-sm font-medium text-slate-700">Last Login</p>
                <p className="text-sm text-slate-600">
                  {formatDate(profile.lastLoginAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">Change Password</h3>

            {/* Success Message */}
            {changeSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm text-emerald-700 font-medium">
                  Password changed successfully
                </p>
              </div>
            )}

            {/* Error Message */}
            {changeError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-700">{changeError}</p>
              </div>
            )}

            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm font-medium text-slate-700">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => handleChange("currentPassword", e.target.value)}
                  placeholder="Enter current password"
                  className={`pr-10 transition-colors focus:ring-2 focus:ring-slate-200 ${
                    errors.currentPassword ? "border-red-300 focus:ring-red-100" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-red-500">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium text-slate-700">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => handleChange("newPassword", e.target.value)}
                  placeholder="Enter new password"
                  className={`pr-10 transition-colors focus:ring-2 focus:ring-slate-200 ${
                    errors.newPassword ? "border-red-300 focus:ring-red-100" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-500">{errors.newPassword}</p>
              )}
              <p className="text-xs text-slate-500">
                Minimum 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  placeholder="Confirm new password"
                  className={`pr-10 transition-colors focus:ring-2 focus:ring-slate-200 ${
                    errors.confirmPassword ? "border-red-300 focus:ring-red-100" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                onClick={handleSubmit}
                disabled={isChangingPassword || (!formData.currentPassword && !formData.newPassword)}
                className="bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default SecuritySettings;
