import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

interface Payment {
  id: string;
  number: string;
  partnerId: string;
  date: string;
  amount: number;
  paymentMethod: string;
  status: string;
  partner?: any;
  allocations?: any[];
}

interface UnpaidBill {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  amountTotal: number;
  paidAmount: number;
  outstanding: number;
}

interface CreatePaymentDto {
  vendorId: string;
  paymentDate: Date;
  paymentMethod: string;
  paymentAmount: number;
  allocations: Array<{
    billId: string;
    allocatedAmount: number;
  }>;
}

export function usePayments(filters?: {
  page?: number;
  limit?: number;
  search?: string;
  vendorId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ["payments", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.search) params.append("search", filters.search);
      if (filters?.vendorId) params.append("vendorId", filters.vendorId);
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);
      if (filters?.status) params.append("status", filters.status);

      const response = await apiClient.get<{
        data: Payment[];
        pagination: any;
      }>(`/payments?${params.toString()}`);
      return response.data;
    },
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: ["payment", id],
    queryFn: async () => {
      if (!id || id === "create") return null;
      const response = await apiClient.get<Payment>(`/payments/${id}`);
      return response.data;
    },
    enabled: !!id && id !== "create",
  });
}

export function useUnpaidBills(vendorId: string) {
  return useQuery({
    queryKey: ["unpaid-bills", vendorId],
    queryFn: async () => {
      if (!vendorId) return [];
      const response = await apiClient.get<UnpaidBill[]>(
        `/payments/unpaid-bills/${vendorId}`
      );
      return response.data;
    },
    enabled: !!vendorId,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreatePaymentDto) => {
      const response = await apiClient.post<Payment>("/payments", dto);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: Partial<CreatePaymentDto>;
    }) => {
      const response = await apiClient.patch<Payment>(`/payments/${id}`, dto);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment", variables.id] });
    },
  });
}

export function usePostPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<Payment>(`/payments/${id}/post`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment", id] });
      queryClient.invalidateQueries({ queryKey: ["vendor-bills"] });
      queryClient.invalidateQueries({ queryKey: ["unpaid-bills"] });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/payments/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}
