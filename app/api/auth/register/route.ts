import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Forward the registration data to your backend
    const { data } = await apiClient.post("/auth/register", body);
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message || "Registration failed";
    return NextResponse.json({ message }, { status });
  }
}