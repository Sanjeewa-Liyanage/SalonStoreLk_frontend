import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/axios";

const VALID_AD_STATUSES = ["PENDING_APPROVAL", "APPROVED", "REJECTED"] as const;
type AdStatus = typeof VALID_AD_STATUSES[number];

function isValidStatus(status: string): status is AdStatus {
    return VALID_AD_STATUSES.includes(status as AdStatus);
}

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("Authorization");
        const headers = authHeader ? { Authorization: authHeader } : undefined;
        const { searchParams } = new URL(req.url);
        const pathSegments = req.nextUrl.pathname.split('/').filter(Boolean);

        // pathSegments: ['api', 'ads', param, subParam?]
        const param = pathSegments[2];
        const subParam = pathSegments[3];

        // GET /api/ads/all → /ads/admin/all
        if (param === 'all') {
            const response = await apiClient.get('/ads/admin/all', { headers });
            return NextResponse.json(response.data);
        }

        // GET /api/ads/status/:status → /ads/status/:status
        // Only allows: PENDING_APPROVAL, APPROVED, REJECTED
        if (param === 'status') {
            if (!subParam) {
                return NextResponse.json(
                    { error: 'Status value is required' },
                    { status: 400 }
                );
            }
            if (!isValidStatus(subParam)) {
                return NextResponse.json(
                    { error: `Invalid status. Must be one of: ${VALID_AD_STATUSES.join(', ')}` },
                    { status: 400 }
                );
            }
            const response = await apiClient.get(
                `/ads/status/${subParam}`,
                { headers }
            );
            return NextResponse.json(response.data);
        }

        // GET /api/ads/:id/payment → /ads/:id/payment
        if (param && subParam === 'payment') {
            const response = await apiClient.get(
                `/ads/${param}/payment`,
                { headers }
            );
            return NextResponse.json(response.data);
        }

        // GET /api/ads/:salonId → /ads/:salonId
        if (param) {
            const response = await apiClient.get(
                `/ads/${param}`,
                { headers }
            );
            return NextResponse.json(response.data);
        }

        return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });

    } catch (error: any) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message;
        return NextResponse.json({ error: message }, { status });
    }
}