"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useContacts } from "@/lib/hooks/useContacts";
import { DataTable } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Plus, Search } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

interface Contact {
  id: string;
  name: string;
  email: string;
  type: "CUSTOMER" | "VENDOR";
  isPortalUser: boolean;
  status: "ACTIVE" | "ARCHIVED";
}

export default function ContactsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data: contacts, isLoading } = useContacts({ search });

  const columns: ColumnDef<Contact>[] = [
    {
      accessorKey: "name",
      header: "Contact Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <Badge variant={type === "CUSTOMER" ? "default" : "outline"}>
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "isPortalUser",
      header: "Portal Access",
      cell: ({ row }) => {
        const hasPortal = row.getValue("isPortalUser");
        return <span className="text-sm">{hasPortal ? "Yes" : "No"}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground mt-1">
            Manage customers, vendors, and business partners
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/account/contact/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Contact
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={contacts || []}
        loading={isLoading}
        onRowClick={(row) =>
          router.push(`/dashboard/account/contact/${row.id}`)
        }
      />
    </div>
  );
}
