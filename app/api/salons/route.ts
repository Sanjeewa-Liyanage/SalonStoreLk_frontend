// app/api/salons/route.ts
import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

const SALON_ENDPOINTS: Record<string, string> = {
  all: "/salon/all",
  active: "/salon/active",
  pending:"/salon/pending",
  "by-id": "/salon",   // will append /:id below
  "by-owner": "/salon/owner",
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

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const headers = authHeader ? { Authorization: authHeader } : undefined;

    const { searchParams } = req.nextUrl;
    const action = searchParams.get("action");
    const id = searchParams.get("id");

    if (!action || !id) {
      return NextResponse.json(
        { message: "Action and ID are required" },
        { status: 400 }
      );
    }

    const validActions = ["activate", "suspend", "unsuspend", "reject"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { message: "Invalid action. Must be one of: activate, suspend, unsuspend, reject" },
        { status: 400 }
      );
    }

    const requestBody = await req.json().catch(() => ({}));
    const payload =
      (action === "suspend" || action === "reject") && typeof requestBody?.reason === "string"
        ? { reason: requestBody.reason.trim() }
        : {};

    const endpoint = `/salon/${action}/${id}`;
    const { data } = await apiClient.patch(endpoint, payload, { headers });
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message || "Failed to perform salon action";
    return NextResponse.json({ message }, { status });
  }
}