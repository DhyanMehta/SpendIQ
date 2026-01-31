"use client";

import { PageHeader, EmptyState } from "@/components/layout/page-components";
import { BarChart3 } from "lucide-react";

export default function AnalyticalsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analyticals"
        description="Configure analytical dimensions for detailed financial tracking"
        actionLabel="Add Analytical"
        onAction={() => console.log("Add analytical")}
      />

      <EmptyState
        title="No analyticals configured"
        description="Set up analytical dimensions to track financial data across departments, projects, or custom categories."
        actionLabel="Configure First Analytical"
        onAction={() => console.log("Add analytical")}
        Icon={BarChart3}
      />
    </div>
  );
}
