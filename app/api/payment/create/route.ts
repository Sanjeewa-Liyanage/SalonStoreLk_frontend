import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const authHeader = req.headers.get("authorization");
        const { data } = await apiClient.post("/payments", body, {
            headers: {
                Authorization: authHeader,
            },
        });
        return NextResponse.json(data);
    }catch(error:any){
        const status = error?.response?.status || 500;
        const message = error?.response?.data?.message || "Failed to create payment";
        return NextResponse.json({ message }, { status });
    }
}