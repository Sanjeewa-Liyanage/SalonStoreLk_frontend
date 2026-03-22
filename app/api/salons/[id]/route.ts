// app/api/salons/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("Authorization");
    const headers = authHeader ? { Authorization: authHeader } : undefined;

    if (!id) {
      return NextResponse.json(
        { message: "Salon ID is required" },
        { status: 400 }
      );
    }

    const { data } = await apiClient.get(`/salon/${id}`, { headers });
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message || "Failed to fetch salon details";
    return NextResponse.json({ message }, { status });
  }
}
