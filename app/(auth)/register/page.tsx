"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/api";

const formSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    loginId: z
      .string()
      .min(6, { message: "Login ID must be at least 6 characters." })
      .max(12, { message: "Login ID must be at most 12 characters." }),
    email: z.string().email({ message: "Invalid email address." }),
    password: z
      .string()
      .min(9, { message: "Password must be more than 8 characters." })
      .regex(/[a-z]/, { message: "Password must contain a lowercase letter." })
      .regex(/[A-Z]/, { message: "Password must contain an uppercase letter." })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Password must contain a special character.",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      loginId: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError("");

    try {
      console.log("[Register] Attempting registration with:", values.loginId);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registrationData } = values;
      const response = await apiRequest("/auth/register", {
        method: "POST",
        body: registrationData,
      });
      console.log("[Register] Registration successful:", response);

      // On success, redirect to login
      router.push("/login");
    } catch (e: any) {
      console.error("[Register] Registration failed:", e);
      console.error("[Register] Error details:", {
        message: e?.message,
        name: e?.name,
        stack: e?.stack,
        fullError: e,
      });
      // Show the actual error message from the backend
      const errorMessage =
        e?.message || "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full shadow-lg border-muted/60">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Create an account
        </CardTitle>
        <CardDescription>
          Enter your details to get started with SpendIQ.
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              disabled={isLoading}
              className={form.formState.errors.name ? "border-destructive" : ""}
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="loginId">Login ID</Label>
            <Input
              id="loginId"
              placeholder="unique_id"
              disabled={isLoading}
              className={
                form.formState.errors.loginId ? "border-destructive" : ""
              }
              {...form.register("loginId")}
            />
            {form.formState.errors.loginId && (
              <p className="text-xs text-destructive">
                {form.formState.errors.loginId.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              disabled={isLoading}
              className={
                form.formState.errors.email ? "border-destructive" : ""
              }
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={isLoading}
                className={
                  form.formState.errors.password
                    ? "border-destructive pr-10"
                    : "pr-10"
                }
                {...form.register("password")}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
            {form.formState.errors.password && (
              <p className="text-xs text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Re-enter Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={isLoading}
                className={
                  form.formState.errors.confirmPassword
                    ? "border-destructive pr-10"
                    : "pr-10"
                }
                {...form.register("confirmPassword")}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="sr-only">
                  {showConfirmPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md text-center">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign Up
          </Button>
          <div className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="hover:text-primary transition-colors">
              Sign in
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
