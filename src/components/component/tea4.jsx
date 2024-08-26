"use client";
import { Label } from "@/components/ui/label";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { createClient } from "@supabase/supabase-js";

// Supabase configuration (replace with your actual values)
const supabaseUrl = "https://mamhjvhxwsedrqfxdwqx.supabase.co";
const supabaseKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hbWhqdmh4d3NlZHJxZnhkd3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ0MTQ4ODksImV4cCI6MjAzOTk5MDg4OX0.m5G-MFUL2hlq49mkzo3BIXVw4AdNvzkv97f04GaRiEo";

const supabase = createClient(supabaseUrl, supabaseKey);

// Tables:
// - MenuItems: Stores information about each menu item.
// - Orders: Stores information about placed orders.
// - OrderItems:  Stores information about individual items in an order.

// Initial Menu Data (replace with data from database)

// Initial Order Data (replace with data from database)

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

// Function to add a new Menu Item to Supabase
async function addMenuItem(name, description, price, image) {
	const { data, error } = await supabase
		.from("MenuItems")
		.insert({ name, description, price, image });

	if (error) {
		console.error("Error adding menu item:", error);
	} else {
		return data;
	}
}

// Function to create a new Order in Supabase
async function createOrder(purpose, venue, customer, items) {
	const { data, error } = await supabase
		.from("orders")
		.insert({ purpose, venue, customer, status: "Pending" });

	if (error) {
		console.error("Error creating order:", error);
	} else {
		const orderId = data[0].id; // Get the ID of the newly created order

		// Insert order items
		await Promise.all(
			items.map((item) =>
				supabase
					.from("orderItems")
					.insert({ orderId, itemId: item.id, quantity: item.quantity })
			)
		);

		return orderId;
	}
}
function Header({ setActiveTab, setIsProfileOpen }) {
	const [signIn, setSignIn] = useState(false);

	return (
		<header className="sticky top-0 z-10 border-b bg-background px-4 py-3 shadow-sm sm:px-6">
			<div className="container mx-auto flex items-center justify-between">
				<Link href="#" className="flex items-center gap-2" prefetch={false}>
					<CupSodaIcon className="h-6 w-6" />
					<span className="text-lg font-medium">Box Tea</span>
				</Link>
				<div className="flex items-center gap-4 sm:hidden">
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="ghost" size="icon">
								<MenuIcon className="h-5 w-5" />
								<span className="sr-only">Toggle menu</span>
							</Button>
						</SheetTrigger>
						<SheetContent side="left" className="sm:max-w-xs">
							<nav className="grid gap-4 text-lg font-medium">
								<Link
									href="/menu"
									className={`${setActiveTab === "menu" ? "text-primary" : ""}`}
								>
									Menu
								</Link>
								<Link
									href="/orders"
									className={`${
										setActiveTab === "orders" ? "text-primary" : ""
									}`}
								>
									Orders
								</Link>
							</nav>
						</SheetContent>
					</Sheet>
				</div>
				<div className="hidden sm:flex items-center gap-4">
					<Link
						href="/menu"
						className={`${setActiveTab === "menu" ? "text-primary" : ""}`}
					>
						Menu
					</Link>
					<Link
						href="/orders"
						className={`${setActiveTab === "orders" ? "text-primary" : ""}`}
					>
						Orders
					</Link>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon">
								<UserIcon className="h-5 w-5" />
								<span className="sr-only">Account</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem>
								<button onClick={() => setIsProfileOpen(true)}>
									<span>Profile</span>
								</button>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Link
									href="#"
									className="flex items-center gap-2"
									prefetch={false}
								>
									<LogInIcon className="h-4 w-4" />
									<span onClick={() => setSignIn(true)}>Sign In</span>
								</Link>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
			<Dialog open={signIn} onOpenChange={setSignIn}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Sign In</DialogTitle>
						<DialogDescription>
							Enter your email and password to access your account.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input id="email" type="email" placeholder="name@example.com" />
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input id="password" type="password" />
					</div>
					<Button className="w-full">Sign In</Button>
				</DialogContent>
			</Dialog>
		</header>
	);
}

