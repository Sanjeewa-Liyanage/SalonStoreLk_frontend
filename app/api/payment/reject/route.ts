import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

export async function PATCH(req: NextRequest) {
    try {
        const { id, reason } = await req.json();
        const authHeader = req.headers.get("authorization");
        const { data } = await apiClient.patch(`/payments/${id}/reject`, { reason }, {
            headers: {
                Authorization: authHeader,
            },
        });
        return NextResponse.json(data ?? { success: true });
    } catch (error: any) {
        const status = error?.response?.status || 500;
        const message = error?.response?.data?.message || "Failed to reject payment";
        return NextResponse.json({ message }, { status });
    }
}
