import axios from "axios";
import { refreshAccessToken } from "./authService";

export async function createPayment(paymentData: any){
    const token = sessionStorage.getItem("accessToken");
    try{
        const { data } = await axios.post("/api/payment/create", paymentData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return data;
    }catch(error:any){
        if (error?.response?.status !== 401) throw error;

        const nextAccessToken = await refreshAccessToken();
        const { data } = await axios.post("/api/payment/create", paymentData, {
            headers: { Authorization: `Bearer ${nextAccessToken}` },
        });
        return data;
    }
}