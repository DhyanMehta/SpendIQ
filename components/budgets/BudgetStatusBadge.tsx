import { Badge } from "@/components/ui/badge";

interface BudgetStatusBadgeProps {
  status: "DRAFT" | "CONFIRMED" | "REVISED" | "ARCHIVED";
}

export default function BudgetStatusBadge({ status }: BudgetStatusBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "REVISED":
        return "bg-yellow-100 text-yellow-800";
      case "ARCHIVED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return <Badge className={getStatusColor()}>{status}</Badge>;
}
