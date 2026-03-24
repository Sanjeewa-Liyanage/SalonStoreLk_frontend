import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ salonid: string }> }
) {
    try{
        const { salonid } = await params;
        const authHeader = req.headers.get("authorization");
        const headers = authHeader ? { Authorization: authHeader } : undefined;
        if (!salonid) {
            return NextResponse.json({ message: "Salon ID is required" }, { status: 400 });
        }
        const {data} = await apiClient.get(`ads/${salonid}`, { headers });
        return NextResponse.json(data, { status: 200 });
    }catch(error:any){
        const status = error?.response?.status || 500;
        const message = error?.response?.data?.message || "Failed to fetch ads for salon";
        return NextResponse.json({ message }, { status });
    }

}
 