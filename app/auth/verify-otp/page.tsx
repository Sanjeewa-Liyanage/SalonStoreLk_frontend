"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { verifyForgotPasswordOtp } from "@/lib/authService";

export default function VerifyOtpPage() {
	const router = useRouter();
	const [otp, setOtp] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const token = sessionStorage.getItem("forgotPasswordToken");
		if (!token) {
			toast.error("Session expired. Please request OTP again.");
			router.replace("/forgot-password");
		}
	}, [router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccessMessage("");
		setIsLoading(true);

		try {
			const response = await verifyForgotPasswordOtp(otp);
			const message = response?.message || "OTP verified successfully";
			setSuccessMessage(message);
			toast.success(message);
			router.push("/reset-password");
		} catch (err: any) {
			const message =
				err?.response?.data?.message ||
				err?.message ||
				"Failed to verify OTP. Please check the code and try again.";
			setError(message);
			toast.error(message);
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
							Verify Your <span style={{ color: "#C8A84B" }}>OTP</span>
						</h2>
						<div className="w-12 h-0.5 my-6" style={{ background: "#C8A84B" }} />
						<p className="text-sm text-white leading-relaxed max-w-xs font-light" style={{ opacity: 0.5 }}>
							Enter the one-time password sent to your email to continue resetting your account password.
						</p>
						<ul className="flex flex-col gap-4 mt-8">
							{[
								"Use the 6-digit code from your email",
								"Code is required for secure verification",
								"After verification, continue to password reset",
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
							<h1 className="font-playfair text-3xl font-bold text-black mb-2">Verify OTP</h1>
							<p className="text-sm font-light" style={{ color: "#7a7165" }}>
								Enter the code sent to your email.
							</p>
						</div>

						<form onSubmit={handleSubmit} className="flex flex-col">
							<div className="mb-5">
								<label
									htmlFor="otp"
									className="block text-xs font-medium uppercase tracking-widest text-black mb-2"
								>
									OTP Code
								</label>
								<input
									id="otp"
									type="text"
									inputMode="numeric"
									pattern="[0-9]{6}"
									maxLength={6}
									placeholder="257134"
									value={otp}
									onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
									required
									className="input-field w-full px-4 py-3.5 bg-white rounded-lg text-sm text-black transition-all"
									style={{ border: "1.5px solid #ede5d6", fontFamily: "inherit", letterSpacing: "0.3em" }}
								/>
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
									{isLoading ? "Verifying..." : "Verify OTP"}
								</span>
							</button>
						</form>

						<p className="text-center mt-8 text-sm font-light" style={{ color: "#7a7165" }}>
							Need a new code?{" "}
							<a
								href="/forgot-password"
								className="font-medium transition-colors hover:text-yellow-600"
								style={{ color: "#a88a3a" }}
							>
								Send again
							</a>
						</p>
					</div>
				</div>
			</div>
		</>
	);
}
