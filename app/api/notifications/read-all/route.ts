import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

export async function PATCH(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");

        const { data } = await apiClient.patch("/notifications/read-all", {}, {
            headers: {
                Authorization: authHeader,
            },
        });

        return NextResponse.json(data ?? { success: true });
    } catch (error: any) {
        const status = error?.response?.status || 500;
        const message = error?.response?.data?.message || "Failed to mark all notifications as read";
        return NextResponse.json({ message }, { status });
    }
}
