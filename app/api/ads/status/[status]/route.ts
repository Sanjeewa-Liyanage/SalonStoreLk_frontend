import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

const VALID_AD_STATUSES = ["PENDING_APPROVAL", "APPROVED", "REJECTED"] as const;
type AdStatus = (typeof VALID_AD_STATUSES)[number];

function isValidStatus(status: string): status is AdStatus {
    return VALID_AD_STATUSES.includes(status as AdStatus);
}

function getAuthorizationHeader(req: NextRequest) {
    return req.headers.get("authorization") ?? req.headers.get("Authorization");
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ status: string }> }
) {
    try {
        const authHeader = getAuthorizationHeader(req);
        if (!authHeader) {
            return NextResponse.json(
                { message: "Authorization header is required" },
                { status: 401 }
            );
        }

        const { status } = await params;
        const normalizedStatus = status.toUpperCase();

        if (!isValidStatus(normalizedStatus)) {
            return NextResponse.json(
                {
                    message: `Invalid status. Must be one of: ${VALID_AD_STATUSES.join(", ")}`,
                },
                { status: 400 }
            );
        }

        const { data } = await apiClient.get(`/ads/status/${normalizedStatus}`, {
            headers: { Authorization: authHeader },
        });

        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        const status = error?.response?.status || 500;
        const message = error?.response?.data?.message || "Failed to fetch ads by status";
        return NextResponse.json({ message }, { status });
    }
}
