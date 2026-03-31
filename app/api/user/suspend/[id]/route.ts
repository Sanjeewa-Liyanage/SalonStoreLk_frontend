import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const authHeader = req.headers.get("authorization");
        const body = await req.json();
        
        const { data } = await apiClient.patch(`/user/suspend/${id}`, { reason: body.reason }, {
            headers: {
                Authorization: authHeader,
            },
        });
        return NextResponse.json(data ?? { success: true });
    } catch (error: any) {
        console.error("[Next.js Proxy] Suspend User Error:", error?.response?.data || error.message);
        
        const status = error?.response?.status || 500;
        const message = error?.response?.data?.message || error?.message || "Failed to suspend user";
        const details = error?.response?.data || null;
        
        return NextResponse.json({ message, details }, { status });
    }
}
