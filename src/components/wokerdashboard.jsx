"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import { ChevronDownIcon, CalendarIcon } from "@radix-ui/react-icons";

import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function WorkerDashboard() {
	const [orders, setOrders] = useState([]);
	const [sortOrder, setSortOrder] = useState("asc");
	const [currentPage, setCurrentPage] = useState(1);
	const [ordersPerPage] = useState(10);
	const [searchTerm, setSearchTerm] = useState("");
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [timeRange, setTimeRange] = useState("today");
	const [activeTab, setActiveTab] = useState("pending");

	// Combine data calculation into a single useEffect
	useEffect(() => {
		const fetchOrders = async () => {
			const { data, error } = await supabase.from("orders").select("*");
			if (error) {
				console.error("Error fetching orders:", error);
			} else {
				setOrders(data);
			}
		};

		fetchOrders();
	}, []);

	// Memoize filtered and sorted orders
	const filteredOrders = useMemo(() => {
		return orders.filter((order) => {
			const orderDate = new Date(order.date);
			const isInDateRange =
				(!startDate || orderDate >= startDate) &&
				(!endDate || orderDate <= endDate);
			const matchesSearch = Object.values(order).some(
				(value) =>
					typeof value === "string" &&
					value.toLowerCase().includes(searchTerm.toLowerCase())
			);
			return isInDateRange && matchesSearch;
		});
	}, [orders, startDate, endDate, searchTerm]);

	const sortedOrders = useMemo(() => {
		return [...filteredOrders].sort((a, b) => {
			const dateA = new Date(a.date);
			const dateB = new Date(b.date);
			return sortOrder === "desc" ? dateA - dateB : dateB - dateA;
		});
	}, [filteredOrders, sortOrder]);

	// Memoize pending and delivered orders
	const pendingOrders = useMemo(() => {
		return sortedOrders.filter(order => !order.given_time);
	}, [sortedOrders]);

	const deliveredOrders = useMemo(() => {
		return sortedOrders.filter(order => order.given_time);
	}, [sortedOrders]);

	const handleCheckboxChange = useCallback(async (orderId) => {
		const now = new Date().toLocaleTimeString();
		try {
			const { error } = await supabase
				.from("orders")
				.update({ given_time: now })
				.eq("id", orderId);

			if (error) {
				console.error("Error updating order:", error);
				return;
			}

			// Update orders state optimistically
			setOrders(prevOrders => prevOrders.map(o =>
				o.id === orderId ? { ...o, given_time: now } : o
			));
		} catch (error) {
			console.error("Error in handleCheckboxChange:", error);
		}
	}, []);

	const handleSearch = (e) => {
		setSearchTerm(e.target.value);
		setCurrentPage(1);
	};

	const handleDateChange = (type, date) => {
		if (type === "start") setStartDate(date);
		else setEndDate(date);
		setCurrentPage(1);
	};

	const handleTimeRangeChange = (value) => {
		setTimeRange(value);
		const now = new Date();
		switch (value) {
			case "today":
				setStartDate(new Date(now.setHours(0, 0, 0, 0)));
				setEndDate(new Date(now.setHours(23, 59, 59, 999)));
				break;
			case "this-month":
				setStartDate(new Date(now.getFullYear(), now.getMonth(), 1));
				setEndDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
				break;
			case "all":
				setStartDate(null);
				setEndDate(null);
				break;
			default:
				break;
		}
	};

	// Extract table rendering into a component
	const OrderTable = ({ ordersData }) => {
		return (
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Date</TableHead>
						<TableHead>Time</TableHead>
						<TableHead>Purpose</TableHead>
						<TableHead>Venue</TableHead>
						<TableHead>Items</TableHead>
						<TableHead>Quantity</TableHead>
						{activeTab === "pending" && (
							<>
								<TableHead>Given Time</TableHead>
								<TableHead>Action</TableHead>
							</>
						)}
					</TableRow>
				</TableHeader>
				<TableBody>
					{ordersData
						.slice(
							(currentPage - 1) * ordersPerPage,
							currentPage * ordersPerPage
						)
						.map((order) => (
							<TableRow key={order.id}>
								<TableCell>
									{new Date(order.date).toLocaleDateString()}
								</TableCell>
								<TableCell>{order.time}</TableCell>
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
								{activeTab === "pending" && (
									<>
										<TableCell>{order.given_time || "-"}</TableCell>
										<TableCell>
											<input
												type="checkbox"
												onChange={() => handleCheckboxChange(order.id)}
												checked={!!order.given_time}
												disabled={!!order.given_time}
											/>
										</TableCell>
									</>
								)}
							</TableRow>
						))}
				</TableBody>
			</Table>
		);
	};

	return (
		<><Header />
			<div className="container mx-auto p-4">
				<h1 className="text-2xl font-bold mb-4">Dashboard</h1>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Card className="col-span-2">
						<CardHeader>
							<CardTitle>Total Orders</CardTitle>
							<div className="flex justify-between items-center mb-4">
								<p className="text-4xl font-bold">{filteredOrders.length}</p>
								<div className="flex items-center space-x-2">
									<Button
										onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
									>
										Sort by Date {sortOrder === "asc" ? "↓" : "↑"}
									</Button>
									<Input
										type="text"
										placeholder="Search orders..."
										value={searchTerm}
										onChange={handleSearch} />
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="outline">
												{timeRange === "today"
													? "Today"
													: timeRange === "this-month"
														? "This Month"
														: timeRange === "custom"
															? "Custom Date"
															: "All Orders"}
												<ChevronDownIcon className="ml-2 h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent>
											<DropdownMenuItem
												onClick={() => handleTimeRangeChange("today")}
											>
												Today
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => handleTimeRangeChange("this-month")}
											>
												This Month
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => handleTimeRangeChange("all")}
											>
												All Orders
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => handleTimeRangeChange("custom")}
											>
												Custom Date
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</div>
							{timeRange === "custom" && (
								<div className="flex justify-end space-x-2 mb-4">
									{["start", "end"].map((type) => (
										<Popover key={type}>
											<PopoverTrigger asChild>
												<Button variant="outline">
													<CalendarIcon className="mr-2 h-4 w-4" />
													{type === "start" ? (
														startDate ? (
															format(startDate, "PPP")
														) : (
															<span>Start Date</span>
														)
													) : endDate ? (
														format(endDate, "PPP")
													) : (
														<span>End Date</span>
													)}
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0">
												<Calendar
													mode="single"
													selected={type === "start" ? startDate : endDate}
													onSelect={(date) => handleDateChange(type, date)}
													initialFocus />
											</PopoverContent>
										</Popover>
									))}
								</div>
							)}
						</CardHeader>
						<CardContent>
							<Tabs value={activeTab} onValueChange={setActiveTab}>
								<TabsList>
									<TabsTrigger value="pending">Pending Orders</TabsTrigger>
									<TabsTrigger value="delivered">Delivered Orders</TabsTrigger>
								</TabsList>
								<TabsContent value="pending">
									<OrderTable ordersData={pendingOrders} />
									<div className="mt-4 flex justify-center">
										{Array.from(
											{ length: Math.ceil(pendingOrders.length / ordersPerPage) },
											(_, i) => (
												<Button
													key={i}
													onClick={() => setCurrentPage(i + 1)}
													className={`mx-1 border-2 border-black text-black font-bold ${currentPage === i + 1 ? "bg-gray-500" : "bg-gray-300"}`}
												>
													{i + 1}
												</Button>
											)
										)}
									</div>
								</TabsContent>
								<TabsContent value="delivered">
									<OrderTable ordersData={deliveredOrders} />
									<div className="mt-4 flex justify-center">
										{Array.from(
											{ length: Math.ceil(deliveredOrders.length / ordersPerPage) },
											(_, i) => (
												<Button
													key={i}
													onClick={() => setCurrentPage(i + 1)}
													className={`mx-1 border-2 border-black text-black font-bold ${currentPage === i + 1 ? "bg-gray-500" : "bg-gray-300"}`}
												>
													{i + 1}
												</Button>
											)
										)}
									</div>
								</TabsContent>
							</Tabs>
						</CardContent>
					</Card>
				</div>
			</div></>
	);
}