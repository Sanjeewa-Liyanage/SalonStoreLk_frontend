import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data } = await apiClient.post("/auth/login", body);
  return NextResponse.json(data, { status: 200 });
}