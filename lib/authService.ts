import axios from "axios";

export async function loginUser(email: string, password: string) {
  const { data } = await axios.post("/api/auth/login", { email, password });
  return data;
}

export async function getUserProfile(accessToken: string) {
  const { data } = await axios.get("/api/user/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  console.log("User profile data:", data); // Debug log
  return data;
}