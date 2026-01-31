"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Loader2, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
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
import { setCookie } from "@/lib/auth/cookies";
import Link from "next/link";

const formSchema = z.object({
  loginId: z.string().min(1, { message: "Login ID is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loginId: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError("");

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: { loginId: values.loginId, password: values.password },
      });

      if (data && data.access_token) {
        // Store in localStorage
        localStorage.setItem("accessToken", data.access_token);
        if (data.user?.name) {
          localStorage.setItem("userName", data.user.name);
        }
        if (data.user?.role) {
          localStorage.setItem("userRole", data.user.role);
        }

        // Store in cookies for middleware
        setCookie("accessToken", data.access_token, 7);
        if (data.user?.role) {
          setCookie("userRole", data.user.role, 7);
        }

        // Redirect based on role
        if (data.user?.role === "PORTAL_USER") {
          router.push("/portal");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError("Invalid response from server");
      }
    } catch (e: any) {
      console.error(e);
      // Display the specific error message from backend if available, otherwise default
      setError(e.message || "Invalid Login Id or Password");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full shadow-lg border-muted/60">
      <CardHeader className="space-y-1 text-center">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Welcome back
        </CardTitle>
        <CardDescription>
          Enter your credentials to access the secure portal.
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="grid gap-4">
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
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md text-center">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
          <div className="text-center text-xs text-muted-foreground">
            <a
              href="/forgot-password"
              className="hover:text-primary transition-colors"
            >
              Forgot your password?
            </a>
          </div>
          <div className="text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <a
              href="/register"
              className="hover:text-primary transition-colors"
            >
              Sign up
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
