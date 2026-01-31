"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, Mail, Eye, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/api";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: "CUSTOMER" | "VENDOR";
  isPortalUser: boolean;
  status: "ACTIVE" | "ARCHIVED";
  imageUrl?: string;
  createdAt: string;
}

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [portalFilter, setPortalFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("ACTIVE");

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (search) params.append("search", search);
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (portalFilter !== "all") params.append("isPortalUser", portalFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await apiRequest(`/contacts?${params.toString()}`);
      setContacts(response.data || response);
    } catch (error) {
      console.error("Failed to load contacts:", error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, typeFilter, portalFilter, statusFilter]);

  const handleRowClick = (id: string) => {
    router.push(`/dashboard/account/contact/${id}`);
  };

  const getTypeBadgeColor = (type: string) => {
    return type === "CUSTOMER"
      ? "bg-blue-100 text-blue-800"
      : "bg-purple-100 text-purple-800";
  };

  const getStatusBadgeColor = (status: string) => {
    return status === "ACTIVE"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contact Master</h1>
          <p className="text-muted-foreground mt-1">
            Manage customers and vendors
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/account/contact/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Contact
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Status:</span>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "ACTIVE" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("ACTIVE")}
              >
                Active
              </Button>
              <Button
                variant={statusFilter === "ARCHIVED" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("ARCHIVED")}
              >
                Archived
              </Button>
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                All
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="w-16">Photo</TableHead>
                <TableHead>Contact Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Portal Access</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Mail className="h-12 w-12 mb-4 opacity-50" />
                      <p className="text-lg font-medium">No contacts found</p>
                      <p className="text-sm mt-1">
                        Get started by creating your first contact
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() =>
                          router.push("/dashboard/account/contact/new")
                        }
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Contact
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => (
                  <TableRow
                    key={contact.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(contact.id)}
                  >
                    <TableCell>
                      {contact.imageUrl ? (
                        <img
                          src={contact.imageUrl}
                          alt={contact.name}
                          className="w-10 h-10 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {contact.name}
                    </TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {contact.phone || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeBadgeColor(contact.type)}>
                        {contact.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {contact.isPortalUser ? (
                        <Badge className="bg-emerald-100 text-emerald-800">
                          <Eye className="mr-1 h-3 w-3" />
                          Yes
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          No
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(contact.status)}>
                        {contact.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(contact.id);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Results Count */}
      {!loading && contacts.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Showing {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
