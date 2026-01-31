"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  ShieldCheck,
  Zap,
  Globe,
  Users,
  LayoutTemplate,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "Visualize your financial health instantly with dynamic charts and customizable KPI dashboards.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    description:
      "Bank-grade encryption and role-based access control to keep your sensitive financial data secure.",
  },
  {
    icon: Zap,
    title: "Smart Automation",
    description:
      "Automate recurring invoices, budget alerts, and approval workflows to save valuable time.",
  },
  {
    icon: Globe,
    title: "Multi-Entity Support",
    description:
      "Manage budgets across multiple cost centers, departments, or subsidiaries from a single view.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Invite team members with specific roles and streamline communication around expenses.",
  },
  {
    icon: LayoutTemplate,
    title: "Intuitive Interface",
    description:
      "A drag-and-drop experience designed for modern finance teams, not just accountants.",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            Everything you need to master your spending
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features packaged in a beautiful, easy-to-use interface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-border/50 bg-background/60 backdrop-blur-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
