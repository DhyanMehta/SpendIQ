"use client";

import { motion } from "framer-motion";
import { AlertTriangle, TrendingDown, Building2 } from "lucide-react";

const problems = [
  {
    icon: AlertTriangle,
    title: "Budget overruns discovered too late",
    description:
      "By the time you notice spending is out of control, the damage is already done.",
    solution:
      "Real-time tracking with automated alerts the moment budgets approach their limits.",
  },
  {
    icon: TrendingDown,
    title: "Spreadsheets break at scale",
    description:
      "Manual tracking becomes impossible as your organization grows and complexity increases.",
    solution:
      "Centralized analytical accounting that automatically allocates transactions to cost centers.",
  },
  {
    icon: Building2,
    title: "No cost center visibility",
    description:
      "Department managers lack insight into their own spending, making budget control impossible.",
    solution:
      "Department-level budget controls with granular visibility and approval workflows.",
  },
];

export function ProblemSolution() {
  return (
    <section className="py-24 bg-background relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-red-500/5 rounded-full blur-[100px] -z-10" />
      
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl text-foreground mb-6">
            Why traditional budgets fail
          </h2>
          <p className="text-xl text-muted-foreground">
            Spreadsheets and legacy ERPs weren't built for modern speed.
          </p>
        </div>

        <div className="space-y-16 max-w-5xl mx-auto">
          {problems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className={`flex flex-col lg:flex-row items-center gap-8 ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Problem Side (Text Only) */}
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center justify-center p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 mb-2">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Arrow Connection */}
              <div className="hidden lg:flex items-center justify-center text-muted-foreground/30">
                 <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-8 h-8"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
              </div>

              {/* Solution Side (Card) */}
              <div className="flex-1 w-full lg:w-auto">
                <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm font-semibold text-primary">
                      Solution
                    </span>
                  </div>
                  <p className="text-foreground font-medium leading-relaxed">
                    {item.solution}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
