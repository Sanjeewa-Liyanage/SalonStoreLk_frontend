"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { resetPasswordWithVerifiedToken } from "@/lib/authService";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const token = sessionStorage.getItem("verifiedToken");
    if (!token) {
      toast.error("Session expired. Please verify OTP again.");
      router.replace("/verify-otp");
    }
  }, [router]);

  const passwordChecks = useMemo(
    () => ({
      minLength: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /\d/.test(newPassword),
      special: /[^A-Za-z0-9]/.test(newPassword),
      match: newPassword.length > 0 && newPassword === confirmPassword,
    }),
    [newPassword, confirmPassword]
  );

  const isPasswordStrong =
    passwordChecks.minLength &&
    passwordChecks.uppercase &&
    passwordChecks.lowercase &&
    passwordChecks.number &&
    passwordChecks.special;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!isPasswordStrong) {
      setError("Password does not meet all required conditions.");
      return;
    }

    if (!passwordChecks.match) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPasswordWithVerifiedToken(newPassword);
      const message = response?.message || "Password reset successful";
      setSuccessMessage(message);
      toast.success(message);
      router.push("/login");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to reset password. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const strategyItems = [
    { label: "At least 8 characters", pass: passwordChecks.minLength },
    { label: "One uppercase letter", pass: passwordChecks.uppercase },
    { label: "One lowercase letter", pass: passwordChecks.lowercase },
    { label: "One number", pass: passwordChecks.number },
    { label: "One special character", pass: passwordChecks.special },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        body { font-family: 'DM Sans', sans-serif; }
        .font-playfair { font-family: 'Playfair Display', serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.7s linear infinite; }
        .input-field:focus {
          border-color: #C8A84B !important;
          box-shadow: 0 0 0 3px rgba(200,168,75,0.12) !important;
          outline: none;
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
        <div className="hidden md:flex flex-col justify-between bg-black p-12 relative overflow-hidden">
          <div
            className="absolute -top-20 -left-20 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(200,168,75,0.15) 0%, transparent 70%)" }}
          />
          <div
            className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(200,168,75,0.1) 0%, transparent 70%)" }}
          />

          <a href="/" className="flex items-center gap-3 z-10">
            <Image
              src="/logo.png"
              alt="SalonStore.lk"
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <span className="font-playfair text-xl text-white tracking-wide">
              Salon<span style={{ color: "#C8A84B" }}>Store</span>.lk
            </span>
          </a>

          <div className="flex-1 flex flex-col justify-center py-16 z-10">
            <h2 className="font-playfair text-4xl font-bold text-white leading-tight mb-5">
              Create New <span style={{ color: "#C8A84B" }}>Password</span>
            </h2>
            <div className="w-12 h-0.5 my-6" style={{ background: "#C8A84B" }} />
            <p className="text-sm text-white leading-relaxed max-w-xs font-light" style={{ opacity: 0.5 }}>
              Set a strong password to secure your account and sign in again safely.
            </p>
            <ul className="flex flex-col gap-4 mt-8">
              {[
                "Use a strong and unique password",
                "Avoid personal details in password",
                "Keep your account protected",
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

          <p className="text-xs z-10" style={{ color: "rgba(255,255,255,0.25)" }}>
            © {new Date().getFullYear()} SalonStore.lk — All rights reserved
          </p>
        </div>

        <div
          className="flex items-center justify-center px-6 py-14 md:px-12 relative"
          style={{ background: "#f5f0e8" }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ background: "linear-gradient(90deg, #C8A84B, #a88a3a)" }}
          />

          <div className="w-full max-w-sm">
            <div className="flex md:hidden items-center gap-3 mb-10">
              <Image src="/logo.png" alt="SalonStore.lk" width={36} height={36} className="object-contain" />
              <span className="font-playfair text-lg text-black tracking-wide">
                Salon<span style={{ color: "#C8A84B" }}>Store</span>.lk
              </span>
            </div>

            <div className="mb-9">
              <h1 className="font-playfair text-3xl font-bold text-black mb-2">Reset Password</h1>
              <p className="text-sm font-light" style={{ color: "#7a7165" }}>
                Enter and confirm your new password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="mb-5">
                <label
                  htmlFor="newPassword"
                  className="block text-xs font-medium uppercase tracking-widest text-black mb-2"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="NewStrongP@ss123"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="input-field w-full px-4 py-3.5 pr-16 bg-white rounded-lg text-sm text-black transition-all"
                    style={{ border: "1.5px solid #ede5d6", fontFamily: "inherit" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium px-1 transition-colors hover:text-yellow-600"
                    style={{ color: "#7a7165", fontFamily: "inherit" }}
                  >
                    {showNewPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-medium uppercase tracking-widest text-black mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="input-field w-full px-4 py-3.5 pr-16 bg-white rounded-lg text-sm text-black transition-all"
                    style={{ border: "1.5px solid #ede5d6", fontFamily: "inherit" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium px-1 transition-colors hover:text-yellow-600"
                    style={{ color: "#7a7165", fontFamily: "inherit" }}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="mb-5 rounded-lg p-3" style={{ background: "#fff", border: "1.5px solid #ede5d6" }}>
                <p className="text-xs font-medium uppercase tracking-widest text-black mb-2">Password Rules</p>
                <ul className="space-y-1">
                  {strategyItems.map((item) => (
                    <li
                      key={item.label}
                      className="text-xs"
                      style={{ color: item.pass ? "#2f7d32" : "#7a7165" }}
                    >
                      {item.pass ? "✓" : "•"} {item.label}
                    </li>
                  ))}
                  <li className="text-xs" style={{ color: passwordChecks.match ? "#2f7d32" : "#7a7165" }}>
                    {passwordChecks.match ? "✓" : "•"} Passwords match
                  </li>
                </ul>
              </div>

              {error && (
                <p className="text-xs mb-4" style={{ color: "#e05555" }}>
                  {error}
                </p>
              )}

              {successMessage && (
                <p className="text-xs mb-4" style={{ color: "#2f7d32" }}>
                  {successMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="gold-underline relative w-full py-4 bg-black text-white rounded-lg text-sm font-medium uppercase tracking-widest overflow-hidden transition-colors hover:bg-neutral-900 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ fontFamily: "inherit" }}
              >
                <span className="flex items-center justify-center gap-2">
                  {isLoading && (
                    <span
                      className="spinner w-4 h-4 rounded-full border-2 inline-block"
                      style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }}
                    />
                  )}
                  {isLoading ? "Updating..." : "Reset Password"}
                </span>
              </button>
            </form>

            <p className="text-center mt-8 text-sm font-light" style={{ color: "#7a7165" }}>
              Remembered your password?{" "}
              <a
                href="/login"
                className="font-medium transition-colors hover:text-yellow-600"
                style={{ color: "#a88a3a" }}
              >
                Back to sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
