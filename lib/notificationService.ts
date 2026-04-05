import axios from "axios"
import { refreshAccessToken } from "./authService";

function resolveAccessToken(accessToken?: string) {
    if (accessToken) return accessToken;
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("accessToken");
}

export async function getAllNotifications(accessToken?: string) {
    const token = resolveAccessToken(accessToken);
    if (!token) throw new Error("No access token found.");

    try {
        const { data } = await axios.get("/api/notifications", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return data;
    } catch (error: any) {
        if (error?.response?.status !== 401) throw error;

        const nextAccessToken = await refreshAccessToken();
        const { data } = await axios.get("/api/notifications", {
            headers: { Authorization: `Bearer ${nextAccessToken}` },
        });
        return data;
    }
}

export async function getUnreadNotificationCount(accessToken?: string) {
    const token = resolveAccessToken(accessToken);
    if (!token) throw new Error("No access token found.");

    try {
        const { data } = await axios.get("/api/notifications/unread-count", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return data;
    } catch (error: any) {
        if (error?.response?.status !== 401) throw error;

        const nextAccessToken = await refreshAccessToken();
        const { data } = await axios.get("/api/notifications/unread-count", {
            headers: { Authorization: `Bearer ${nextAccessToken}` },
        });
        return data;
    }
}

export async function markNotificationAsRead(notificationId: string, accessToken?: string) {
    const token = resolveAccessToken(accessToken);
    if (!token) throw new Error("No access token found.");

    try {
        const { data } = await axios.patch(`/api/notifications/${notificationId}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return data;
    } catch (error: any) {
        if (error?.response?.status !== 401) throw error;

        const nextAccessToken = await refreshAccessToken();
        const { data } = await axios.patch(`/api/notifications/${notificationId}/read`, {}, {
            headers: { Authorization: `Bearer ${nextAccessToken}` },
        });
        return data;
    }
}

export async function markAllNotificationsAsRead(accessToken?: string) {
    const token = resolveAccessToken(accessToken);
    if (!token) throw new Error("No access token found.");

    try {
        const { data } = await axios.patch("/api/notifications/read-all", {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return data;
    } catch (error: any) {
        if (error?.response?.status !== 401) throw error;

        const nextAccessToken = await refreshAccessToken();
        const { data } = await axios.patch("/api/notifications/read-all", {}, {
            headers: { Authorization: `Bearer ${nextAccessToken}` },
        });
        return data;
    }
}
