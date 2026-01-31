"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export function PageHeader({
  title,
  description,
  actionLabel,
  onAction,
  children,
}: PageHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
        {actionLabel && onAction && (
          <Button onClick={onAction} className="gap-2">
            <Plus className="h-4 w-4" />
            {actionLabel}
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  Icon?: React.ComponentType<{ className?: string }>;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  Icon,
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        {Icon && (
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Icon className="h-8 w-8 text-primary" />
          </div>
        )}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
          {description}
        </p>
        {actionLabel && onAction && (
          <Button onClick={onAction} className="gap-2">
            <Plus className="h-4 w-4" />
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
