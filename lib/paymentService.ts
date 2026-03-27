import axios from "axios";
import { refreshAccessToken } from "./authService";

export async function createPayment(paymentData: any) {
    const token = sessionStorage.getItem("accessToken");
    try {
        const { data } = await axios.post("/api/payment/create", paymentData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return data;
    } catch (error: any) {
        if (error?.response?.status !== 401) throw error;

        const nextAccessToken = await refreshAccessToken();
        const { data } = await axios.post("/api/payment/create", paymentData, {
            headers: { Authorization: `Bearer ${nextAccessToken}` },
        });
        return data;
    }
}

export async function verifyPayment(paymentId: string) {
    const token = sessionStorage.getItem("accessToken");
    try {
        const { data } = await axios.patch("/api/payment/verify", { id: paymentId }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return data;
    } catch (error: any) {
        if (error?.response?.status !== 401) throw error;

        const nextAccessToken = await refreshAccessToken();
        const { data } = await axios.patch("/api/payment/verify", { id: paymentId }, {
            headers: { Authorization: `Bearer ${nextAccessToken}` },
        });
        return data;
    }
}

export async function rejectPayment(paymentId: string, reason: string) {
    const token = sessionStorage.getItem("accessToken");
    try {
        const { data } = await axios.patch("/api/payment/reject", { id: paymentId, reason }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return data;
    } catch (error: any) {
        if (error?.response?.status !== 401) throw error;

        const nextAccessToken = await refreshAccessToken();
        const { data } = await axios.patch("/api/payment/reject", { id: paymentId, reason }, {
            headers: { Authorization: `Bearer ${nextAccessToken}` },
        });
        return data;
    }
}