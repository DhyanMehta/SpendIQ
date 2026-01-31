"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-32 sm:pt-32 sm:pb-40 lg:pt-36 lg:pb-44">
      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-blue-600 pb-2">
                Control Your Spend <br />
                <span className="text-foreground">Master Your Growth</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Enterprise-grade budgeting and expense tracking for modern
                teams. Gain real-time visibility, enforce controls, and drive
                profitability with SpendIQ&apos;s intuitive financial operating
                system.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="h-12 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
                >
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base"
              >
                <PlayCircle className="mr-2 h-4 w-4" /> Watch Demo
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-4 flex items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-slate-200 border-2 border-background flex items-center justify-center text-[10px] font-bold"
                  >
                    U{i}
                  </div>
                ))}
              </div>
              <p>Trusted by 500+ finance teams</p>
            </motion.div>
          </div>

          {/* 3D Visual */}
          <motion.div
            className="flex-1 relative w-full max-w-xl lg:max-w-none perspective-1000"
            initial={{ opacity: 0, rotateY: -15, scale: 0.9 }}
            animate={{ opacity: 1, rotateY: -6, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ perspective: "1000px" }}
          >
            <div className="relative rounded-xl border border-border/50 bg-card/50 backdrop-blur shadow-2xl overflow-hidden transform rotate-y-[-6deg] hover:rotate-y-0 transition-transform duration-500 ease-out-expo">
              {/* Mockup functionality - Simulating Dashboard Preview */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-blue-500/5 pointer-events-none" />

              {/* Header Mockup */}
              <div className="h-12 border-b bg-background/50 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
              </div>

              {/* Content Mockup */}
              <div className="p-6 space-y-6 bg-background/40 min-h-[400px]">
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-24 rounded-lg bg-muted/50 border border-white/5 animate-pulse"
                      style={{ animationDelay: `${i * 100}ms` }}
                    />
                  ))}
                </div>
                <div className="h-64 rounded-lg bg-muted/30 border border-white/5 flex items-end p-4 gap-2">
                  {[40, 70, 45, 90, 60, 80, 50, 85].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary/20 rounded-t-sm"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Decorational Glow */}
            <div className="absolute -inset-4 bg-primary/20 blur-3xl -z-10 rounded-full opacity-50" />
          </motion.div>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>
    </section>
  );
}
