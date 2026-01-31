"use client";

import { PageHeader, EmptyState } from "@/components/layout/page-components";
import { Sparkles } from "lucide-react";

export default function AutoAnalyticPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Auto Analytic Model"
        description="Automate analytical distribution with intelligent models"
        actionLabel="Create Model"
        onAction={() => console.log("Create model")}
      />

      <EmptyState
        title="No automation models"
        description="Create smart rules to automatically distribute transactions across analytical dimensions based on predefined criteria."
        actionLabel="Create First Model"
        onAction={() => console.log("Create model")}
        Icon={Sparkles}
      />
    </div>
  );
}
