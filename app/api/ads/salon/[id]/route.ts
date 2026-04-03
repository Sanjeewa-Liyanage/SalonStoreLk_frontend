import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

// GET /api/ads/salon/:id -> /ads/salon/:id
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

    const { data } = await apiClient.get(`/ads/salon/${id}`, {
      headers: { Authorization: authHeader },
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message || "Failed to fetch ads by salon";
    return NextResponse.json({ message }, { status });
  }
}
