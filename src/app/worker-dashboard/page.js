"use client";
import { WorkerDashboard } from "@/components/wokerdashboard";
import AuthWrapper from "@/components/AuthWrapper";

export default function Orders() {
	return (
		<AuthWrapper>
			<WorkerDashboard />
		</AuthWrapper>
	);
}
