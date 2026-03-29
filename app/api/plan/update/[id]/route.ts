import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const authHeader = req.headers.get("authorization");

    const { data } = await apiClient.patch(`/plan/update/${id}`, body, {
      headers: {
        Authorization: authHeader,
      },
    });

    return NextResponse.json(data);
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message || "Failed to update plan";
    return NextResponse.json({ message }, { status });
  }
}
