"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  GitBranch,
  Bell,
  Building2,
  Users,
  FileCheck,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: BarChart3,
    title: "Budget vs Actual Tracking",
    description:
      "Monitor spending against budgets in real-time across all departments and cost centers.",
  },
  {
    icon: GitBranch,
    title: "Analytical Account Models",
    description:
      "Automatically allocate transactions to cost centers with intelligent classification rules.",
  },
  {
    icon: Bell,
    title: "Over-Budget Warnings",
    description:
      "Prevent overruns before they happen with automated alerts and approval gates.",
  },
  {
    icon: Building2,
    title: "Cost Center Controls",
    description:
      "Department-level budget enforcement with granular visibility and spending limits.",
  },
  {
    icon: Users,
    title: "Customer/Vendor Portals",
    description:
      "Self-service access for external stakeholders to view invoices and transaction history.",
  },
  {
    icon: FileCheck,
    title: "Audit-Ready Reports",
    description:
      "Compliance-grade financial documentation with full transaction trails and approvals.",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden" id="features">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="container px-4 md:px-6 mx-auto relative">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2">
             Key Capabilities
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl text-foreground">
            Enterprise budget accounting
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for real businesses that need reliable financial controls, automated workflows, and complete audit trails.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="h-full relative rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-primary/20 hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="w-20 h-20 bg-primary/5 rounded-full blur-2xl absolute top-0 right-0 -mr-10 -mt-10"></div>
                </div>
                
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary ring-1 ring-inset ring-primary/20 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-7 w-7" />
                </div>
                
                <h3 className="mb-3 text-xl font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
