import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
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

export { apiClient };
export default apiClient;
