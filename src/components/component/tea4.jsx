"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from "@/components/ui/table";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { DialogClose } from "@radix-ui/react-dialog";
import {  useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { Header } from "@/components/header";

// Function to fetch Menu Items from Supabase
async function fetchMenuItems() {
	const { data, error } = await supabase.from("menuitems").select("*");

	if (error) {
		console.error("Error fetching menu items:", error);
	} else {
		return data;
	}
}

// Function to fetch Orders from Supabase
async function fetchOrders() {
	const { data, error } = await supabase.from("orders").select("*");

	if (error) {
		console.error("Error fetching orders:", error);
	} else {
		return data;
	}
}


function Main() {
	const [orderDate, setOrderDate] = useState(null);
	const [menuItems, setMenuItems] = useState([]);
	const [fetchedOrders, setFetchedOrders] = useState([]);
	const [filteredOrders, setFilteredOrders] = useState([]);

	const fetchData = async () => {
		const [fetchedMenuItems, fetchedOrders] = await Promise.all([
			fetchMenuItems(),
			fetchOrders(),
		]);
		setMenuItems(fetchedMenuItems);
		setFetchedOrders(fetchedOrders);
	};

	useEffect(() => {
		fetchData();
	}, []);

	useEffect(() => {
		const filterOrders = async () => {
			const user = await user_email();
			if (!user) return;

			const userType = await user_type(user.email);
		

			const filtered = fetchedOrders.filter(
				(order) =>
					(!orderDate ||
						new Date(order.date).getFullYear() === orderDate?.getFullYear()) &&
					order.user === user.email
			);
			setFilteredOrders(filtered);
		};

		filterOrders();
		
	}, [fetchedOrders, orderDate]);
	const user_type = async (user_email) => {
		const { data, error } = await supabase
			.from("users_data")
			.select("user_type")
			.eq("users_email", user_email)
			.single();

		if (error) {
			console.error("Error fetching user type:", error);
			return null;
		}
		return data?.user_type;
	};

	const user_email = async () => {
		try {
			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser();

			if (userError) {
				console.error("Error fetching user:", userError);
				return null;
			}

			return user;
		} catch (error) {
			console.error("Unexpected error during user fetch:", error);
			return null;
		}
	};
	
	
	return (
		<main className="flex-1">
			<section className="py-12 sm:py-16 lg:py-5">
				<div className="container mx-auto px-4 sm:px-6">
					<div className="flex justify-center">
						<Card className="w-full max-w-4xl">
							<CardHeader>
								<CardTitle>Orders</CardTitle>
								<CardDescription>
									View and accept incoming orders.
								</CardDescription>
								<div className="flex items-center gap-2">
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className="pl-3 text-left font-normal text-muted-foreground"
											>
												{orderDate
													? orderDate.toLocaleDateString()
													: "Select date"}
												<CalendarDaysIcon className="ml-auto h-4 w-4 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												value={orderDate}
												onValueChange={setOrderDate}
											/>
										</PopoverContent>
									</Popover>
								</div>
							</CardHeader>
							<CardContent>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Date</TableHead>
											<TableHead>Time</TableHead>
											<TableHead>Customer</TableHead>
											<TableHead>Purpose</TableHead>
											<TableHead>Venue</TableHead>
											<TableHead>Items</TableHead>
											<TableHead>Quantity</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredOrders.map((order) => (
											<TableRow key={order.id}>
												<TableCell>{order.date}</TableCell>
												<TableCell>{order.time}</TableCell>
												<TableCell>{order.customer}</TableCell>
												<TableCell>{order.purpose}</TableCell>
												<TableCell>{order.venue}</TableCell>
												<TableCell>
													{order.items.map((item) => (
														<div key={item.id}>{item.id}</div>
													))}
												</TableCell>
												<TableCell>
													{order.quantities.map((quantity) => (
														<div key={quantity.id} className="text-center">
															{quantity.quantity}
														</div>
													))}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>
		</main>
	);
}

function Footer() {
	return (
		<footer className="bg-muted py-6 text-muted-foreground">
			<div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
				<p className="text-sm">© 2024 Box Tea. All rights reserved.</p>
				<div className="flex items-center gap-4">
					<Link href="#" className="hover:text-foreground" prefetch={false}>
						Privacy Policy
					</Link>
					<Link href="#" className="hover:text-foreground" prefetch={false}>
						Terms of Service
					</Link>
				</div>
			</div>
		</footer>
	);
}

export function Tea4() {
	const [activeTab, setActiveTab] = useState("menu");
	const [isProfileOpen, setIsProfileOpen] = useState(false);

	const handleLogout = () => {
		// Handle logout logic here, such as clearing local storage, resetting state, etc.
		console.log("User logged out");
		// You can add additional logic here, like redirecting to a login page
	};

	return (
		<div className="flex flex-col min-h-screen bg-background text-foreground">
			<Header
				setActiveTab={setActiveTab}
				setIsProfileOpen={setIsProfileOpen}
				onLogout={handleLogout}
			/>

			<Main />
			<Footer />
		</div>
	);
}

function CalendarDaysIcon(props) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M8 2v4" />
			<path d="M16 2v4" />
			<rect width="18" height="18" x="3" y="4" rx="2" />
			<path d="M3 10h18" />
			<path d="M8 14h.01" />
			<path d="M12 14h.01" />
			<path d="M16 14h.01" />
			<path d="M8 18h.01" />
			<path d="M12 18h.01" />
			<path d="M16 18h.01" />
		</svg>
	);
}
