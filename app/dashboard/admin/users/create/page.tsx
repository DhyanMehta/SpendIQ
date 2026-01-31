import { CreateUserForm } from "@/components/users/CreateUserForm";
import { UserPlus } from "lucide-react";

export default function CreateUserPage() {
  return (
    <div className="container mx-auto max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <UserPlus className="h-8 w-8 text-primary" />
          Create User
        </h1>
        <p className="text-muted-foreground mt-2">
          Create new internal users with strict role-based access control.
          Portal users will have limited access to their own records only.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <CreateUserForm />
      </div>
    </div>
  );
}
