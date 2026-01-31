import { Status } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant={status === Status.ACTIVE ? "default" : "secondary"}>
      {status === Status.ACTIVE ? "Active" : "Archived"}
    </Badge>
  );
}
