import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        // Handle both Promise and synchronous object depending on Next.js version
        const resolvedParams = await params;
        const { id } = resolvedParams;
        
        const authHeader = req.headers.get("authorization");

        const { data } = await apiClient.get(`/user/${id}`, {
            headers: {
                Authorization: authHeader,
            },
        });

        return NextResponse.json(data);
    } catch (error: any) {
        const status = error?.response?.status || 500;
        const message = error?.response?.data?.message || "Failed to fetch user details";
        return NextResponse.json({ message }, { status });
    }
}
