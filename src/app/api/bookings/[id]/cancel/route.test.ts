/**
 * @jest-environment node
 */
import { POST } from "./route";

describe("/api/bookings/[id]/cancel route", () => {
  const originalFetch = global.fetch;
  const originalBackendUrl = process.env.BACKEND_URL;

  beforeEach(() => {
    process.env.BACKEND_URL = "https://backend.safetrust.test";
    global.fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "b 1", status: "cancelled" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
  });

  afterAll(() => {
    global.fetch = originalFetch;
    if (originalBackendUrl !== undefined) {
      process.env.BACKEND_URL = originalBackendUrl;
    } else {
      delete process.env.BACKEND_URL;
    }
  });

  it("forwards a POST to the reservation cancel endpoint", async () => {
    const request = new Request("http://localhost/api/bookings/b%201/cancel", {
      method: "POST",
      headers: { authorization: "Bearer t" },
      body: JSON.stringify({ reason: "plans changed" }),
    });

    const res = await POST(request, { params: Promise.resolve({ id: "b 1" }) });

    expect(global.fetch).toHaveBeenCalledWith(
      "https://backend.safetrust.test/api/reservations/b%201/cancel",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ reason: "plans changed" }),
      }),
    );
    expect(res.status).toBe(200);
  });
});
