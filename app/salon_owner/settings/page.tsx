"use client";

import { useMemo, useState } from "react";
import { Settings, Lock, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import SidebarSalon from "@/components/SidebarSalon";
import HeaderSalon from "@/components/HeaderSalon";
import ResetPasswordDialogSalon from "@/components/ResetPasswordDialogSalon";
import { resetPasswordWithCurrent } from "@/lib/authService";
import { useAuth } from "@/context/AuthContext";

type SettingItem = {
	id: string;
	title: string;
	description: string;
	actionLabel: string;
	onClick: () => void;
	icon: React.ReactNode;
};

export default function SalonOwnerSettingsPage() {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [resetOpen, setResetOpen] = useState(false);
	const router = useRouter();
	const { logout } = useAuth();

	const settings = useMemo<SettingItem[]>(
		() => [
			{
				id: "reset-password",
				title: "Reset Password",
				description: "Change your account password to keep your profile secure.",
				actionLabel: "Reset Password",
				onClick: () => setResetOpen(true),
				icon: <Lock size={18} className="text-[#8E7327]" />,
			},
		],
		[]
	);

	return (
		<AuthGuard allowedRole="SALON_OWNER">
			<div className="flex h-screen bg-gray-50">
				<ResetPasswordDialogSalon
					open={resetOpen}
					onClose={() => setResetOpen(false)}
					onSubmit={async ({ oldPassword, newPassword }) => {
						await resetPasswordWithCurrent(oldPassword, newPassword);
						logout();
						router.push("/auth/login");
					}}
				/>

				<div className="hidden md:block">
					<SidebarSalon />
				</div>

				{sidebarOpen && (
					<div className="fixed inset-0 z-40 md:hidden">
						<div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
						<div className="absolute inset-y-0 left-0 w-64 z-50">
							<SidebarSalon />
						</div>
					</div>
				)}

				<div className="flex-1 flex flex-col overflow-hidden">
					<HeaderSalon sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

					<div className="flex-1 overflow-auto">
						<div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
							<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
								<div>
									<h1 className="text-2xl md:text-4xl font-playfair font-bold text-gray-900">Settings</h1>
									<p className="text-gray-500 mt-1 text-sm md:text-base">
										Manage your salon owner account preferences and security.
									</p>
								</div>
								<div className="flex items-center gap-2 text-sm text-gray-500">
									<Settings size={16} />
									<span>Account Settings</span>
								</div>
							</div>

							<section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-7">
								<div className="space-y-4">
									{settings.map((setting) => (
										<div
											key={setting.id}
											className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-gray-100 rounded-xl p-4 md:p-5"
										>
											<div className="flex items-start gap-3">
												<div className="w-10 h-10 rounded-full bg-[#C8A84B]/15 flex items-center justify-center">
													{setting.icon}
												</div>
												<div>
													<h3 className="text-base font-semibold text-black">{setting.title}</h3>
													<p className="text-sm text-black/70 mt-1 max-w-xl">{setting.description}</p>
												</div>
											</div>

											<button
												onClick={setting.onClick}
												className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold text-black border border-[#C8A84B]/40 hover:bg-[#C8A84B]/10 transition"
											>
												{setting.actionLabel}
												<ChevronRight size={16} />
											</button>
										</div>
									))}
								</div>
							</section>
						</div>
					</div>
				</div>
			</div>
		</AuthGuard>
	);
}
