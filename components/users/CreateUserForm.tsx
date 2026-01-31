"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { createUserSchema, CreateUserFormValues } from "@/lib/users/validators";
import { usersApi } from "@/lib/users/api";
import { RoleSelect } from "./RoleSelect";
import { Role } from "@/lib/users/types";

export function CreateUserForm() {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      loginId: "",
      email: "",
      role: Role.PORTAL_USER,
      password: "",
      confirmPassword: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      toast.success("User created successfully");
      form.reset();
      setServerError(null);
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to create user";
      setServerError(errorMessage);
      toast.error(errorMessage);
    },
  });

  function onSubmit(data: CreateUserFormValues) {
    setServerError(null);
    mutate({
      name: data.name,
      loginId: data.loginId,
      email: data.email,
      role: data.role,
      password: data.password,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {serverError && (
          <div className="p-3 text-sm text-white bg-destructive rounded-md">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="loginId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Login ID</FormLabel>
                  <FormControl>
                    <Input placeholder="johndoe123" {...field} />
                  </FormControl>
                  <div className="text-xs text-muted-foreground">
                    6-12 chars, alphanumeric only
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="john@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => <RoleSelect field={field} />}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Re-enter Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isPending || !form.formState.isValid}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create User
          </Button>
        </div>
      </form>
    </Form>
  );
}
