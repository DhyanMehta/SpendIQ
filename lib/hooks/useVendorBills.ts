import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../api/client";

export interface VendorBillLine {
  id?: string;
  productId: string;
  product?: {
    id: string;
    name: string;
  };
  label: string;
  quantity: number;
  priceUnit: number;
  subtotal: number;
  taxRate: number;
  analyticAccountId?: string;
  analyticAccount?: {
    id: string;
    code: string;
    name: string;
  };
}

export interface VendorBill {
  id: string;
  number: string;
  type: string;
  partnerId: string;
  partner: {
    id: string;
    name: string;
  };
  date: string;
  dueDate: string;
  status: "DRAFT" | "POSTED" | "CANCELLED";
  paymentState: "NOT_PAID" | "PARTIAL" | "PAID";
  totalAmount: number;
  taxAmount: number;
  lines: VendorBillLine[];
  purchaseOrderId?: string;
  purchaseOrder?: {
    id: string;
    poNumber: string;
  };
  payments?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorBillDto {
  vendorId: string;
  billDate: Date;
  dueDate: Date;
  purchaseOrderId?: string;
  lines: {
    productId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    analyticalAccountId?: string;
  }[];
}

export interface RegisterPaymentDto {
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  reference?: string;
}

export interface VendorBillFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  vendorId?: string;
  startDate?: string;
  endDate?: string;
}

export function useVendorBills(filters?: VendorBillFilters) {
  return useQuery({
    queryKey: ["vendor-bills", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.search) params.append("search", filters.search);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.vendorId) params.append("vendorId", filters.vendorId);
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);

      const { data } = await client.get(`/vendor-bills?${params.toString()}`);
      return data;
    },
  });
}

export function useVendorBill(id: string) {
  return useQuery({
    queryKey: ["vendor-bill", id],
    queryFn: async () => {
      const { data } = await client.get(`/vendor-bills/${id}`);
      return data as VendorBill;
    },
    enabled: !!id,
  });
}

export function useCreateVendorBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateVendorBillDto) => {
      const { data } = await client.post("/vendor-bills", dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-bills"] });
    },
  });
}

export function useUpdateVendorBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: Partial<CreateVendorBillDto>;
    }) => {
      const { data } = await client.patch(`/vendor-bills/${id}`, dto);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vendor-bills"] });
      queryClient.invalidateQueries({
        queryKey: ["vendor-bill", variables.id],
      });
    },
  });
}

export function usePostVendorBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await client.post(`/vendor-bills/${id}/post`);
      return data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["vendor-bills"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-bill", id] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useRegisterPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: RegisterPaymentDto;
    }) => {
      const { data } = await client.post(`/vendor-bills/${id}/payment`, dto);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vendor-bills"] });
      queryClient.invalidateQueries({
        queryKey: ["vendor-bill", variables.id],
      });
    },
  });
}

export function useDeleteVendorBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await client.delete(`/vendor-bills/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-bills"] });
    },
  });
}
