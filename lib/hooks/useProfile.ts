"use client";

/**
 * @fileoverview Profile Hooks for SpendIQ
 * 
 * Provides TanStack Query hooks for profile data fetching and mutations.
 * All hooks follow the established pattern from other hook files.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../api/client";

/**
 * Profile data interface
 * Represents the user profile returned from the API
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  loginId: string;
  role: "ADMIN" | "PORTAL_USER";
  phone?: string;
  address?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  
  // Business information (role-dependent)
  companyName?: string;
  businessEmail?: string;
  gstNumber?: string;
  defaultCurrency?: string;
  timezone?: string;
  
  // Portal user specific
  linkedCompanyName?: string;
  contactType?: "CUSTOMER" | "VENDOR";
  contactId?: string;
}

/**
 * Hook to fetch the current user's profile
 * @returns Query result with profile data
 */
export function useProfile() {
  return useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: profileApi.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook to update personal information
 * @returns Mutation for updating personal info
 */
export function useUpdatePersonalInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.updatePersonalInfo,
    onSuccess: () => {
      // Invalidate profile to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

/**
 * Hook to change password
 * @returns Mutation for password change
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: profileApi.changePassword,
  });
}

/**
 * Hook to update user preferences
 * @returns Mutation for updating preferences
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
