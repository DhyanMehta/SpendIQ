"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Package,
  Target,
  CreditCard,
  Building2,
  UserPlus,
  Plus,
  Edit2,
  Shield,
  Lock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useProductCategories,
  useCreateProductCategory,
} from "@/lib/hooks/useProducts";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("users");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userData = await apiRequest("/auth/profile");
        setCurrentUser(userData);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchCurrentUser();
  }, []);

  const isAdmin = currentUser?.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground">
          Configure essential system behavior and master data for Budget &
          Accounting Management
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-8 lg:w-auto">
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="contacts">
            <UserPlus className="h-4 w-4 mr-2" />
            Contacts
          </TabsTrigger>
          <TabsTrigger value="products" disabled={!isAdmin}>
            <Package className="h-4 w-4 mr-2" />
            Products
          </TabsTrigger>
          <TabsTrigger value="categories" disabled={!isAdmin}>
            <Package className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="analytical" disabled={!isAdmin}>
            <Target className="h-4 w-4 mr-2" />
            Analytical
          </TabsTrigger>
          <TabsTrigger value="budget" disabled={!isAdmin}>
            <Target className="h-4 w-4 mr-2" />
            Budget
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="system" disabled={!isAdmin}>
            <Building2 className="h-4 w-4 mr-2" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UsersAccessTab isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <ContactsTab />
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <ProductsTab />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <CategoriesTab />
        </TabsContent>

        <TabsContent value="analytical" className="space-y-4">
          <AnalyticalAccountsTab />
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <BudgetControlTab />
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <PaymentMethodsTab />
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <SystemInfoTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// 1. User & Access Management
function UsersAccessTab({ isAdmin }: { isAdmin: boolean }) {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    // Mock data - replace with API call
    setUsers([
      {
        id: "1",
        name: "Admin User",
        email: "admin@furniture.com",
        loginId: "admin001",
        role: "ADMIN",
      },
      {
        id: "2",
        name: "Vendor User",
        email: "contact@vendor.com",
        loginId: "vendor001",
        role: "VENDOR",
      },
      {
        id: "3",
        name: "Customer User",
        email: "contact@customer.com",
        loginId: "customer001",
        role: "CUSTOMER",
      },
    ]);
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User & Access Management</CardTitle>
          <CardDescription>
            Manage user roles and permissions. Admin can manage all data, Portal
            Users have read-only access.
          </CardDescription>
        </div>
        {isAdmin && (
          <Button size="sm">
            <UserPlus className="mr-2 h-4 w-4" /> Add User
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2 flex items-center">
            <Shield className="h-4 w-4 mr-2" /> Role Permissions
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Admin:</strong> Full access to products, budgets,
              analytical accounts, and all configurations
            </div>
            <div>
              <strong>Portal User:</strong> Read-only access to their own
              contact data and linked invoices
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Login ID</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.loginId}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === "ADMIN" ? "default" : "secondary"}
                  >
                    {user.role === "ADMIN" ? "Admin" : "Portal User"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {isAdmin && (
                    <Button variant="ghost" size="sm">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// 2. Contacts Configuration
function ContactsTab() {
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    // Mock data
    setContacts([
      {
        id: "1",
        name: "ABC Retailers",
        type: "CUSTOMER",
        email: "abc@retailers.com",
        hasPortalAccess: true,
      },
      {
        id: "2",
        name: "Wood Suppliers Ltd",
        type: "VENDOR",
        email: "sales@woodsuppliers.com",
        hasPortalAccess: false,
      },
    ]);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Configuration</CardTitle>
        <CardDescription>
          Fixed contact types: Customer and Vendor. Optional portal user mapping
          (one contact = one portal user).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-muted rounded-lg space-y-2 text-sm">
          <div>
            <strong>Contact Types:</strong> Customer, Vendor
          </div>
          <div>
            <strong>Portal Mapping:</strong> One portal user can link to only
            one contact
          </div>
          <div>
            <strong>Purpose:</strong> Enable portal users to view their own
            invoices and orders
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contact Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Portal Access</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">{contact.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{contact.type}</Badge>
                </TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>
                  {contact.hasPortalAccess ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Enabled
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <XCircle className="h-3 w-3" /> Disabled
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// 3. Products Setup
function ProductsTab() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    setProducts([
      {
        id: "1",
        name: "Teak Wood",
        category: "Raw Material",
        businessNature: "EXPENSE",
        analyticalAccount: "Production",
        locked: true,
      },
      {
        id: "2",
        name: "Office Chair",
        category: "Finished Furniture",
        businessNature: "REVENUE",
        analyticalAccount: "Sales Reporting",
        locked: true,
      },
    ]);
  }, []);

  const categories = [
    "Raw Material",
    "Finished Furniture",
    "Marketing Service",
    "Transport Service",
    "Admin Service",
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Product Configuration</CardTitle>
          <CardDescription>
            Fixed categories with mandatory Business Nature and default
            Analytical Account
          </CardDescription>
        </div>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-muted rounded-lg space-y-2 text-sm">
          <div>
            <strong>Categories:</strong> {categories.join(", ")}
          </div>
          <div>
            <strong>Business Nature:</strong> Expense or Revenue (locked after
            creation)
          </div>
          <div>
            <strong>Analytical Account:</strong> Required for budget tracking
          </div>
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500">
            <Lock className="h-4 w-4" />
            <span>
              Business Nature cannot be changed after product creation
            </span>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Business Nature</TableHead>
              <TableHead>Analytical Account</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      product.businessNature === "EXPENSE"
                        ? "destructive"
                        : "default"
                    }
                    className="gap-1"
                  >
                    {product.locked && <Lock className="h-3 w-3" />}
                    {product.businessNature}
                  </Badge>
                </TableCell>
                <TableCell>{product.analyticalAccount}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// 4. Analytical Accounts
function AnalyticalAccountsTab() {
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    setAccounts([
      { id: "1", name: "Production", status: "ACTIVE" },
      { id: "2", name: "Marketing", status: "ACTIVE" },
      { id: "3", name: "Transport", status: "ACTIVE" },
      { id: "4", name: "Admin", status: "ACTIVE" },
      { id: "5", name: "Sales Reporting", status: "ACTIVE" },
    ]);
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Analytical Accounts (Cost Centers)</CardTitle>
          <CardDescription>
            Basic cost centers for tracking budget vs actuals. No financial
            values stored.
          </CardDescription>
        </div>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" /> Add Account
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-muted rounded-lg space-y-2 text-sm">
          <div>
            <strong>Purpose:</strong> Link budgets to actual expenses from
            invoices
          </div>
          <div>
            <strong>No Financials:</strong> Only used for categorization and
            reporting
          </div>
          <div>
            <strong>Budget Tracking:</strong> Compare planned vs actual by cost
            center
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium">{account.name}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      account.status === "ACTIVE" ? "default" : "secondary"
                    }
                  >
                    {account.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// 5. Budget Control Settings
function BudgetControlTab() {
  const [budgetPeriod, setBudgetPeriod] = useState("MONTHLY");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Control Configuration</CardTitle>
        <CardDescription>
          Configure budget periods and control rules for expense tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-muted rounded-lg space-y-3 text-sm">
          <h4 className="font-medium mb-2">Budget Rules</h4>
          <div>
            ✓ Budgets apply only to <strong>Expense-type products</strong>
          </div>
          <div>
            ✓ Budget checking happens only on{" "}
            <strong>posted purchase invoices</strong>
          </div>
          <div>
            ✓ <strong>Approved budgets cannot be edited</strong>
          </div>
          <div>
            ✓ Sales transactions <strong>never impact budgets</strong>
          </div>
          <div>✓ Payments do not affect budget tracking</div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="budgetPeriod">Budget Period</Label>
            <Select value={budgetPeriod} onValueChange={setBudgetPeriod}>
              <SelectTrigger id="budgetPeriod">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="YEARLY">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Selected: {budgetPeriod === "MONTHLY" ? "Monthly" : "Yearly"}{" "}
              budget tracking
            </p>
          </div>

          <div className="p-4 border rounded-lg space-y-2">
            <h4 className="font-medium">Budget vs Actual Flow</h4>
            <div className="text-sm space-y-1 text-muted-foreground">
              <div>
                1. Budget stores planned expense limits per analytical account
              </div>
              <div>
                2. Posted purchase invoices contribute to actual amounts
              </div>
              <div>3. Analytical accounts link budget with invoice actuals</div>
              <div>4. System alerts when actuals exceed budget limits</div>
            </div>
          </div>

          <Button>Save Budget Configuration</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// 6. Payment Methods
function PaymentMethodsTab() {
  const paymentMethods = ["Cash", "Bank", "UPI"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>
          Allowed payment methods. Payments do not affect budgets.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-muted rounded-lg space-y-2 text-sm">
          <div>
            <strong>Available Methods:</strong> {paymentMethods.join(", ")}
          </div>
          <div>
            <strong>Budget Impact:</strong> Payments do not affect budget
            tracking
          </div>
          <div>
            <strong>Tracking:</strong> Only posted invoices impact budget vs
            actual
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {paymentMethods.map((method) => (
            <Card key={method}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {method}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="default">Enabled</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// 7. System Information
function SystemInfoTab() {
  const [companyName, setCompanyName] = useState("Furniture Manufacturing Co.");
  const [financialYear, setFinancialYear] = useState("2025-2026");

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Information</CardTitle>
        <CardDescription>
          Basic company and system configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="financialYear">Financial Year</Label>
            <Input
              id="financialYear"
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              placeholder="YYYY-YYYY"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" value="INR" disabled />
            <p className="text-sm text-muted-foreground">
              Default currency: Indian Rupee (INR)
            </p>
          </div>

          <Button>Save System Information</Button>
        </div>

        <div className="p-4 border rounded-lg space-y-2">
          <h4 className="font-medium">System Constraints</h4>
          <div className="text-sm space-y-1 text-muted-foreground">
            <div>• Budget stores planned limits only</div>
            <div>• Actual amounts come from posted invoice lines</div>
            <div>• Analytical accounts link budget and actuals</div>
            <div>• Sales transactions never impact budgets</div>
            <div>• Business Nature locked after product creation</div>
            <div>• One portal user per contact maximum</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 3.5 Categories Management
function CategoriesTab() {
  const { data: categories, isLoading } = useProductCategories();
  const { mutate: createCategory, isPending: isCreating } =
    useCreateProductCategory();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;
    createCategory(newCategoryName, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setNewCategoryName("");
      },
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Product Categories</CardTitle>
          <CardDescription>
            Manage product categories for better organization and filtering
          </CardDescription>
        </div>
        <Button size="sm" onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-muted rounded-lg space-y-2 text-sm">
          <div>
            <strong>Purpose:</strong> Organize products into logical groups
          </div>
          <div>
            <strong>Usage:</strong> Categories can be assigned to products
            during creation or editing
          </div>
          <div>
            <strong>Filtering:</strong> Use categories to filter products on the
            products page
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading categories...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Products Count</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories && categories.length > 0 ? (
                categories.map((category: any) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell>
                      {category._count?.products || 0} products
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <div className="text-muted-foreground">
                      No categories yet. Create your first category to get
                      started.
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Product Category</DialogTitle>
            <DialogDescription>
              Add a new category to organize your products.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateCategory();
                }}
                className="col-span-3"
                placeholder="e.g., Electronics, Furniture"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim() || isCreating}
            >
              {isCreating ? "Creating..." : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
