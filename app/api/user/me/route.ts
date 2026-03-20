import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const { data } = await apiClient.get("/user/me", {
    headers: { Authorization: authHeader },
  });
  return NextResponse.json(data, { status: 200 });
}
