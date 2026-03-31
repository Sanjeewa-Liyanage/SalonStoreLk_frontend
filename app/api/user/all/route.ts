import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const role = searchParams.get("role");

        const authHeader = req.headers.get("authorization");

        const queryParams = new URLSearchParams();
        if (status) queryParams.append("status", status);
        if (role) queryParams.append("role", role);

        const queryString = queryParams.toString();
        const endpoint = queryString ? `/user/all?${queryString}` : "/user/all";

        const { data } = await apiClient.get(endpoint, {
            headers: {
                Authorization: authHeader,
            },
        });

        return NextResponse.json(data);
    } catch (error: any) {
        const status = error?.response?.status || 500;
        const message = error?.response?.data?.message || "Failed to fetch users";
        return NextResponse.json({ message }, { status });
    }
}
