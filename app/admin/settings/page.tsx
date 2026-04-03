"use client";

import { useMemo, useState } from "react";
import {
	Box,
	Button,
	Card,
	CardContent,
	Container,
	Stack,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { LockReset as LockResetIcon, Settings as SettingsIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import HeaderAdmin from "@/components/HeaderAdmin";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import { useMuiTheme } from "@/context/MuiThemeContext";
import { useAuth } from "@/context/AuthContext";
import ResetPasswordDialog from "@/components/ResetPasswordDialog";
import { resetPasswordWithCurrent } from "@/lib/authService";

type SettingItem = {
	id: string;
	title: string;
	description: string;
	actionLabel: string;
	onClick: () => void;
	icon: React.ReactNode;
};

export default function AdminSettingsPage() {
	const router = useRouter();
	const muiTheme = useTheme();
	const { isDark } = useMuiTheme();
	const { logout } = useAuth();
	const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
	const [resetOpen, setResetOpen] = useState(false);

	const settings = useMemo<SettingItem[]>(
		() => [
			{
				id: "reset-password",
				title: "Reset Password",
				description: "Update your account password to keep your admin profile secure.",
				actionLabel: "Reset Password",
				onClick: () => setResetOpen(true),
				icon: <LockResetIcon />,
			},
		],
		[]
	);

	return (
		<AuthGuard allowedRole="ADMIN">
			<Box
				sx={{
					display: "flex",
					minHeight: "100vh",
					backgroundColor: isDark ? "#0d0f1a" : "#f9fafb",
				}}
			>
				<ResetPasswordDialog
					open={resetOpen}
					onClose={() => setResetOpen(false)}
					onSubmit={async ({ oldPassword, newPassword }) => {
						await resetPasswordWithCurrent(oldPassword, newPassword);
						logout();
						router.push("/auth/login");
					}}
				/>
				{!isMobile && <Sidebar />}

				<Box
					sx={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						width: { xs: "100%", md: "calc(100% - 280px)" },
					}}
				>
					<HeaderAdmin pageTitle="Settings" pageSubtitle="Manage admin preferences and security." />

					<Box
						component="main"
						sx={{
							flex: 1,
							overflow: "auto",
							backgroundColor: isDark ? "#0d0f1a" : "#f9fafb",
						}}
					>
						<Container
							maxWidth={false}
							sx={{
								py: 3,
								px: { xs: 2, sm: 3, md: 4 },
								maxWidth: 1100,
							}}
						>
							<Stack spacing={3}>
								<Card
									sx={{
										borderRadius: "16px",
										border: `1px solid ${isDark ? "#1e2440" : "#eaecf5"}`,
										background: isDark
											? "linear-gradient(140deg, #141828 0%, #101423 100%)"
											: "linear-gradient(140deg, #ffffff 0%, #f8faff 100%)",
									}}
								>
									<CardContent sx={{ p: { xs: 2, sm: 3 } }}>
										<Stack direction="row" spacing={2} alignItems="center">
											<Box
												sx={{
													width: 44,
													height: 44,
													borderRadius: "12px",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													backgroundColor: isDark ? "rgba(99, 102, 241, 0.15)" : "#eef2ff",
													color: isDark ? "#a5b4fc" : "#4f46e5",
												}}
											>
												<SettingsIcon />
											</Box>
											<Box>
												<Typography
													variant="h5"
													sx={{ fontWeight: 800, color: isDark ? "#f8fafc" : "#0f172a" }}
												>
													Settings
												</Typography>
												<Typography
													variant="body2"
													sx={{ mt: 0.4, color: isDark ? "#94a3b8" : "#64748b" }}
												>
													Manage your account preferences and security options.
												</Typography>
											</Box>
										</Stack>
									</CardContent>
								</Card>

								<Stack spacing={2}>
									{settings.map((setting) => (
										<Card
											key={setting.id}
											sx={{
												borderRadius: "16px",
												border: `1px solid ${isDark ? "#1e2440" : "#eaecf5"}`,
												backgroundColor: isDark ? "#141828" : "#ffffff",
											}}
										>
											<CardContent
												sx={{
													p: { xs: 2, sm: 3 },
													display: "flex",
													flexDirection: { xs: "column", sm: "row" },
													alignItems: { xs: "flex-start", sm: "center" },
													justifyContent: "space-between",
													gap: 2,
												}}
											>
												<Stack direction="row" spacing={2} alignItems="center">
													<Box
														sx={{
															width: 44,
															height: 44,
															borderRadius: "12px",
															display: "flex",
															alignItems: "center",
															justifyContent: "center",
															backgroundColor: isDark ? "rgba(148, 163, 184, 0.12)" : "#f1f5f9",
															color: isDark ? "#e2e8f0" : "#0f172a",
														}}
													>
														{setting.icon}
													</Box>
													<Box>
														<Typography
															variant="subtitle1"
															sx={{ fontWeight: 700, color: isDark ? "#f1f5f9" : "#1a1d2e" }}
														>
															{setting.title}
														</Typography>
														<Typography variant="body2" sx={{ color: isDark ? "#94a3b8" : "#64748b" }}>
															{setting.description}
														</Typography>
													</Box>
												</Stack>

												<Button
													variant="outlined"
													onClick={setting.onClick}
													sx={{
														textTransform: "none",
														borderRadius: "10px",
														borderColor: isDark ? "#2f3557" : "#d5dbeb",
														color: isDark ? "#d1d5f1" : "#475569",
													}}
												>
													{setting.actionLabel}
												</Button>
											</CardContent>
										</Card>
									))}
								</Stack>
							</Stack>
						</Container>
					</Box>
				</Box>
			</Box>
		</AuthGuard>
	);
}
