import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BudgetWarning as BudgetWarningType } from "@/lib/purchase/types";

interface BudgetWarningProps {
  warnings: BudgetWarningType[];
}

export function BudgetWarning({ warnings }: BudgetWarningProps) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {warnings.map((w, idx) => (
        <Alert
          key={idx}
          variant="destructive"
          className="bg-orange-50 border-orange-200 text-orange-800"
        >
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-900 font-semibold">
            Budget Warning
          </AlertTitle>
          <AlertDescription>
            Line Item for <strong>{w.analytic || "Unknown Analytic"}</strong>:{" "}
            {w.message}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
