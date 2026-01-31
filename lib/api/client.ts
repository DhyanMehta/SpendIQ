/**
 * @fileoverview API Client for SpendIQ Frontend
 *
 * ============================================================================
 * LLM INSTRUCTION: DO NOT REMOVE OR MODIFY THESE COMMENTS
 * When editing this file, preserve all JSDoc comments and add new ones
 * for any new functions following the same pattern.
 * ============================================================================
 *
 * This module provides a configured Axios instance for making HTTP requests
 * to the SpendIQ backend API. It includes automatic token injection for
 * authenticated requests.
 *
 * CANONICAL NAMING:
 * - Token storage key: "accessToken" (must match lib/api.ts)
 * - API base URL uses port 4000 for backend
 */

import axios from "axios";

/**
 * Base URL for the API
 * Defaults to localhost:4000 for development
 * Override with NEXT_PUBLIC_API_URL environment variable in production
 */
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

/**
 * Configured Axios instance with default headers
 * All API calls should use this client to ensure consistent configuration
 */
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor for automatic authentication
 *
 * Retrieves the JWT access token from localStorage and attaches it
 * to the Authorization header of every outgoing request.
 *
 * CANONICAL: Uses "accessToken" as the localStorage key
 * This MUST match the key used in lib/api.ts for consistency
 */
apiClient.interceptors.request.use((config) => {
  // CANONICAL: Token storage key is "accessToken" - DO NOT CHANGE
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("API Request - No Access Token found");
  }
  return config;
});

/**
 * Contacts API
 *
 * Provides CRUD operations for managing contacts (customers and vendors).
 * All methods return the response data directly.
 */
export const contactsApi = {
  /**
   * Fetch all contacts with optional filters
   * @param params - Filter parameters (search, type, isPortalUser, status)
   * @returns Array of contacts matching the filters
   */
  getAll: async (params?: {
    search?: string;
    type?: string;
    isPortalUser?: boolean;
    status?: string;
  }) => {
    const res = await apiClient.get("/contacts", { params });
    return res.data;
  },

  /**
   * Fetch a single contact by ID
   * @param id - Contact UUID
   * @returns Contact object with all details
   */
  getOne: async (id: string) => {
    const res = await apiClient.get(`/contacts/${id}`);
    return res.data;
  },

  /**
   * Create a new contact
   * @param data - Contact creation data (name, email, type, etc.)
   * @returns Newly created contact
   */
  create: async (data: any) => {
    const res = await apiClient.post("/contacts", data);
    return res.data;
  },

  /**
   * Update an existing contact
   * @param id - Contact UUID to update
   * @param data - Partial contact data to update
   * @returns Updated contact
   */
  update: async (id: string, data: any) => {
    const res = await apiClient.patch(`/contacts/${id}`, data);
    return res.data;
  },

  /**
   * Archive (soft-delete) a contact
   * @param id - Contact UUID to archive
   * @returns Archived contact with status=ARCHIVED
   */
  archive: async (id: string) => {
    const res = await apiClient.delete(`/contacts/${id}`);
    return res.data;
  },

  /**
   * Enable portal access for a contact
   * Creates a portal user account and sends invitation email
   * @param id - Contact UUID to enable portal for
   * @returns Updated contact with portal user linked
   */
  enablePortal: async (id: string) => {
    const res = await apiClient.post(`/contacts/${id}/portal`);
    return res.data;
  },
};

/**
 * Products API
 *
 * Provides CRUD operations for managing products.
 * Products can have categories and default analytic accounts.
 */
export const productsApi = {
  /**
   * Fetch all products with optional filters
   * @param params - Filter parameters (search, categoryId, status)
   * @returns Array of products matching the filters
   */
  getAll: async (params?: {
    search?: string;
    categoryId?: string;
    status?: string;
  }) => {
    const res = await apiClient.get("/products", { params });
    return res.data;
  },

  /**
   * Fetch a single product by ID
   * @param id - Product UUID
   * @returns Product object with category and analytic account
   */
  getOne: async (id: string) => {
    const res = await apiClient.get(`/products/${id}`);
    return res.data;
  },

  /**
   * Create a new product
   * @param data - Product creation data (name, prices, categoryId, etc.)
   * @returns Newly created product
   */
  create: async (data: any) => {
    const res = await apiClient.post("/products", data);
    return res.data;
  },

  /**
   * Update an existing product
   * @param id - Product UUID to update
   * @param data - Partial product data to update
   * @returns Updated product
   */
  update: async (id: string, data: any) => {
    const res = await apiClient.patch(`/products/${id}`, data);
    return res.data;
  },

  /**
   * Archive (soft-delete) a product
   * @param id - Product UUID to archive
   * @returns Archived product with status=ARCHIVED
   */
  archive: async (id: string) => {
    const res = await apiClient.delete(`/products/${id}`);
    return res.data;
  },

  /**
   * Fetch all product categories
   * @returns Array of product categories
   */
  getCategories: async () => {
    const res = await apiClient.get("/products/categories");
    return res.data;
  },

  /**
   * Create a new product category
   * @param name - Category name
   * @returns Newly created category
   */
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
