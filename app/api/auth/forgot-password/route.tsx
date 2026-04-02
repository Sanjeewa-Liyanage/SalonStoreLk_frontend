import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

export async function POST(request: NextRequest) {
    try{    
        const body = await request.json();
        const { data } = await apiClient.post("/auth/forgot-password", body);
        return NextResponse.json(data, { status: 200 });

    }catch(error:any){
        const status = error?.response?.status || 500;
        const message = error?.response?.data?.message || "Forgot password request failed";
        return NextResponse.json({ message }, { status });
    }
}