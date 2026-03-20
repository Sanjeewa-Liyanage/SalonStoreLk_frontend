"use client";

import { useState } from "react";
import { Google } from '@mui/icons-material';
import { User, Scissors } from 'lucide-react';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accountType, setAccountType] = useState<"customer" | "salon">("customer");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    }
    setPasswordMismatch(false);
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
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
        .input-error {
          border-color: #e05555 !important;
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
        .account-type-btn {
          transition: all 0.2s;
        }
        .account-type-btn.active {
          background: #0d0d0d;
          color: white;
          border-color: #0d0d0d;
        }
        .account-type-btn:not(.active):hover {
          border-color: #C8A84B;
        }
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
            <img src="/logo.png" alt="SalonStore.lk" className="w-10 h-10 object-contain" />
            <span className="font-playfair text-xl text-white tracking-wide">
              Salon<span style={{ color: "#C8A84B" }}>Store</span>.lk
            </span>
          </a>

          {/* Headline */}
          <div className="flex-1 flex flex-col justify-center py-16 z-10">
            <h2 className="font-playfair text-4xl font-bold text-white leading-tight mb-5">
              Join Sri Lanka&apos;s{" "}
              <span style={{ color: "#C8A84B" }}>Beauty</span>
              <br />Community
            </h2>
            <div className="w-12 h-0.5 my-6" style={{ background: "#C8A84B" }} />
            <p className="text-sm text-white leading-relaxed max-w-xs font-light" style={{ opacity: 0.5 }}>
              Create your free account and start exploring or listing professional salons across Sri Lanka.
            </p>
            <ul className="flex flex-col gap-4 mt-8">
              {[
                "Free to join — no hidden fees",
                "List your salon and reach more clients",
                "Book appointments with top beauticians",
                "Manage reviews and your profile",
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
            <div className="mb-8">
              <h1 className="font-playfair text-3xl font-bold text-black mb-2">Create account</h1>
              <p className="text-sm font-light" style={{ color: "#7a7165" }}>
                Join SalonStore — it&apos;s free
              </p>
            </div>

            {/* Account type toggle */}
            <div className="mb-6">
              <p className="block text-xs font-medium uppercase tracking-widest text-black mb-3">
                I am a
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType("customer")}
                  className={`account-type-btn py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${accountType === "customer" ? "active" : "bg-white text-black"}`}
                  style={{
                    border: accountType === "customer" ? "1.5px solid #0d0d0d" : "1.5px solid #ede5d6",
                    fontFamily: "inherit",
                  }}>
                  <User size={15} /> Customer
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("salon")}
                  className={`account-type-btn py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${accountType === "salon" ? "active" : "bg-white text-black"}`}
                  style={{
                    border: accountType === "salon" ? "1.5px solid #0d0d0d" : "1.5px solid #ede5d6",
                    fontFamily: "inherit",
                  }}>
                  <Scissors size={15} /> Salon Owner
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col">

              {/* Name row */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div>
                  <label htmlFor="firstName"
                    className="block text-xs font-medium uppercase tracking-widest text-black mb-2">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="Amal"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="input-field w-full px-4 py-3.5 bg-white rounded-lg text-sm text-black transition-all"
                    style={{ border: "1.5px solid #ede5d6", fontFamily: "inherit" }}
                  />
                </div>
                <div>
                  <label htmlFor="lastName"
                    className="block text-xs font-medium uppercase tracking-widest text-black mb-2">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Perera"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="input-field w-full px-4 py-3.5 bg-white rounded-lg text-sm text-black transition-all"
                    style={{ border: "1.5px solid #ede5d6", fontFamily: "inherit" }}
                  />
                </div>
              </div>

              {/* Email */}
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

              {/* Password */}
              <div className="mb-5">
                <label htmlFor="password"
                  className="block text-xs font-medium uppercase tracking-widest text-black mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
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

              {/* Confirm Password */}
              <div className="mb-5">
                <label htmlFor="confirmPassword"
                  className="block text-xs font-medium uppercase tracking-widest text-black mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setPasswordMismatch(false); }}
                    required
                    className={`input-field w-full px-4 py-3.5 pr-16 bg-white rounded-lg text-sm text-black transition-all ${passwordMismatch ? "input-error" : ""}`}
                    style={{ border: `1.5px solid ${passwordMismatch ? "#e05555" : "#ede5d6"}`, fontFamily: "inherit" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium px-1 transition-colors hover:text-yellow-600"
                    style={{ color: "#7a7165", fontFamily: "inherit" }}>
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {passwordMismatch && (
                  <p className="text-xs mt-1.5" style={{ color: "#e05555" }}>
                    Passwords do not match.
                  </p>
                )}
              </div>

              {/* Terms */}
              <div className="mb-7">
                <label className="flex items-start gap-2.5 cursor-pointer text-sm font-light select-none leading-relaxed"
                  style={{ color: "#7a7165" }}>
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    required
                    className="w-4 h-4 cursor-pointer rounded mt-0.5 shrink-0"
                  />
                  <span>
                    I agree to the{" "}
                    <a href="/terms" className="font-medium transition-colors hover:text-yellow-600"
                      style={{ color: "#a88a3a" }}>Terms of Service</a>
                    {" "}and{" "}
                    <a href="/privacy" className="font-medium transition-colors hover:text-yellow-600"
                      style={{ color: "#a88a3a" }}>Privacy Policy</a>
                  </span>
                </label>
              </div>

              {/* Submit */}
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
                  {isLoading ? "Creating Account..." : "Create Account"}
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

            {/* Google */}
            <button
              type="button"
              className="btn-google w-full py-3.5 bg-white rounded-lg text-sm font-medium flex items-center justify-center gap-2.5 transition-all text-black"
              style={{ border: "1.5px solid #ede5d6", fontFamily: "inherit" }}>
              <Google style={{ fontSize: 18, color: "#EA4335" }} />
              Sign up with Google
            </button>

            {/* Login link */}
            <p className="text-center mt-8 text-sm font-light" style={{ color: "#7a7165" }}>
              Already have an account?{" "}
              <a href="/login"
                className="font-medium transition-colors hover:text-yellow-600"
                style={{ color: "#a88a3a" }}>
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}