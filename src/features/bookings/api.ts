import { auth } from "@/lib/firebase";
import type { EscrowData } from "@/types/dashboard";
import { mapReservation, type ReservationDto } from "./map-reservation";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new ApiError("Not authenticated", 401);
    res = await fetch(url, {
      ...init,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Network error", 0);
  }

  const data = await res.json().catch(() => null);
  if (res.ok && (data === null || typeof data !== "object")) {
    throw new ApiError("Invalid response", res.status, "INVALID_RESPONSE");
  }
  if (!res.ok) {
    throw new ApiError(
      data?.error ?? `Request failed with status ${res.status}`,
      res.status,
      typeof data?.error === "string" ? data.error : undefined,
    );
  }
  return data as T;
}

export async function listBookings(): Promise<EscrowData[]> {
  const data = await request<{ reservations: ReservationDto[] }>(
    "/api/bookings",
  );
  if (!Array.isArray(data.reservations)) {
    throw new ApiError("Invalid response", 200, "INVALID_RESPONSE");
  }
  return data.reservations.map(mapReservation);
}

export async function cancelBooking(
  bookingId: string,
  reason?: string,
): Promise<EscrowData> {
  const dto = await request<ReservationDto>(
    `/api/bookings/${encodeURIComponent(bookingId)}/cancel`,
    {
      method: "POST",
      body: JSON.stringify(reason ? { reason } : {}),
    },
  );
  return mapReservation(dto);
}
