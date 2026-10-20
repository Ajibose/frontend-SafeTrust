import { proxyToBackend } from "@/lib/api/proxy";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToBackend(
    request,
    `/api/reservations/${encodeURIComponent(id)}/cancel`,
    { method: "POST" },
  );
}
