import axios from "axios";
import apiClient from "./axios";

type ForgotPasswordResponse = {
  token: string;
  message: string;
};

type VerifyOtpResponse = {
  message: string;
  verifiedToken?: string;
  [key: string]: any;
};

type ResetPasswordResponse = {
  message: string;
  [key: string]: any;
};

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

export async function requestForgotPassword(email: string): Promise<ForgotPasswordResponse> {
  const client = axios.create({
    baseURL: typeof window !== "undefined" ? window.location.origin : "",
  });

  if (typeof window !== "undefined") {
    sessionStorage.removeItem("forgotPasswordToken");
  }

  const { data } = await client.post<ForgotPasswordResponse>("/api/auth/forgot-password", { email });

  if (typeof window !== "undefined" && data?.token) {
    sessionStorage.setItem("forgotPasswordToken", data.token);
  }

  return data;
}

export async function verifyForgotPasswordOtp(otp: string): Promise<VerifyOtpResponse> {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("forgotPasswordToken") : null;

  if (!token) {
    throw new Error("Forgot password token is missing. Please request OTP again.");
  }

  const client = axios.create({
    baseURL: typeof window !== "undefined" ? window.location.origin : "",
  });

  const { data } = await client.post<VerifyOtpResponse>(
    "/api/auth/verify-otp",
    { otp },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!data?.verifiedToken) {
    throw new Error("Verification succeeded but verified token is missing.");
  }

  if (typeof window !== "undefined") {
    sessionStorage.removeItem("forgotPasswordToken");
    sessionStorage.setItem("verifiedToken", data.verifiedToken);
  }

  return data;
}

export async function resetPasswordWithVerifiedToken(newPassword: string): Promise<ResetPasswordResponse> {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("verifiedToken") : null;

  if (!token) {
    throw new Error("Verified token is missing. Please verify OTP again.");
  }

  const client = axios.create({
    baseURL: typeof window !== "undefined" ? window.location.origin : "",
  });

  const { data } = await client.post<ResetPasswordResponse>(
    "/api/auth/reset-password",
    { newPassword },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (typeof window !== "undefined") {
    sessionStorage.removeItem("verifiedToken");
  }

  return data;
}


export async function getUserProfile() {
  const { data } = await apiClient.get("/user/me");
  console.log("User profile data:", data); // Debug log
  return data;
}

export async function updateUserProfile(payload: Record<string, any>) {
  const token = sessionStorage.getItem("accessToken");
  if (!token) {
    throw new Error("No access token found. Please login again.");
  }

  try {
    const { data } = await axios.post("/api/auth/edit-profile", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error: any) {
    if (error?.response?.status !== 401) throw error;
    const nextAccessToken = await refreshAccessToken();
    const { data } = await axios.post("/api/auth/edit-profile", payload, {
      headers: { Authorization: `Bearer ${nextAccessToken}` },
    });
    return data;
  }
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