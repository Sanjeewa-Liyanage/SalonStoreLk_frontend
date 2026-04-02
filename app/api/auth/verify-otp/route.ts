import { NextRequest,NextResponse } from "next/server";
import apiClient from "@/lib/axios";

export async function POST(request: NextRequest) {
    try {
        const forgotPasswordToken = request.headers.get("authorization") || request.headers.get("Authorization");
        if (!forgotPasswordToken) {
            return NextResponse.json({ message: "Forgot password token is required" }, { status: 400 });
        }
        const body = await request.json();
        const { data } = await apiClient.post("/auth/verify-otp", body, {
            headers: {
                Authorization: forgotPasswordToken,
            },
        });
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        const status = error?.response?.status || 500;
        const message = error?.response?.data?.message || "Failed to verify OTP";
        return NextResponse.json({ message }, { status });
    }
}