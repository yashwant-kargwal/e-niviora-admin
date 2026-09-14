import { api } from "./api";
import type {
  AdminSignupDto,
  AdminSignupResponse,
  LoginDto,
  LoginResponse,
  User,
} from "@/types/auth";

export const authService = {
  async login(payload: LoginDto) {
    const response = await api.post<LoginResponse>("/auth/login", payload);

    return response.data;
  },

  async signupAdmin(payload: AdminSignupDto) {
    const response = await api.post<AdminSignupResponse>(
      "/auth/signup/admin",
      payload,
    );

    return response.data;
  },

  async me() {
    const response = await api.get<{ user: User }>("/auth/me");

    return response.data.user;
  },

  async logout() {
    await api.post("/auth/logout");
  },
};
