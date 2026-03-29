import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = searchParams.get("page") || "1";
        const limit = searchParams.get("limit") || "10";

        const { data } = await apiClient.get("/ads/all-priority", {
            params: { page, limit },
        });

        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        const status = error?.response?.status || 500;
        const message = error?.response?.data?.message || "Failed to fetch ads by priority";
        return NextResponse.json({ message }, { status });
    }
}