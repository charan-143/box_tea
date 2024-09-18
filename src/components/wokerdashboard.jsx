"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
	CardFooter,
} from "@/components/ui/card";
import { Header } from "@/components/header";
// import { Pie } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	ArcElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
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

import {
	Bar,
	BarChart,
	CartesianGrid,
	LabelList,
	XAxis,
	YAxis,
	Label,
	Pie,
	PieChart,
	Cell,
} from "recharts";

import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
	visitors: {
		label: "Visitors",
	},
	chrome: {
		label: "Chrome",
		color: "hsl(var(--chart-1))",
	},
	safari: {
		label: "Safari",
		color: "hsl(var(--chart-2))",
	},
	firefox: {
		label: "Firefox",
		color: "hsl(var(--chart-3))",
	},
	edge: {
		label: "Edge",
		color: "hsl(var(--chart-4))",
	},
	other: {
		label: "Other",
		color: "hsl(var(--chart-5))",
	},
};

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	ArcElement,
	Title,
	Tooltip,
	Legend
);

export function WorkerDashboard() {
	const [orders, setOrders] = useState([]);
	const [sortOrder, setSortOrder] = useState("asc");
	const [currentPage, setCurrentPage] = useState(1);
	const [ordersPerPage] = useState(10);
	const [searchTerm, setSearchTerm] = useState("");
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [timeRange, setTimeRange] = useState("today");
	const [ordersToday, setOrdersToday] = useState(0);
	const [ordersThisMonth, setOrdersThisMonth] = useState(0);
	const [topSellingItem, setTopSellingItem] = useState("N/A");
	const [frequentCustomer, setFrequentCustomer] = useState("N/A");

	const fetchOrders = useCallback(async () => {
		const { data, error } = await supabase.from("orders").select("*");
		if (error) {
			console.error("Error fetching orders:", error);
		} else {
			setOrders(data);
		}
	}, []);

	const calculateData = useCallback(() => {
		const monthlySales = {};
		const topItems = {};
		const salesByPurpose = {};
		const salesByVenue = {};
		const today = new Date();
		const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);

		orders.forEach((order) => {
			const orderDate = new Date(order.date);
			if (orderDate >= twoMonthsAgo) {
				const monthYear = `${orderDate.getFullYear()}-${(
					orderDate.getMonth() + 1
				)
					.toString()
					.padStart(2, "0")}`;
				const totalQuantity = order.quantities.reduce(
					(sum, q) => sum + q.quantity,
					0
				);
				monthlySales[monthYear] =
					(monthlySales[monthYear] || 0) + totalQuantity;
			}

			order.items.forEach((item, index) => {
				topItems[item.id] =
					(topItems[item.id] || 0) + order.quantities[index].quantity;
			});

			const totalQuantity = order.quantities.reduce(
				(sum, q) => sum + q.quantity,
				0
			);
			salesByPurpose[order.purpose] =
				(salesByPurpose[order.purpose] || 0) + totalQuantity;
			salesByVenue[order.venue] =
				(salesByVenue[order.venue] || 0) + totalQuantity;
		});

		let maxSales = 0;
		let topItem = "N/A";
		Object.entries(topItems).forEach(([item, sales]) => {
			if (sales > maxSales) {
				maxSales = sales;
				topItem = item;
			}
		});

		const customerFrequency = {};
		orders.forEach((order) => {
			customerFrequency[order.customer] =
				(customerFrequency[order.customer] || 0) + 1;
		});

		let maxFrequency = 0;
		let mostFrequentCustomer = "N/A";
		Object.entries(customerFrequency).forEach(([customer, frequency]) => {
			if (frequency > maxFrequency) {
				maxFrequency = frequency;
				mostFrequentCustomer = customer;
			}
		});

		return {
			monthlySales,
			topItems,
			salesByPurpose,
			salesByVenue,
			topItem,
			mostFrequentCustomer,
		};
	}, [orders]);

	const {
		monthlySales,
		topItems,
		salesByPurpose,
		salesByVenue,
		topItem,
		mostFrequentCustomer,
	} = useMemo(() => calculateData(), [calculateData]);

	const sortedOrders = useMemo(() => {
		return [...orders].sort((a, b) => {
			const dateA = new Date(a.date);
			const dateB = new Date(b.date);
			return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
		});
	}, [orders, sortOrder]);

	const filteredOrders = useMemo(() => {
		return sortedOrders.filter((order) => {
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
	}, [sortedOrders, searchTerm, startDate, endDate]);

	const chartOptions = {
		responsive: true,
		animation: { duration: 500 },
	};

	const chartData = useMemo(
		() => ({
			monthlySales: {
				labels: Object.keys(monthlySales).sort(),
				datasets: [
					{
						label: "Monthly Sales",
						data: Object.keys(monthlySales)
							.sort()
							.map((key) => monthlySales[key]),
						backgroundColor: "rgba(75, 192, 192, 0.6)",
					},
				],
			},
			topItems: {
				labels: Object.keys(topItems).slice(0, 5),
				datasets: [
					{
						label: "Top Selling Items",
						data: Object.values(topItems).slice(0, 5),
						backgroundColor: "rgba(153, 102, 255, 0.6)",
					},
				],
			},
			salesByPurpose: {
				labels: Object.keys(salesByPurpose),
				datasets: [
					{
						data: Object.values(salesByPurpose),
						backgroundColor: [
							"rgba(255, 99, 132, 0.6)",
							"rgba(54, 162, 235, 0.6)",
							"rgba(255, 206, 86, 0.6)",
							"rgba(75, 192, 192, 0.6)",
							"rgba(153, 102, 255, 0.6)",
						],
					},
				],
			},
			salesByVenue: {
				labels: Object.keys(salesByVenue),
				datasets: [
					{
						label: "Sales by Venue",
						data: Object.values(salesByVenue),
						backgroundColor: "rgba(255, 159, 64, 0.6)",
					},
				],
			},
		}),
		[monthlySales, topItems, salesByPurpose, salesByVenue]
	);

	const handleCheckboxChange = useCallback(async (orderId) => {
		const now = new Date().toLocaleTimeString();
		try {
			const { data, error } = await supabase
				.from("orders")
				.update({ given_time: now })
				.eq("id", orderId);
		
			if (error) {
				console.error("Error updating order:", error);
				return;
			}
		
			setOrders((prevOrders) =>
				prevOrders.map((o) =>
					o.id === orderId ? { ...o, given_time: now } : o
				)
			);
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

	const calculateOrdersToday = useCallback(() => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		return orders.filter((order) => new Date(order.date) >= today).length;
	}, [orders]);

	const calculateOrdersThisMonth = useCallback(() => {
		const now = new Date();
		const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

		return orders.filter((order) => new Date(order.date) >= firstDayOfMonth)
			.length;
	}, [orders]);

	useEffect(() => {
		fetchOrders();
		setOrdersToday(calculateOrdersToday());
		setOrdersThisMonth(calculateOrdersThisMonth());
		setTopSellingItem(topItem);
		setFrequentCustomer(mostFrequentCustomer);
	}, [
		fetchOrders,
		calculateOrdersToday,
		calculateOrdersThisMonth,
		calculateData,
		topItem,
	]);

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
									Sort by Date {sortOrder === "asc" ? "↑" : "↓"}
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
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>Time</TableHead>
									<TableHead>Purpose</TableHead>
									<TableHead>Venue</TableHead>
									<TableHead>Total Quantity</TableHead>
									<TableHead>Given Time</TableHead>
									<TableHead>Action</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredOrders
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
												{order.quantities.reduce(
													(sum, q) => sum + q.quantity,
													0
												)}
											</TableCell>
											<TableCell>{order.given_time || "-"}</TableCell>
											<TableCell>
												<input
													type="checkbox"
													onChange={() => handleCheckboxChange(order.id)}
													checked={!!order.given_time}
													disabled={!!order.given_time}
												/>
											</TableCell>
										</TableRow>
									))}
							</TableBody>
						</Table>
						<div className="mt-4 flex justify-center">
							{Array.from(
								{ length: Math.ceil(filteredOrders.length / ordersPerPage) },
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
					</CardContent>
				</Card>
			</div>
		</div></>
	);
}
