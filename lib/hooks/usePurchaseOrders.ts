import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../api/client";

export interface PurchaseOrderLine {
  id?: string;
  productId: string;
  product?: {
    id: string;
    name: string;
  };
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  analyticalAccountId?: string;
  analyticalAccount?: {
    id: string;
    code: string;
    name: string;
  };
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendor: {
    id: string;
    name: string;
  };
  orderDate: string;
  status: "DRAFT" | "CONFIRMED" | "CANCELLED";
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  lines: PurchaseOrderLine[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseOrderDto {
  vendorId: string;
  orderDate: Date;
  lines: {
    productId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    analyticalAccountId?: string;
  }[];
}

export interface PurchaseOrderFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  vendorId?: string;
}

export function usePurchaseOrders(filters?: PurchaseOrderFilters) {
  return useQuery({
    queryKey: ["purchase-orders", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.search) params.append("search", filters.search);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.vendorId) params.append("vendorId", filters.vendorId);

      const { data } = await client.get(
        `/purchase-orders?${params.toString()}`,
      );
      return data;
    },
  });
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: ["purchase-order", id],
    queryFn: async () => {
      const { data } = await client.get(`/purchase-orders/${id}`);
      return data as PurchaseOrder;
    },
    enabled: !!id,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreatePurchaseOrderDto) => {
      const { data } = await client.post("/purchase-orders", dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: Partial<CreatePurchaseOrderDto>;
    }) => {
      const { data } = await client.patch(`/purchase-orders/${id}`, dto);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({
        queryKey: ["purchase-order", variables.id],
      });
    },
  });
}

export function useConfirmPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await client.post(`/purchase-orders/${id}/confirm`);
      return data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-order", id] });
    },
  });
}

export function useCancelPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await client.post(`/purchase-orders/${id}/cancel`);
      return data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-order", id] });
    },
  });
}

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await client.delete(`/purchase-orders/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
}
