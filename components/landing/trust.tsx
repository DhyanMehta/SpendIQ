"use client";

import { motion } from "framer-motion";
import { Shield, Lock, CheckCircle, TrendingUp } from "lucide-react";

const trustSignals = [
  {
    icon: Shield,
    title: "Built for real businesses",
    description:
      "Enterprise-grade architecture designed for reliability and scale.",
  },
  {
    icon: Lock,
    title: "Data security",
    description: "Bank-level encryption with role-based access controls.",
  },
  {
    icon: CheckCircle,
    title: "Audit compliance",
    description:
      "Complete transaction trails and approval workflows for auditors.",
  },
  {
    icon: TrendingUp,
    title: "Proven reliability",
    description: "Production-tested financial controls you can depend on.",
  },
];

export function Trust() {
  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background border-t border-border">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl text-foreground mb-6">
            Enterprise-grade Standard
          </h2>
          <p className="text-xl text-muted-foreground">
            We take performance, security, and compliance seriously.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {trustSignals.map((signal, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-card border border-border/50 p-6 rounded-2xl hover:bg-card/80 transition-colors text-center shadow-lg shadow-black/5"
            >
              <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 text-primary">
                <signal.icon className="h-8 w-8" />
              </div>
              
              <h3 className="font-bold text-lg mb-3">{signal.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{signal.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
