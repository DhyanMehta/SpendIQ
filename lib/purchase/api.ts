import { client } from "../api/client";
import {
  CreatePurchaseOrderRequest,
  PurchaseOrder,
  UpdatePurchaseOrderRequest,
  ConfirmPOResponse,
} from "./types";

const BASE_URL = "/purchase/orders";

export const purchaseApi = {
  getAll: async (): Promise<PurchaseOrder[]> => {
    const { data } = await client.get(BASE_URL);
    return data;
  },

  getOne: async (id: string): Promise<PurchaseOrder> => {
    const { data } = await client.get(`${BASE_URL}/${id}`);
    return data;
  },

  create: async (data: CreatePurchaseOrderRequest): Promise<PurchaseOrder> => {
    const { data: res } = await client.post(BASE_URL, data);
    return res;
  },

  update: async (
    id: string,
    data: UpdatePurchaseOrderRequest,
  ): Promise<PurchaseOrder> => {
    const { data: res } = await client.patch(`${BASE_URL}/${id}`, data);
    return res;
  },

  confirm: async (id: string): Promise<ConfirmPOResponse> => {
    const { data } = await client.patch(`${BASE_URL}/${id}/confirm`);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`${BASE_URL}/${id}`);
  },
};
