import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

const PLAN_ENDPOINTS: Record<string, string> = {
    all: "/plan/all",
    usage:"/plan",
    "by-id": "/plan"   // will append /:id below
}

export async function GET(req:NextRequest){
    try{
        const authHeader = req.headers.get("Authorization");
        const headers = authHeader ? { Authorization: authHeader } : undefined;

        const { searchParams } = req.nextUrl;
        const type = searchParams.get("type") ?? "all";
        const id = searchParams.get("id");

        const basePath = PLAN_ENDPOINTS[type];
        if (!basePath) {
            return NextResponse.json({ message: "Invalid plan type" }, { status: 400 });
        }
        const endpoint = type === "by-id" && id ? `${basePath}/${id}` : basePath;
        
        const response = await apiClient.get(endpoint, { headers });
        return NextResponse.json(response.data);
    }catch(error:any){
        console.error("Error fetching plan data:", error);
        return NextResponse.json({ error: "Failed to fetch plan data" }, { status: 500 });
    }
}