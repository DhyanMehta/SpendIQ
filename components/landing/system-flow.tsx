"use client";

import { motion } from "framer-motion";
import { FileText, Filter, BarChart2, Bell } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Capture",
    description: "Invoice and purchase order entry",
  },
  {
    icon: Filter,
    title: "Classify",
    description: "Auto analytical allocation",
  },
  {
    icon: BarChart2,
    title: "Monitor",
    description: "Budget vs actual comparison",
  },
  {
    icon: Bell,
    title: "Alert",
    description: "Over-budget warnings",
  },
];

export function SystemFlow() {
  return (
    <section className="py-24 bg-muted/20 border-y border-border">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground mb-4">
            Automated Financial Logic
          </h2>
          <p className="text-lg text-muted-foreground">
            From purchase request to final audit, your data flows through a rigorous control system.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Connecting Line Background */}
            <div className="hidden md:block absolute top-[2.5rem] left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="relative flex flex-col items-center text-center group"
              >
                <div className="relative z-10 mb-6 transition-transform duration-300 group-hover:scale-110">
                  <div className="w-20 h-20 rounded-2xl bg-card border-2 border-border shadow-lg flex items-center justify-center text-primary group-hover:border-primary/50 group-hover:shadow-primary/20 transition-all">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-md border-2 border-background">
                    {index + 1}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {step.title}
                </h3>
                <div className="h-1 w-12 bg-primary/20 rounded-full mb-3 mx-auto" />
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
