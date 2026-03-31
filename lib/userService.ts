import axios from "axios";
import { refreshAccessToken } from "./authService";

function resolveAccessToken(accessToken?: string) {
    if (accessToken) return accessToken;
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("accessToken");
}

export async function getAllUsers(filters?: { status?: string; role?: string }, accessToken?: string) {
    const token = resolveAccessToken(accessToken);
    if (!token) throw new Error("No access token found.");

    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append("status", filters.status);
    if (filters?.role) queryParams.append("role", filters.role);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/user/all?${queryString}` : "/api/user/all";

    try {
        const { data } = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return data;
    } catch (error: any) {
        if (error?.response?.status !== 401) throw error;
        
        // Attempt to refresh token if we get unauthorized
        const nextAccessToken = await refreshAccessToken();
        const { data } = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${nextAccessToken}` },
        });
        return data;
    }
}

export async function suspendUser(userId: string, reason: string) {
    const token = resolveAccessToken();
    if (!token) throw new Error("No access token found.");
    
    try {
        const { data } = await axios.patch(`/api/user/suspend/${userId}`, { reason }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return data;
    } catch (error: any) {
        if (error?.response?.status !== 401) throw error;
        
        const nextAccessToken = await refreshAccessToken();
        const { data } = await axios.patch(`/api/user/suspend/${userId}`, { reason }, {
            headers: { Authorization: `Bearer ${nextAccessToken}` },
        });
        return data;
    }
}

export async function unsuspendUser(userId: string) {
    const token = resolveAccessToken();
    if (!token) throw new Error("No access token found.");
    
    try {
        const { data } = await axios.patch(`/api/user/unsuspend/${userId}`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return data;
    } catch (error: any) {
        if (error?.response?.status !== 401) throw error;
        
        const nextAccessToken = await refreshAccessToken();
        const { data } = await axios.patch(`/api/user/unsuspend/${userId}`, {}, {
            headers: { Authorization: `Bearer ${nextAccessToken}` },
        });
        return data;
    }
}
