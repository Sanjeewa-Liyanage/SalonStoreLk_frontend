import { NextRequest,NextResponse } from "next/server";
import apiClient from "@/lib/axios";

export async function POST(request:NextRequest){
    try{
        const token = request.headers.get("authorization") || request.headers.get("Authorization");
        if(!token){
            return NextResponse.json({ message: "Forgot password token is required" }, { status: 400 });
        }
        const body = await request.json();
        const {data} = await apiClient.post("/auth/password-reset", body, {
            headers: {
                Authorization: token,
            },
        });
        return NextResponse.json(data, { status: 200 });
    }catch(error:any){
        const status = error?.response?.status || 500;  
        const message = error?.response?.data?.message || "Failed to reset password";
        return NextResponse.json({ message }, { status });
    }
}