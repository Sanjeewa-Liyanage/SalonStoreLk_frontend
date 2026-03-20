import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data } = await apiClient.post("/auth/login", body);
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message || "Login request failed";
    return NextResponse.json({ message }, { status });
  }
}