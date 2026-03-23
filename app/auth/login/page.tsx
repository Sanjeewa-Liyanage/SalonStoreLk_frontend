"use client";

import { useState } from "react";
import Image from 'next/image';
import { loginUser, getUserProfile } from "@/lib/authService";
import { useRouter } from "next/navigation";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  

    const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const data = await loginUser(email, password);

      // Store tokens from backend response
      localStorage.setItem("accessToken", data.backendTokens.accessToken);
      localStorage.setItem("refreshToken", data.backendTokens.refreshToken);

      // Fetch full user profile using the access token
      const userProfile = await getUserProfile(data.backendTokens.accessToken);
      localStorage.setItem("user", JSON.stringify(userProfile));
      console.log("User profile after login:", userProfile);
      if(userProfile.role === "ADMIN" && userProfile.adminLevel==="SUPER") {
        router.push("/admin/dashboard");
        
        return;
      }else if(userProfile.role === "SALON_OWNER"){
        router.push("/salon_owner/dashboard");
      }
      
      

    } catch (err: any) {
      alert(err?.response?.data?.message || "Login failed. Please try again.");
      setError(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        body { font-family: 'DM Sans', sans-serif; }
        .font-playfair { font-family: 'Playfair Display', serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.7s linear infinite; }
        input[type="checkbox"] { accent-color: #C8A84B; }
        .input-field:focus {
          border-color: #C8A84B !important;
          box-shadow: 0 0 0 3px rgba(200,168,75,0.12) !important;
          outline: none;
        }
        .btn-google:hover {
          border-color: #C8A84B !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .gold-underline::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          height: 3px;
          width: 0;
          background: #C8A84B;
          transition: width 0.3s;
        }
        .gold-underline:hover::after { width: 100%; }
      `}</style>

      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

        {/* ── LEFT PANEL ── */}
        <div className="hidden md:flex flex-col justify-between bg-black p-12 relative overflow-hidden">
          {/* Ambient glows */}
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(200,168,75,0.15) 0%, transparent 70%)" }} />
          <div className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(200,168,75,0.1) 0%, transparent 70%)" }} />

          {/* Brand */}
          <a href="/" className="flex items-center gap-3 z-10">
          <Image
                src="/logo.png"
                alt="SalonStore.lk"
                width={40}
                height={40}
                className=" rounded-full object-cover"
          ></Image>
            {/* <img src="/logo.png" alt="SalonStore.lk" className="w-10 h-10 rounded-full object-cover" /> */}
            <span className="font-playfair text-xl text-white tracking-wide">
              Salon<span style={{ color: "#C8A84B" }}>Store</span>.lk
            </span>
          </a>

          {/* Headline */}
          <div className="flex-1 flex flex-col justify-center py-16 z-10">
            <h2 className="font-playfair text-4xl font-bold text-white leading-tight mb-5">
              Sri Lanka&apos;s{" "}
              <span style={{ color: "#C8A84B" }}>Premier</span>
              <br />Salon Directory
            </h2>
            <div className="w-12 h-0.5 my-6" style={{ background: "#C8A84B" }} />
            <p className="text-sm text-white leading-relaxed max-w-xs font-light" style={{ opacity: 0.5 }}>
              Connect with top beauty professionals and salons across Sri Lanka — all in one place.
            </p>
            <ul className="flex flex-col gap-4 mt-8">
              {[
                "Browse & book top-rated salons",
                "Publish and manage your salon listing",
                "Connect directly with beauticians",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "#C8A84B" }} />
                  <span className="text-sm font-light" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <p className="text-xs z-10" style={{ color: "rgba(255,255,255,0.25)" }}>
            © {new Date().getFullYear()} SalonStore.lk — All rights reserved
          </p>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex items-center justify-center px-6 py-14 md:px-12 relative"
          style={{ background: "#f5f0e8" }}>

          {/* Gold accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1"
            style={{ background: "linear-gradient(90deg, #C8A84B, #a88a3a)" }} />

          <div className="w-full max-w-sm">

            {/* Mobile-only brand */}
            <div className="flex md:hidden items-center gap-3 mb-10">
              <img src="/logo.png" alt="SalonStore.lk" className="w-9 h-9 object-contain" />
              <span className="font-playfair text-lg text-black tracking-wide">
                Salon<span style={{ color: "#C8A84B" }}>Store</span>.lk
              </span>
            </div>

            {/* Heading */}
            <div className="mb-9">
              <h1 className="font-playfair text-3xl font-bold text-black mb-2">Welcome back</h1>
              <p className="text-sm font-light" style={{ color: "#7a7165" }}>
                Sign in to your SalonStore account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col">

              {/* Email field */}
              <div className="mb-5">
                <label htmlFor="email"
                  className="block text-xs font-medium uppercase tracking-widest text-black mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field w-full px-4 py-3.5 bg-white rounded-lg text-sm text-black transition-all"
                  style={{ border: "1.5px solid #ede5d6", fontFamily: "inherit" }}
                />
              </div>

              {/* Password field */}
              <div className="mb-4">
                <label htmlFor="password"
                  className="block text-xs font-medium uppercase tracking-widest text-black mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-field w-full px-4 py-3.5 pr-16 bg-white rounded-lg text-sm text-black transition-all"
                    style={{ border: "1.5px solid #ede5d6", fontFamily: "inherit" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium px-1 transition-colors hover:text-yellow-600"
                    style={{ color: "#7a7165", fontFamily: "inherit" }}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Remember me + Forgot */}
              <div className="flex items-center justify-between mb-7">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-light select-none"
                  style={{ color: "#7a7165" }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 cursor-pointer rounded"
                  />
                  Remember me
                </label>
                <a href="/forgot-password"
                  className="text-sm font-medium transition-colors hover:text-yellow-600"
                  style={{ color: "#a88a3a" }}>
                  Forgot password?
                </a>
              </div>

              {/* Sign in button */}
              <button
                type="submit"
                disabled={isLoading}
                className="gold-underline relative w-full py-4 bg-black text-white rounded-lg text-sm font-medium uppercase tracking-widest overflow-hidden transition-colors hover:bg-neutral-900 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ fontFamily: "inherit" }}>
                <span className="flex items-center justify-center gap-2">
                  {isLoading && (
                    <span className="spinner w-4 h-4 rounded-full border-2 inline-block"
                      style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                  )}
                  {isLoading ? "Signing In..." : "Sign In"}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ background: "#ede5d6" }} />
              <span className="text-xs uppercase tracking-widest" style={{ color: "#c0b9b0" }}>
                or continue with
              </span>
              <div className="flex-1 h-px" style={{ background: "#ede5d6" }} />
            </div>

            {/* Google button */}
            <button
              type="button"
              className="btn-google w-full py-3.5 bg-white rounded-lg text-sm font-medium flex items-center justify-center gap-2.5 transition-all text-black"
              style={{ border: "1.5px solid #ede5d6", fontFamily: "inherit" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            {/* Sign up link */}
            <p className="text-center mt-8 text-sm font-light" style={{ color: "#7a7165" }}>
              Don&apos;t have an account?{" "}
              <a href="/register"
                className="font-medium transition-colors hover:text-yellow-600"
                style={{ color: "#a88a3a" }}>
                Create one free
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}