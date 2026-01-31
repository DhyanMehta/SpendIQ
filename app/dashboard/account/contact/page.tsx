"use client";

import { PageHeader, EmptyState } from "@/components/layout/page-components";
import { Users } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts"
        description="Manage your business contacts and relationships"
        actionLabel="Add Contact"
        onAction={() => console.log("Add contact")}
      />

      <EmptyState
        title="No contacts yet"
        description="Start building your contact list by adding your first customer, vendor, or business partner."
        actionLabel="Add First Contact"
        onAction={() => console.log("Add contact")}
        Icon={Users}
      />
    </div>
  );
}
