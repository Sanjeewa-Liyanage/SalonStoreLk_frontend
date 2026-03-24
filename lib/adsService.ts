import axios from "axios";
import { refreshAccessToken } from "./authService";




export async function createAd(adData: any){
    const token = sessionStorage.getItem("accessToken");
    try{
        const {data} = await axios.post("/api/ads/create", adData, {
            headers: { Authorization: `Bearer ${token}` },


        })
        return data;
    }catch(error:any){
        if (error?.response?.status !== 401) throw error;
        const nextAccessToken = await refreshAccessToken();
        const {data} = await axios.post("/api/ads/create", adData, {
            headers: { Authorization: `Bearer ${nextAccessToken}` },
        })
        return data;
    }

}
export async function adsBySalon(salonId: string, accessToken: string) {
    try{
        const {data} = await axios.get(`/api/ads/${salonId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return data;

    }catch(error:any){
        if (error?.response?.status !== 401) throw error;
        const nextAccessToken = await refreshAccessToken();
        const {data} = await axios.get(`/api/ads/${salonId}`, {
            headers: { Authorization: `Bearer ${nextAccessToken}` },
        });
        return data;
    }
}