"use client";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { Header } from "@/components/header";

const fetchMenuItems = async () => {
	const { data, error } = await supabase.from("menuitems").select("*");
	if (error) {
		console.error("Error fetching menu items:", error);
		return [];
	}
	return data;
};

const fetchOrders = async () => {
	const { data, error } = await supabase.from("orders").select("*");
	if (error) {
		console.error("Error fetching orders:", error);
		return [];
	}
	return data;
};

const createOrder = async (purpose, venue, customer, cart) => {
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
	const today = new Date();
	const date = today.toLocaleDateString().slice(0, 10);
	const time = today.toTimeString().slice(0, 8);

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
};

function Main() {
	const [cart, setCart] = useState([]);
	const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
	const [placeOrder, setPlaceOrder] = useState(false);
	const [menuItems, setMenuItems] = useState([]);
	const [fetchedOrders, setFetchedOrders] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [orderError, setOrderError] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			const [fetchedMenuItems, fetchedOrders] = await Promise.all([
				fetchMenuItems(),
				fetchOrders(),
			]);
			setMenuItems(fetchedMenuItems);
			setFetchedOrders(fetchedOrders);
		};
		fetchData();
	}, []);

	const addToCart = useCallback((item) => {
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
	}, []);

	const removeFromCart = useCallback((item) => {
		setCart((prevCart) => prevCart.filter((i) => i.id !== item.id));
	}, []);

	const updateCartQuantity = useCallback(
		(item, quantity) => {
			if (quantity === 0) {
				removeFromCart(item);
			} else {
				setCart((prevCart) =>
					prevCart.map((i) =>
						i.id === item.id ? { ...i, quantity: quantity } : i
					)
				);
			}
		},
		[removeFromCart]
	);

	const calculateTotal = useCallback(() => {
		return cart.reduce((total, item) => total + item.price * item.quantity, 0);
	}, [cart]);

	const handleCreateOrder = async (purpose, venue, customer) => {
		setOrderError(null);
		setIsLoading(true);
		try {
			const orderId = await createOrder(purpose, venue, customer, cart);
			setCart([]);
			setIsCheckoutDialogOpen(false);
			setPlaceOrder(true);
			toast({
				title: "Order Placed!",
				description: "Your order has been placed successfully.",
			});
		} catch (error) {
			console.error("Error creating order:", error);
			setOrderError("Failed to place order. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<main className="flex-1">
			<section className="py-12 sm:py-16 lg:py-5">
				<div className="container mx-auto px-4 sm:px-6">
					<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 justify-center">
						{menuItems
							.sort((a, b) => a.id - b.id)
							.map((item) => {
								const cartItem = cart.find((i) => i.id === item.id);
								const quantity = cartItem ? cartItem.quantity : 0;
								return (
									<li
										key={item.id}
										className="flex justify-between items-center py-4 px-6 bg-white shadow-lg rounded-xl"
									>
										<div className="flex items-center space-x-4">
											<img
												src={item.image}
												alt={item.name}
												width={60}
												height={60}
												className="rounded-lg"
											/>
											<div className="flex flex-col">
												<span className="font-semibold text-lg text-gray-900 whitespace-normal">
													{item.name}
												</span>
												<span className="text-sm text-gray-600 mt-2">
													₹{item.price.toFixed(2)}
												</span>
											</div>
										</div>
										<div className="flex items-center space-x-4">
											<div className="flex items-center space-x-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => removeFromCart(item)}
													className="text-gray-700 hover:text-gray-900"
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
													className="w-20 text-center text-gray-900"
												/>
												<Button
													variant="outline"
													size="sm"
													onClick={() => addToCart(item)}
													className="text-gray-700 hover:text-gray-900"
												>
													+
												</Button>
											</div>
										</div>
									</li>
								);
							})}
					</div>
				</div>
			</section>

			<div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10">
				<Button
					variant="outline"
					onClick={() => setIsCheckoutDialogOpen(true)}
					disabled={isLoading}
				>
					{isLoading ? "Processing..." : `Checkout (${cart.length})`}
				</Button>
			</div>

			<CheckoutDialog
				isCheckoutDialogOpen={isCheckoutDialogOpen}
				setIsCheckoutDialogOpen={setIsCheckoutDialogOpen}
				cart={cart}
				setCart={setCart}
				calculateTotal={calculateTotal}
				setPlaceOrder={setPlaceOrder}
				isLoading={isLoading}
				handleCreateOrder={handleCreateOrder}
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
	isLoading,
	handleCreateOrder,
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
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-center">
						<Label htmlFor="name" className="sm:col-span-1">
							Purpose
						</Label>
						<Input
							id="name"
							placeholder="Item name"
							className="sm:col-span-3"
							value={purpose}
							onChange={(e) => setPurpose(e.target.value)}
						/>
					</div>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-center">
						<Label htmlFor="username" className="sm:col-span-1">
							Venue
						</Label>
						<Input
							id="username"
							placeholder="Give description of the item"
							className="sm:col-span-3"
							value={venue}
							onChange={(e) => setVenue(e.target.value)}
						/>
					</div>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-center">
						<Label htmlFor="customer" className="sm:col-span-1">
							Customer
						</Label>
						<Input
							id="customer"
							placeholder="Customer Name"
							className="sm:col-span-3"
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
									<TableCell>₹{item.price.toFixed(2)}</TableCell>
									<TableCell>
										₹{(item.price * item.quantity).toFixed(2)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					<Separator />
					<div className="flex items-center justify-between">
						<span className="font-medium">Total:</span>
						<span className="font-medium">₹{calculateTotal().toFixed(2)}</span>
					</div>
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => setIsCheckoutDialogOpen(false)}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<DialogClose asChild>
						<Button
							className="w-full py-3 text-lg"
							onClick={(event) => {
								event.stopPropagation();
								handleCreateOrder(purpose, venue, customer);
							}}
							disabled={isLoading}
						>
							{isLoading ? "Placing Order..." : "Place Order"}
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
				<DialogHeader>
					<DialogTitle>Order Confirmation</DialogTitle>
					<DialogDescription>
						Your order has been successfully placed.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col items-center justify-center gap-4 py-8">
					<ThumbsUpIcon className="size-12 text-green-500" />
					<p className="text-lg font-medium">Thank you for your order!</p>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button type="button">Done</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function Tea3() {
	const [activeTab, setActiveTab] = useState("menu");
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const handleLogout = () => {
		console.log("User logged out");
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
