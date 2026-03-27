import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;
        const authHeader = req.headers.get("authorization");
        const { data } = await apiClient.patch(`/ads/approve/${id}`, {}, {
            headers: {
                Authorization: authHeader,
            },
        });
        return NextResponse.json(data ?? { success: true });
    } catch (error: any) {
        const status = error?.response?.status || 500;
        const message = error?.response?.data?.message || "Failed to approve ad";
        return NextResponse.json({ message }, { status });
    }
}
