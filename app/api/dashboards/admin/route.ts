import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        
        const response = await apiClient.get('/dashboard/admin/overview', {
            headers: {
                ...(authHeader && { Authorization: authHeader })
            }
        });

        return NextResponse.json(
            {
                success: true,
                data: response.data,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Admin Dashboard Error:", error.response?.data || error.message);
        
        return NextResponse.json(
            {
                success: false,
                message: error.response?.data?.message || "Failed to fetch dashboard data",
                error: error.message,
            },
            { status: error.response?.status || 500 }
        );
    }
}