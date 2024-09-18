import { Order_menu } from "@/components/component/orders";
import AuthWrapper from "@/components/AuthWrapper";

export default function Orders() {
	return (
		<AuthWrapper>
			<Order_menu />
		</AuthWrapper>
	);
}