function Main({ activeTab, setActiveTab }) {
	const [orderDate, setOrderDate] = useState(null);

	const [menuItems, setMenuItems] = useState([]);
	const [fetchedOrders, setFetchedOrders] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			const fetchedMenuItems = await fetchMenuItems();
			setMenuItems(fetchedMenuItems);

			const fetchedOrders = await fetchOrders();
			setFetchedOrders(fetchedOrders);
		};

		fetchData();
	}, []);

	const filteredOrders = useMemo(() => {
		if (orderDate) {
			return fetchedOrders.filter(
				(order) =>
					new Date(order.date).getFullYear() === orderDate.getFullYear()
			);
		}
		return fetchedOrders;
	}, [fetchedOrders, orderDate]);

	return (
		<main className="flex-1">
			<section className="py-12 sm:py-16 lg:py-5">
				<div className="container mx-auto px-4 sm:px-6">
					<div className="flex justify-center">
						<Card className="w-full max-w-3xl">
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
											<TableHead>Purpose</TableHead>
											<TableHead>Venue</TableHead>
											<TableHead>Items</TableHead>
											<TableHead>Quantity</TableHead>
											<TableHead>
												<span className="sr-only">Accept</span>
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredOrders.map((order) => (
											<TableRow key={order.id}>
												<TableCell>{order.date}</TableCell>
												<TableCell>{order.customer}</TableCell>
												<TableCell>VEnue</TableCell>
												<TableCell>
													{/* Fetch order items based on order.id */}
													{/* Display order items in the table */}
												</TableCell>
												<TableCell>
													{/* Display order item quantities in the table */}
												</TableCell>
												<TableCell>
													<Button variant="ghost" size="icon">
														<CheckCircleIcon className="h-4 w-4" />
													</Button>
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

function CheckoutDialog({
	isCheckoutDialogOpen,
	setIsCheckoutDialogOpen,
	cart,
	calculateTotal,
	setPlaceOrder,
}) {
	const [purpose, setPurpose] = useState("");
	const [venue, setVenue] = useState("");
	const [customer, setCustomer] = useState("");

	return (
		<Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Checkout</DialogTitle>
					<DialogDescription>
						Review your order and complete the checkout process.
					</DialogDescription>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="name" className="">
							Purpose
						</Label>
						<Input
							id="name"
							placeholder="Item name"
							className="col-span-3"
							value={purpose}
							onChange={(e) => setPurpose(e.target.value)}
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="username" className="">
							Venue
						</Label>
						<Input
							id="username"
							placeholder="Give description of the item"
							className="col-span-3"
							value={venue}
							onChange={(e) => setVenue(e.target.value)}
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="customer" className="">
							Customer
						</Label>
						<Input
							id="customer"
							placeholder="Customer Name"
							className="col-span-3"
							value={customer}
							onChange={(e) => setCustomer(e.target.value)}
						/>
					</div>
				</DialogHeader>

				<div className="grid gap-4">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Item</TableHead>
								<TableHead>Quantity</TableHead>
								<TableHead>Price</TableHead>
								<TableHead>Total</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{cart.map((item) => (
								<TableRow key={item.id}>
									<TableCell>{item.name}</TableCell>
									<TableCell>{item.quantity}</TableCell>
									<TableCell>${item.price.toFixed(2)}</TableCell>
									<TableCell>
										${(item.price * item.quantity).toFixed(2)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					<Separator />
					<div className="flex items-center justify-between">
						<span className="font-medium">Total:</span>
						<span className="font-medium">${calculateTotal().toFixed(2)}</span>
					</div>
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => setIsCheckoutDialogOpen(false)}
					>
						Cancel
					</Button>
					<DialogClose asChild>
						<Button
							onClick={() => {
								// Create the order in Supabase
								createOrder(purpose, venue, customer, cart)
									.then((orderId) => {
										// Update the cart
										setCart([]);
										// Close the dialog
										setIsCheckoutDialogOpen(false);
										// Show success dialog
										setPlaceOrder(true);
									})
									.catch((error) => {
										console.error("Error placing order:", error);
										// Handle error
									});
							}}
						>
							Place Order
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function PlaceOrderDialog({ placeOrder, setPlaceOrder }) {
	return (
		<Dialog open={placeOrder} onOpenChange={setPlaceOrder}>
			<DialogContent className="sm:max-w-[425px]">
				<div className="flex flex-col items-center justify-center gap-4 py-8">
					<ThumbsUpIcon className="size-12 text-green-500" />
					<p className="text-lg font-medium">Your order has been placed!</p>
				</div>
				<DialogFooter>
					<div>
						<DialogClose>
							<Button type="button">Done</Button>
						</DialogClose>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function Tea4() {
	const [activeTab, setActiveTab] = useState("menu");
	const [isProfileOpen, setIsProfileOpen] = useState(false);

	return (
		<div className="flex flex-col min-h-screen bg-background text-foreground">
			<Header setActiveTab={setActiveTab} setIsProfileOpen={setIsProfileOpen} />
			<Main />
			<Footer />
		</div>
	);
}

// ... (Rest of the code: Icons, etc.)

// ... (Rest of the code: Icons, etc.)
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

function CupSodaIcon(props) {
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
			<path d="m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8" />
			<path d="M5 8h14" />
			<path d="M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0" />
			<path d="m12 8 1-6h2" />
		</svg>
	);
}

function LogInIcon(props) {
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
			<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
			<polyline points="10 17 15 12 10 7" />
			<line x1="15" x2="3" y1="12" y2="12" />
		</svg>
	);
}

function MenuIcon(props) {
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
			<line x1="4" x2="20" y1="12" y2="12" />
			<line x1="4" x2="20" y1="6" y2="6" />
			<line x1="4" x2="20" y1="18" y2="18" />
		</svg>
	);
}

function UserIcon(props) {
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
			<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
			<circle cx="12" cy="7" r="4" />
		</svg>
	);
}

function UserPlusIcon(props) {
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
			<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
			<circle cx="9" cy="7" r="4" />
			<line x1="19" x2="19" y1="8" y2="14" />
			<line x1="22" x2="16" y1="11" y2="11" />
		</svg>
	);
}

function ThumbsUpIcon(props) {
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
			<path d="M7 10v12" />
			<path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
		</svg>
	);
}

function CloudUploadIcon(props) {
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
			<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
			<path d="M12 12v9" />
			<path d="m16 16-4-4-4 4" />
		</svg>
	);
}

function CheckCircleIcon(props) {
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
			<path d="M22 11.08V12a10 10 0 1 1-5.93-13.91" />
			<path d="M22 4L12 14.01l-3-3" />
		</svg>
	);
}
