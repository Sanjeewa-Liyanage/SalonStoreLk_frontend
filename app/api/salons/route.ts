// app/api/salons/route.ts
import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

const SALON_ENDPOINTS: Record<string, string> = {
  all: "/salon/all",
  active: "/salon/active",
  "by-id": "/salon",   // will append /:id below
};

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const headers = authHeader ? { Authorization: authHeader } : undefined;

    const { searchParams } = req.nextUrl;
    const type = searchParams.get("type") ?? "all";
    const id = searchParams.get("id");

    const basePath = SALON_ENDPOINTS[type];
    if (!basePath) {
      return NextResponse.json({ message: "Invalid salon type" }, { status: 400 });
    }

    const endpoint = type === "by-id" && id ? `${basePath}/${id}` : basePath;

    const { data } = await apiClient.get(endpoint, { headers });
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message || "Failed to fetch salons";
    return NextResponse.json({ message }, { status });
  }
}