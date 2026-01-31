import { client } from "@/lib/api/client";
import { CreateVendorBillDto } from "@/app/api/src/modules/purchase/dto/create-vendor-bill.dto"; // Assuming shared type or redefine
// Actually we shouldn't import from app/api in frontend usually if they are separate updates, but here it's monorepo style?
// Let's redefine or use any for DTO to avoid path issues if client/server are distinct builds.
// Better to define types in lib/purchase/types.ts

import { VendorBill, BudgetWarning } from "./types";

interface PostResponse {
  bill: VendorBill;
  budgetWarnings: BudgetWarning[];
}

export const billApi = {
  getAll: async (): Promise<VendorBill[]> => {
    return client.get("/purchase/bills");
  },

  getOne: async (id: string): Promise<VendorBill> => {
    return client.get(`/purchase/bills/${id}`);
  },

  create: async (data: any): Promise<VendorBill> => {
    return client.post("/purchase/bills", data);
  },

  // Post/Confirm Bill
  post: async (id: string): Promise<PostResponse> => {
    return client.post(`/purchase/bills/${id}/post`, {});
  },
};
