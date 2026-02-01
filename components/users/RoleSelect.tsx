import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ControllerRenderProps } from "react-hook-form";
import { Role } from "@/lib/users/types";

interface RoleSelectProps {
  field: ControllerRenderProps<any, "role">;
}

export function RoleSelect({ field }: RoleSelectProps) {
  return (
    <FormItem>
      <FormLabel>Role</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value={Role.ADMIN}>Admin</SelectItem>
          <SelectItem value={Role.VENDOR}>Vendor</SelectItem>
          <SelectItem value={Role.CUSTOMER}>Customer</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
}
