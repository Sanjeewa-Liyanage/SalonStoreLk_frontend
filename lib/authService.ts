import axios from "axios";
import apiClient from "./axios";

export async function loginUser(email: string, password: string) {
  const client = axios.create({
    baseURL: typeof window !== "undefined" ? window.location.origin : "",
  });
  const { data } = await client.post("/api/auth/login", { email, password });
  return data;
}
export function RegisterUser(payload: any){
    const client = axios.create({
      baseURL: typeof window !== "undefined" ? window.location.origin : "",
    });
    const data = client.post("/api/auth/register", payload);
    return data;
}


export async function getUserProfile() {
  const { data } = await apiClient.get("/user/me");
  console.log("User profile data:", data); // Debug log
  return data;
}

export async function refreshAccessToken() {
    const refreshToken = sessionStorage.getItem("refreshToken");

    if (!refreshToken) {
        throw new Error("No refresh token found. Please login again.");
        
    }

    const client = axios.create({
      baseURL: typeof window !== "undefined" ? window.location.origin : "",
    });

    const { data } = await client.post(
        "/api/auth/refresh",
        {},
        {
            headers: {
                Authorization: `Bearer ${refreshToken}`,
            },
        }
    );

    if (!data?.accessToken || !data?.refreshToken) {
        throw new Error("Invalid refresh response");
    }

    sessionStorage.setItem("accessToken", data.accessToken);
    sessionStorage.setItem("refreshToken", data.refreshToken);

    return data.accessToken as string;
}

export async function logoutUser() {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
}