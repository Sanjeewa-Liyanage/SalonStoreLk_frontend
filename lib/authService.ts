import axios from "axios";

export async function loginUser(email: string, password: string) {
  const { data } = await axios.post("/api/auth/login", { email, password });
  return data;
}
export function RegisterUser(payload: any){
    const data = axios.post("/api/auth/register", payload);
    return data;
}

export async function getUserProfile(accessToken: string) {
  const { data } = await axios.get("/api/user/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  console.log("User profile data:", data); // Debug log
  return data;
}
export async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
        throw new Error("No refresh token found. Please login again.");
        
    }

    const { data } = await axios.post(
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

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);

    return data.accessToken as string;
}