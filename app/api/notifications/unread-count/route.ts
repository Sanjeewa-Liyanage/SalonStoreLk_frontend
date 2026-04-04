import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        const endpoint = `/notifications/unread-count`;

        const { data } = await apiClient.get(endpoint, {
            headers: {
                Authorization: authHeader
            }
        });

        return NextResponse.json(data);
    } catch (error: any) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || "An unexpected error occurred while fetching the unread count.";
        return NextResponse.json({ message }, { status });
    }
}
