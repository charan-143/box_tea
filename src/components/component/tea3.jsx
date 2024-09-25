"use client";
import { Label } from "@/components/ui/label";

import { useState, useEffect } from "react";
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
// async function addMenuItem(name, description, price, image) {
// 	const { data, error } = await supabase
// 		.from("MenuItems")
// 		.insert({ name, description, price, image });

// 	if (error) {
// 		console.error("Error adding menu item:", error);
// 	} else {
// 		return data;
// 	}
// }

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
	const today = new Date();
	const date = today.toLocaleDateString().slice(0, 10);
	// const date = today.toISOString().slice(0, 10);
	const time = today.toTimeString().slice(0, 8);
	console.log(date, time);

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
											<Image
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

	const renderInputField = (label, id, placeholder, value, onChange) => (
		<div className="grid grid-cols-4 items-center gap-4">
			<Label htmlFor={id} className="">
				{label}
			</Label>
			<Input
				id={id}
				placeholder={placeholder}
				className="col-span-3"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
		</div>
	);

	const renderCartItems = () => (
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
						<TableCell>₹{(item.price * item.quantity).toFixed(2)}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);

	/**
	 * Handles the process of placing an order.
	 * Creates an order with the provided purpose, venue, customer, and cart details.
	 * On success, clears the cart, closes the checkout dialog, and sets the place order flag.
	 * On error, logs the error to the console.
	 */
	const handlePlaceOrder = () => {
		createOrder(purpose, venue, customer, cart)
			.then((orderId) => {
				setCart([]);
				setIsCheckoutDialogOpen(false);
				setPlaceOrder(true);
			})
			.catch((error) => {
				console.error("Error placing order:", error);
			});
	};

	const dialogContent = (
		<>
			<DialogHeader>
				<DialogTitle>Checkout</DialogTitle>
				<DialogDescription>
					Review your order and complete the checkout process.
				</DialogDescription>
			</DialogHeader>

			{renderInputField("Purpose", "name", "Item name", purpose, setPurpose)}
			{renderInputField(
				"Venue",
				"username",
				"Give description of the item",
				venue,
				setVenue
			)}
			{renderInputField(
				"Customer",
				"customer",
				"Customer Name",
				customer,
				setCustomer
			)}

			<div className="grid gap-4">
				{renderCartItems()}
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
				>
					Cancel
				</Button>
				<Button onClick={() => handlePlaceOrder()} disabled={cart.length === 0}>
					Place Order
				</Button>
			</DialogFooter>
		</>
	);

	return (
		<Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
			<DialogContent className="sm:max-w-lg">{dialogContent}</DialogContent>
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
