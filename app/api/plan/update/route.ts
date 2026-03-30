import { NextRequest,NextResponse } from "next/server";
import apiClient from "@/lib/axios";

export async function PATCH(_req: NextRequest) {
    return NextResponse.json(
        { message: "Missing plan id. Use /api/plan/update/:id" },
        { status: 400 }
    );
}