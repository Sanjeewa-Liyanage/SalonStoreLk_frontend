import axios from "axios";
import { refreshAccessToken } from "./authService";

async function planRequest(params: Record<string, string>, accessToken: string) {
    const query = new URLSearchParams(params).toString();
    try {
        const { data } = await axios.get(`/api/plan?${query}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return data;
    } catch (error: any) {
        if (error?.response?.status !== 401) throw error;
        const newAccessToken = await refreshAccessToken();
        return planRequest(params, newAccessToken);
    }

}

export const fetchAllPlans = (token: string) => planRequest({ type: "all" }, token);
export const fetchPlanUsage = (token: string) => planRequest({ type: "usage" }, token);
export const fetchPlanById = (id: string, token: string) => planRequest({ type: "by-id", id }, token);


export async function createPlan(planData: any, ){
    const token = sessionStorage.getItem("accessToken");
    try{
        const {data} = await axios.post("/api/plan/create",planData,{
            headers:{ Authorization: `Bearer ${token}` },
        });
        return data;
    }catch(error:any){
        if (error?.response?.status !== 401) throw error;
        const nextAccessToken = await refreshAccessToken();
        const {data} = await axios.post("/api/plan/create",planData,{
            headers:{ Authorization: `Bearer ${nextAccessToken}` },
        });
        return data;

    }
}

export async function updatePlan(id: string, planData: any){
    const token = sessionStorage.getItem("accessToken");
    try{
        const {data} = await axios.patch(`/api/plan/update/${id}`,planData,{
            headers:{ Authorization: `Bearer ${token}` },
        });
        return data;
    }catch(error:any){
        if (error?.response?.status !== 401) throw error;
        const nextAccessToken = await refreshAccessToken();
        const {data} = await axios.patch(`/api/plan/update/${id}`,planData,{
            headers:{ Authorization: `Bearer ${nextAccessToken}` },
        });
        return data;
    }
}

export async function deletePlan(id: string){
    const token = sessionStorage.getItem("accessToken");
    try{
        const {data} = await axios.delete(`/api/plan/delete/${id}`,{
            headers:{ Authorization: `Bearer ${token}` },
        });
        return data;
    }catch(error:any){
        if (error?.response?.status !== 401) throw error;
        const nextAccessToken = await refreshAccessToken();
        const {data} = await axios.delete(`/api/plan/delete/${id}`,{
            headers:{ Authorization: `Bearer ${nextAccessToken}` },
        });
        return data;
    }
}
