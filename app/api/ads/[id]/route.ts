import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

// GET /api/ads/[id] — fetches ads by salon ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader =
      req.headers.get("authorization") ?? req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 }
      );
    }
    const headers = { Authorization: authHeader };

    const { data } = await apiClient.get(`/ads/${id}`, { headers });
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const message =
      error?.response?.data?.message || "Failed to fetch ads";
    return NextResponse.json({ message }, { status });
  }
}