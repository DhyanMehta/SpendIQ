"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear authentication tokens from localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    // Clear cookies by setting them to expire
    document.cookie =
      "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Clear any session data
    sessionStorage.clear();

    // Redirect to login page
    router.push("/login");
  };

  useEffect(() => {
    // Auto-logout after 2 seconds
    const timer = setTimeout(() => {
      handleLogout();
    }, 2000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <LogOut className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Logging Out</CardTitle>
          <CardDescription>
            Please wait while we securely sign you out of your account
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Clearing session data...</span>
          </div>

          <div className="w-full space-y-2">
            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary animate-pulse"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <Button onClick={handleLogout} variant="outline" className="w-full">
            Logout Now
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            You will be redirected to the login page automatically
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
