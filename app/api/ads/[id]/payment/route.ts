import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

// GET /api/ads/[id]/payment — fetches payment details for an ad
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    const headers = authHeader ? { Authorization: authHeader } : undefined;

    const { id } = await params;

    const { data } = await apiClient.get(`/ads/${id}/payment`, { headers });
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const message =
      error?.response?.data?.message || "Failed to fetch ad payment details";
    return NextResponse.json({ message }, { status });
  }
}
