import { NextResponse } from "next/server";
import apiClient from "@/lib/axios";

// GET /api/ads/details/[id] -> /ads/:id (public endpoint)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data } = await apiClient.get(`/ads/${id}`);
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const message =
      error?.response?.data?.message || "Failed to fetch ad details";
    return NextResponse.json({ message }, { status });
  }
}