import type { Booking, CreateBookingPayload, ApiResponse } from "@/types";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

async function request<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: "Lỗi kết nối server" };
  }
}

export const bookingApi = {
  create: (payload: CreateBookingPayload) =>
    request<Booking>("/api/booking", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getById: (id: string) => request<Booking>(`/api/booking/${id}`),

  getByCode: (code: string) => request<Booking>(`/api/booking/code/${code}`),

  update: (id: string, data: Partial<Booking>) =>
    request<Booking>(`/api/booking/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  cancel: (id: string) =>
    request<{ success: boolean }>(`/api/booking/${id}`, { method: "DELETE" }),

  adminList: (params: Record<string, string | number> = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString();
    return request<{ bookings: Booking[]; pagination: unknown }>(
      `/api/admin/bookings?${query}`
    );
  },
};