import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Contact API
export const contactsApi = {
  getAll: async (params?: {
    search?: string;
    type?: string;
    isPortalUser?: boolean;
    status?: string;
  }) => {
    const res = await apiClient.get("/contacts", { params });
    return res.data;
  },
  getOne: async (id: string) => {
    const res = await apiClient.get(`/contacts/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post("/contacts", data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await apiClient.patch(`/contacts/${id}`, data);
    return res.data;
  },
  archive: async (id: string) => {
    const res = await apiClient.delete(`/contacts/${id}`);
    return res.data;
  },
  enablePortal: async (id: string) => {
    const res = await apiClient.post(`/contacts/${id}/portal`);
    return res.data;
  },
};

// Product API
export const productsApi = {
  getAll: async (params?: {
    search?: string;
    categoryId?: string;
    status?: string;
  }) => {
    const res = await apiClient.get("/products", { params });
    return res.data;
  },
  getOne: async (id: string) => {
    const res = await apiClient.get(`/products/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post("/products", data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await apiClient.patch(`/products/${id}`, data);
    return res.data;
  },
  archive: async (id: string) => {
    const res = await apiClient.delete(`/products/${id}`);
    return res.data;
  },
  getCategories: async () => {
    const res = await apiClient.get("/products/categories");
    return res.data;
  },
  createCategory: async (name: string) => {
    const res = await apiClient.post("/products/categories", { name });
    return res.data;
  },
};

// Sales API
export const salesApi = {
  getAll: async (params?: any) => {
    const res = await apiClient.get("/sales", { params });
    return res.data;
  },
  getOne: async (id: string) => {
    const res = await apiClient.get(`/sales/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post("/sales", data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await apiClient.patch(`/sales/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/sales/${id}`);
    return res.data;
  },
  confirm: async (id: string) => {
    const res = await apiClient.post(`/sales/${id}/confirm`);
    return res.data;
  },
  cancel: async (id: string) => {
    const res = await apiClient.post(`/sales/${id}/cancel`);
    return res.data;
  },
  createInvoice: async (id: string) => {
    const res = await apiClient.post(`/sales/${id}/create-invoice`);
    return res.data;
  },
};

// Customer Invoices API
export const invoiceApi = {
  getAll: async (params?: any) => {
    // defaults to type=OUT_INVOICE if not specified backend side, or we filter here
    const res = await apiClient.get("/invoices", { params });
    return res.data;
  },
  getOne: async (id: string) => {
    const res = await apiClient.get(`/invoices/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post("/invoices", data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await apiClient.patch(`/invoices/${id}`, data);
    return res.data;
  },
  post: async (id: string) => {
    const res = await apiClient.post(`/invoices/${id}/post`);
    return res.data;
  },
  registerPayment: async (id: string, data: any) => {
    const res = await apiClient.post(`/invoices/${id}/payment`, data);
    return res.data;
  },
};

// Payments API
export const paymentsApi = {
  getAll: async (params?: any) => {
    const res = await apiClient.get("/payments", { params });
    return res.data;
  },
  getOne: async (id: string) => {
    const res = await apiClient.get(`/payments/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post("/payments", data);
    return res.data;
  },
};

// Budgets API
export const budgetsApi = {
  getAll: async (params?: any) => {
    const res = await apiClient.get("/budgets", { params });
    return res.data;
  },
  getOne: async (id: string) => {
    const res = await apiClient.get(`/budgets/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post("/budgets", data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await apiClient.patch(`/budgets/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/budgets/${id}`);
    return res.data;
  },
};

export { apiClient };
export default apiClient;
