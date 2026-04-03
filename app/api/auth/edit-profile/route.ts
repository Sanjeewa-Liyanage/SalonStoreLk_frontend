import { NextRequest,NextResponse } from "next/server";
import apiClient from "@/lib/axios";

export async function POST(req:NextRequest){
    try{
        const authHeader = req.headers.get("Authorization");
        const headers = authHeader ? { Authorization: authHeader } : undefined;

        const body = await req.json().catch(() => ({}));

        const { data } = await apiClient.post("/auth/update-profile", body, { headers });
        return NextResponse.json(data, { status: 200 });
    }catch(error:any){
const status = error?.response?.status || 500;
        const message = error?.response?.data?.message || "Failed to update profile";
        return NextResponse.json({ message }, { status });    }

}