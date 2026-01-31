"use client";

/**
 * PersonalInfo Component
 * 
 * Editable form for personal information including name, email, phone, and address.
 * Features inline editing with validation and save functionality.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserProfile, useUpdatePersonalInfo } from "@/lib/hooks/useProfile";
import { Save, Loader2, User } from "lucide-react";

interface PersonalInfoProps {
  profile: UserProfile;
  isLoading?: boolean;
}

interface FormData {
  name: string;
  phone: string;
  address: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
}

/**
 * Validates the personal info form
 * @param data - Form data to validate
 * @returns Object containing any validation errors
 */
function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = "Name is required";
  } else if (data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (data.phone && !/^[+]?[\d\s-]{10,15}$/.test(data.phone.replace(/\s/g, ""))) {
    errors.phone = "Please enter a valid phone number";
  }

  return errors;
}

export function PersonalInfo({ profile, isLoading }: PersonalInfoProps) {
  const { mutate: updatePersonalInfo, isPending: isSaving } = useUpdatePersonalInfo();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    address: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        address: profile.address || "",
      });
    }
  }, [profile]);

  // Track changes
  useEffect(() => {
    if (profile) {
      const changed =
        formData.name !== (profile.name || "") ||
        formData.phone !== (profile.phone || "") ||
        formData.address !== (profile.address || "");
      setHasChanges(changed);
      
      // Clear success message when user makes changes
      if (changed) {
        setSaveSuccess(false);
      }
    }
  }, [formData, profile]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear field error on change
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = () => {
    // Validate
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Submit
    updatePersonalInfo(formData, {
      onSuccess: () => {
        setHasChanges(false);
        setSaveSuccess(true);
        // Clear success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
      },
      onError: (error) => {
        console.error("Failed to update personal info:", error);
      },
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
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
      transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
    >
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <User className="h-5 w-5 text-slate-600" />
              Personal Information
            </CardTitle>
            
            {/* Save indicator */}
            {saveSuccess && (
              <span className="text-sm text-emerald-600 font-medium">
                Changes saved
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-slate-700">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter your full name"
              className={`transition-colors focus:ring-2 focus:ring-slate-200 ${
                errors.name ? "border-red-300 focus:ring-red-100" : ""
              }`}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email Address
            </Label>
            <Input
              id="email"
              value={profile.email}
              disabled
              className="bg-slate-50 text-slate-600 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
              Phone Number
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+91 98765 43210"
              className={`transition-colors focus:ring-2 focus:ring-slate-200 ${
                errors.phone ? "border-red-300 focus:ring-red-100" : ""
              }`}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium text-slate-700">
              Address <span className="text-slate-400">(Optional)</span>
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Enter your address"
              rows={3}
              className="resize-none transition-colors focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <Button
              onClick={handleSubmit}
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
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default PersonalInfo;
