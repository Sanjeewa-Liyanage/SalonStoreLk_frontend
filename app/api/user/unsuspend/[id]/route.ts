import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const authHeader = req.headers.get("authorization");
        
        const { data } = await apiClient.patch(`/user/unsuspend/${id}`, {}, {
            headers: {
                Authorization: authHeader,
            },
        });
        return NextResponse.json(data ?? { success: true });
    } catch (error: any) {
        console.error("[Next.js Proxy] Unsuspend User Error:", error?.response?.data || error.message);
        
        const status = error?.response?.status || 500;
        const message = error?.response?.data?.message || error?.message || "Failed to unsuspend user";
        const details = error?.response?.data || null;
        
        return NextResponse.json({ message, details }, { status });
    }
}
