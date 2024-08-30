"use client";
import { Label } from "@/components/ui/label";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
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
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { DialogClose } from "@radix-ui/react-dialog";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

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
async function createOrder(purpose, venue, customer, cart) {
	const items = cart.map((item) => ({ id: item.name }));
	const quantities = cart.map((item) => ({ quantity: item.quantity }));

	const getUserEmail = async () => {
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();
		if (error) {
			console.error("Error fetching user:", error);
			return null;
		}
		return user?.email;
	};

	const user = await getUserEmail();
	const now = new Date();
	const date = now.toISOString().slice(0, 10);
	const time = now.toTimeString().slice(0, 8);

	const { data, error } = await supabase
		.from("orders")
		.insert({
			date,
			time,
			purpose,
			venue,
			customer,
			status: "Pending",
			items,
			quantities,
			user,
		})
		.select()
		.single();

	if (error) {
		console.error("Error creating order:", error);
		throw error;
	}

	if (!data) {
		console.error("No data returned from order creation");
		throw new Error("Failed to create order");
	}

	return data.id;
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
							<Link href={"/profile"} prefetch={false}>
								<DropdownMenuItem>
									<button onClick={() => setIsProfileOpen(true)}>
										<span>Profile</span>
									</button>
								</DropdownMenuItem>
							</Link>
							<DropdownMenuItem>
								<Link
									href="#"
									className="flex items-center gap-2"
									prefetch={false}
								>
									<LogInIcon className="h-4 w-4" />
									<span onClick={() => setSignIn(true)}>Sign out</span>
								</Link>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
			{/* <Dialog open={signIn} onOpenChange={setSignIn}>
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
			</Dialog> */}
		</header>
	);
}

function Main() {
	const [cart, setCart] = useState([]);
	const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
	const [placeOrder, setPlaceOrder] = useState(false);
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
	const addToCart = (item) => {
		setCart((prevCart) => {
			const existingItemIndex = prevCart.findIndex((i) => i.id === item.id);
			if (existingItemIndex !== -1) {
				const updatedCart = [...prevCart];
				updatedCart[existingItemIndex].quantity++;
				return updatedCart;
			} else {
				return [...prevCart, { ...item, quantity: 1 }];
			}
		});
	};
	const removeFromCart = (item) => {
		setCart((prevCart) => prevCart.filter((i) => i.id !== item.id));
	};
	const updateCartQuantity = (item, quantity) => {
		if (quantity === 0) {
			removeFromCart(item);
		} else {
			setCart((prevCart) =>
				prevCart.map((i) =>
					i.id === item.id ? { ...i, quantity: quantity } : i
				)
			);
		}
	};
	const calculateTotal = () => {
		return cart.reduce((total, item) => total + item.price * item.quantity, 0);
	};

	return (
		<main className="flex-1">
			<section className="py-12 sm:py-16 lg:py-5">
				<div className="container mx-auto px-4 sm:px-6">
					<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 justify-center">
						{menuItems.map((item) => {
							const cartItem = cart.find((i) => i.id === item.id);
							const quantity = cartItem ? cartItem.quantity : 0;
							return (
								<Card
									key={item.id}
									className="bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
								>
									<div className="flex flex-col items-center gap-4 p-6">
										<Image
											src={item.image}
											alt={item.name}
											width={150}
											height={150}
											className="rounded-md"
											style={{ aspectRatio: "150/150", objectFit: "cover" }}
										/>
										<div className="text-center">
											<h3 className="font-medium">{item.name}</h3>
											<p className="text-muted-foreground">
												{item.description}
											</p>
											<p className="font-medium">${item.price.toFixed(2)}</p>
										</div>
										<div className="flex items-center gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													if (quantity > 0) {
														updateCartQuantity(item, quantity - 1);
													} else {
														removeFromCart(item);
													}
												}}
											>
												-
											</Button>
											<Input
												type="number"
												min="0"
												value={quantity.toString()}
												onChange={(e) =>
													updateCartQuantity(
														item,
														parseInt(e.target.value) || 0
													)
												}
												className="w-16 text-center"
											/>
											<Button
												variant="outline"
												size="sm"
												onClick={() => addToCart(item)}
											>
												+
											</Button>
											{/* {cart.length} */}
										</div>
									</div>
								</Card>
							);
						})}
					</div>
				</div>
			</section>

			<div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10">
				<Button variant="outline" onClick={() => setIsCheckoutDialogOpen(true)}>
					Checkout ({cart.length})
				</Button>
			</div>

			<CheckoutDialog
				isCheckoutDialogOpen={isCheckoutDialogOpen}
				setIsCheckoutDialogOpen={setIsCheckoutDialogOpen}
				cart={cart}
				setCart={setCart}
				calculateTotal={calculateTotal}
				setPlaceOrder={setPlaceOrder}
			/>
			<PlaceOrderDialog placeOrder={placeOrder} setPlaceOrder={setPlaceOrder} />
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
	setCart,
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
								createOrder(purpose, venue, customer, cart)
									.then((orderId) => {
										setCart([]);
										setIsCheckoutDialogOpen(false);
										setPlaceOrder(true);
									})
									.catch((error) => {
										console.error("Error placing order:", error);
										// Display an error message to the user
										// For example, you could set an error state and show it in the UI
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

export function Tea3() {
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
