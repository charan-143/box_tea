import { Dashboard } from "@/components/dashboard";
import AuthWrapper from "@/components/AuthWrapper";

export default function Orders() {
	return (
		<AuthWrapper>
			<Dashboard />
		</AuthWrapper>
	);
}
