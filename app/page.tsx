import { Hero } from "@/components/landing/hero";
import { ProblemSolution } from "@/components/landing/problem-solution";
import { Features } from "@/components/landing/features";
import { SystemFlow } from "@/components/landing/system-flow";
import { Trust } from "@/components/landing/trust";
import { Footer } from "@/components/landing/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      {/* Global Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-25 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <Building2 className="h-5 w-5" />
            </div>
            SpendIQ
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium hover:underline underline-offset-4 hidden sm:block text-muted-foreground"
            >
              Sign in
            </Link>
            <Link href="/register">
              <Button size="sm" className="shadow-lg shadow-primary/20">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Hero />
        <ProblemSolution />
        <Features />
        <SystemFlow />
        <Trust />
        
      </main>

      <Footer />
    </div>
  );
}
