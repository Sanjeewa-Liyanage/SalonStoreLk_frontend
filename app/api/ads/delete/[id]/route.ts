import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

export async function DELETE(req: NextRequest,
{ params }: { params: Promise<{ id: string }> }) {
    try{
        const {id} = await params;
       
        const authHeader = req.headers.get("authorization");
        const {data} = await apiClient.delete(`/ads/${id}`,{
            headers: {
                Authorization: authHeader,
            },
        });
        return NextResponse.json(data)
    }catch(error:any){
        const status = error?.response?.status || 500;
        const message = error?.response?.data?.message || "Failed to delete ad";
        return NextResponse.json({ message }, { status });
    }
    
}