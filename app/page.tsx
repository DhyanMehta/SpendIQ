import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Command } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      {/* Global Navbar for LP */}
      <header className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="bg-primary text-primary-foreground p-1 rounded-md">
              <Command className="h-5 w-5" />
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
              className="text-sm font-medium hover:underline underline-offset-4 hidden sm:block"
            >
              Log in
            </Link>
            <Link href="/dashboard">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Hero />
        <Features />

        {/* CTA Section */}
        <section className="py-24 bg-primary text-primary-foreground text-center">
          <div className="container px-4 mx-auto max-w-4xl space-y-8">
            <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">
              Ready to take control of your finances?
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Join thousands of modern finance teams using SpendIQ to drive
              growth.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="h-12 px-8 text-base"
            >
              Start your 14-day free trial
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
