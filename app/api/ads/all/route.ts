import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

function getAuthorizationHeader(req: NextRequest) {
    return req.headers.get("authorization") ?? req.headers.get("Authorization");
}

export async function GET(req: NextRequest) {
    try {
        const authHeader = getAuthorizationHeader(req);
        if (!authHeader) {
            return NextResponse.json(
                { message: "Authorization header is required" },
                { status: 401 }
            );
        }

        const { data } = await apiClient.get("/ads/admin/all", {
            headers: { Authorization: authHeader },
        });

        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        const status = error?.response?.status || 500;
        const message = error?.response?.data?.message || "Failed to fetch all ads";
        return NextResponse.json({ message }, { status });
    }
}
