import api from "@/lib/api/client";
import { CreateUserRequest, User } from "./types";

export const usersApi = {
  create: async (data: CreateUserRequest): Promise<User> => {
    const response = await api.post("/users", data);
    return response.data;
  },
};
