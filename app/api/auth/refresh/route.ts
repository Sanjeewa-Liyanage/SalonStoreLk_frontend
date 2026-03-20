import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json({ message: "Missing refresh token" }, { status: 401 });
    }

    const { data } = await apiClient.post(
      "/auth/refresh",
      {},
      {
        headers: {
          Authorization: authHeader,
        },
      }
    );

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message || "Token refresh failed";
    return NextResponse.json({ message }, { status });
  }
}
