"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-32 lg:pt-32 lg:pb-40">
      <div className="container px-6 md:px-12 lg:px-24 mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left space-y-8 max-w-2xl lg:max-w-none">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                Master your <br />
                <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                  Business Spend
                </span>
              </h1>
              <p className="mt-6 text-xl text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
                Stop overspending before it happens. Real-time budget controls, automated approvals, and crystal-clear visibility for modern finance teams.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link href="/register">
                <Button
                  size="lg"
                  className="h-14 px-8 text-base rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105"
                >
                  Get Started<ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="pt-4 flex items-center justify-center lg:justify-start gap-8 text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold overflow-hidden" >
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="User" />
                    </div>
                  ))}
                </div>
                <div className="text-sm font-medium">Trusted by 500+ teams</div>
              </div>
            </motion.div>
          </div>

          {/* Dashboard Preview Mockup */}
          <motion.div
            className="flex-1 relative w-full max-w-xl lg:max-w-none perspective-1000"
            initial={{ opacity: 0, rotateX: 10, y: 40 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="relative rounded-2xl border border-white/20 bg-background/50 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/10 dark:ring-white/5 transform transition-transform hover:scale-[1.01] duration-500">
              {/* Window Controls */}
              <div className="h-12 border-b border-white/10 bg-muted/20 flex items-center px-6 gap-2 backdrop-blur-md">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="ml-4 h-6 w-full max-w-xs bg-muted/30 rounded-full text-[10px] flex items-center px-3 text-muted-foreground">spendiq.app/dashboard</div>
              </div>

              {/* Content Preview */}
              <div className="p-8 space-y-6 bg-gradient-to-br from-background/80 to-muted/20 min-h-[400px]">
                {/* Header Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Total Budget", val: "₹1,20,500", color: "text-foreground" },
                    { label: "Spent", val: "₹84,200", color: "text-primary" },
                    { label: "Remaining", val: "₹36,300", color: "text-green-500" }
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-card/60 border border-white/10 p-4 shadow-sm backdrop-blur-md"
                    >
                      <div className="text-xs font-medium text-muted-foreground mb-1">{stat.label}</div>
                      <div className={`text-xl font-bold ${stat.color}`}>{stat.val}</div>
                    </div>
                  ))}
                </div>

                {/* Main Chart Area */}
                <div className="h-64 rounded-xl bg-card/40 border border-white/10 p-6 shadow-inner relative flex items-end justify-between gap-4">
                   {/* Grid lines */}
                   <div className="absolute inset-x-6 top-6 bottom-6 flex flex-col justify-between pointer-events-none opacity-20">
                      <div className="w-full h-px bg-muted-foreground" />
                      <div className="w-full h-px bg-muted-foreground" />
                      <div className="w-full h-px bg-muted-foreground" />
                      <div className="w-full h-px bg-muted-foreground" />
                   </div>
                   
                  {[35, 55, 45, 70, 60, 85, 50, 65].map((h, i) => (
                    <motion.div
                      key={i}
                      className="w-full bg-gradient-to-t from-primary/80 to-purple-500/80 rounded-t-lg relative group"
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                    >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg pointer-events-none">
                            ₹{h}k
                        </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Decorative elements behind mockup */}
            <div className="absolute -z-10 -bottom-10 -right-10 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl opacity-50 animate-pulse" />
            <div className="absolute -z-10 -top-10 -left-10 w-64 h-64 bg-primary/30 rounded-full blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '1s' }} />
          </motion.div>
        </div>
      </div>

      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-0 w-[50%] h-[50%] bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-[-10%] w-[40%] h-[40%] bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-[20%] left-[20%] w-[20%] h-[20%] bg-primary/5 rounded-full blur-[80px]" />
      </div>
    </section>
  );
}
