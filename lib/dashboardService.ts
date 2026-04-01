import axios from 'axios';
import { refreshAccessToken } from './authService';

export async function adminDashboardRequest(accessToken: string) {
    try {
        const client = axios.create({
            baseURL: typeof window !== "undefined" ? window.location.origin : "",
        });

        const response = await client.get('/api/dashboards/admin', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return response.data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            try {
                const refreshedData = await refreshAccessToken();
                const newAccessToken = sessionStorage.getItem("accessToken");
                
                const client = axios.create({
                    baseURL: typeof window !== "undefined" ? window.location.origin : "",
                });

                const retryResponse = await client.get('/api/dashboards/admin', {
                    headers: {
                        Authorization: `Bearer ${newAccessToken}`,
                    },
                });

                return retryResponse.data;
            } catch (refreshError) {
                console.error('Failed to refresh token', refreshError);
                throw refreshError;
            }
        }
        console.error("Dashboard Service Error:", error.response?.data || error.message);
        throw error;
    }
}
export async function salonOwnerDashboardRequest(accessToken: string) {
    try{
        const client = axios.create({
            baseURL: typeof window !== "undefined" ? window.location.origin : "",
        });
        const response = await client.get('/api/dashboards/salonowner', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return response.data;
    }catch(error:any){
        if (error.response?.status === 401) {
            try{
                const refreshedData = await refreshAccessToken();
                const newAccessToken = sessionStorage.getItem("accessToken");
                const client = axios.create({
                    baseURL: typeof window !== "undefined" ? window.location.origin : "",
                });
                const retryResponse = await client.get('/api/dashboards/salonowner', {
                    headers: {
                        Authorization: `Bearer ${newAccessToken}`,
                    },
                });
                return retryResponse.data;

            }catch(refreshError){
                console.error('Failed to refresh token', refreshError);
                throw refreshError;
            }
        }
        console.error("Dashboard Service Error:", error.response?.data || error.message);
        throw error;
    }
}