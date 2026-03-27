import axios from "axios";
import { refreshAccessToken } from "./authService";

type AdStatus = "PENDING_APPROVAL" | "APPROVED" | "REJECTED";

function resolveAccessToken(accessToken?: string) {
    if (accessToken) return accessToken;
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("accessToken");
}

function normalizeStatus(status: string): AdStatus {
    const normalized = status.toUpperCase();
    if (normalized === "PENDING_APPROVAL" || normalized === "APPROVED" || normalized === "REJECTED") {
        return normalized;
    }
    throw new Error("Invalid ad status. Use PENDING_APPROVAL, APPROVED, or REJECTED.");
}



export async function createAd(adData: any) {
    const token = sessionStorage.getItem("accessToken");
    try {
        const { data } = await axios.post("/api/ads/create", adData, {
            headers: { Authorization: `Bearer ${token}` },


        })
        return data;
    } catch (error: any) {
        if (error?.response?.status !== 401) throw error;
        const nextAccessToken = await refreshAccessToken();
        const { data } = await axios.post("/api/ads/create", adData, {
            headers: { Authorization: `Bearer ${nextAccessToken}` },
        })
        return data;
    }

}
export async function adsBySalon(salonId: string, accessToken: string) {
    try {
        const { data } = await axios.get(`/api/ads/${salonId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return data;

    } catch (error: any) {
        if (error?.response?.status !== 401) throw error;
        const nextAccessToken = await refreshAccessToken();
        const { data } = await axios.get(`/api/ads/${salonId}`, {
            headers: { Authorization: `Bearer ${nextAccessToken}` },
        });
        return data;
    }
}

export async function getAllAds(accessToken?: string) {
    const token = resolveAccessToken(accessToken);
    if (!token) throw new Error("No access token found.");
    try {
        const headers = { Authorization: `Bearer ${token}` };
        const { data } = await axios.get(`/api/ads/all`, { headers });
        return data;
    } catch (error: any) {
        if (error?.response?.status !== 401) throw error;
        const nextAccessToken = await refreshAccessToken();
        const { data } = await axios.get(`/api/ads/all`, {
            headers: { Authorization: `Bearer ${nextAccessToken}` },
        });
        return data;
    }
}

export async function getAdsAndPayment(adId: string, accessToken: string) {
    try {
        const { data } = await axios.get(`/api/ads/${adId}/payment`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return data;
    } catch (error: any) {
        if (error?.response?.status !== 401) throw error;
        const nextAccessToken = await refreshAccessToken();
        const { data } = await axios.get(`/api/ads/${adId}/payment`, {
            headers: { Authorization: `Bearer ${nextAccessToken}` },
        });
        return data;
    }
}

export async function getAdsByStatus(status: string, accessToken?: string) {
    const token = resolveAccessToken(accessToken);
    if (!token) throw new Error("No access token found.");
    const normalizedStatus = normalizeStatus(status);
    try {
        const headers = { Authorization: `Bearer ${token}` };
        const { data } = await axios.get(`/api/ads/status/${normalizedStatus}`, {
            headers,
        });
        return data;
    } catch (error: any) {
        if (error?.response?.status !== 401) throw error;
        const nextAccessToken = await refreshAccessToken();
        const { data } = await axios.get(`/api/ads/status/${normalizedStatus}`, {
            headers: { Authorization: `Bearer ${nextAccessToken}` },
        });
        return data;
    }
}
export async function approveAd(adId: string) {
    const token = sessionStorage.getItem("accessToken")
    try {
        const { data } = await axios.patch(`/api/ads/approve/${adId}`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return data;
    } catch (error: any) {
        if (error?.response?.status !== 401) throw error;

        const nextAccessToken = await refreshAccessToken();
        const { data } = await axios.patch(`/api/ads/approve/${adId}`, {}, {
            headers: { Authorization: `Bearer ${nextAccessToken}` },
        });
        return data;
    }
}
export async function rejectAd(adId: string, reason: string) {
    const token = sessionStorage.getItem("accessToken")
    try {
        const { data } = await axios.patch(`/api/ads/reject/${adId}`, { reason }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return data;
    } catch (error: any) {
        if (error?.response?.status !== 401) throw error;

        const nextAccessToken = await refreshAccessToken();
        const { data } = await axios.patch(`/api/ads/reject/${adId}`, { reason }, {
            headers: { Authorization: `Bearer ${nextAccessToken}` },
        });
        return data;
    }
}