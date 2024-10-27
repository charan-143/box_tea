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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export function Dashboard() {
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
	const [activeTab, setActiveTab] = useState("pending");
	const [users_data,setUsersData] = useState([]);

	const fetchOrders = useCallback(async () => {
		const { data, error } = await supabase.from("orders").select("*");
		if (error) {
			console.error("Error fetching orders:", error);
			return [];
		}
		return data;
	}, []);

	const fetchusers_data = useCallback(async () => {
		const { data, error } = await supabase.from("users_data").select("*");
		if (error) {
			console.error("Error fetching users data:", error);
			return [];
		}
		return data;
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

	const handleCheckboxChange = useCallback((orderId) => {
		const now = new Date().toLocaleTimeString();
		setOrders((prevOrders) =>
			prevOrders.map((o) =>
				o.id === orderId ? { ...o, givenTime: now, checkboxDisabled: true } : o
			)
		);
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
		const loadData = async () => {
			try {
				const fetchedOrders = await fetchOrders();
				const fetchedUsers = await fetchusers_data();
				setOrders(fetchedOrders || []);
				setUsersData(fetchedUsers || []);
				
				// Calculate and set other state values
				setOrdersToday(calculateOrdersToday());
				setOrdersThisMonth(calculateOrdersThisMonth());
				setTopSellingItem(topItem);
				setFrequentCustomer(mostFrequentCustomer);
			} catch (error) {
				console.error("Error loading data:", error);
			}
		};

		loadData();
	}, [
		fetchOrders,
		fetchusers_data,
		calculateOrdersToday,
		calculateOrdersThisMonth,
		calculateData,
		topItem,
		mostFrequentCustomer
	]);
	const OrderTable = ({ ordersData }) => {
		return (
			<div className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Date</TableHead>
							<TableHead>Time</TableHead>
							<TableHead>Department</TableHead>
							<TableHead>Purpose</TableHead>
							<TableHead>Venue</TableHead>
							<TableHead>Items</TableHead>
							<TableHead>Quantity</TableHead>
							<TableHead>Given Time</TableHead>
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
									<TableCell className="md:table-cell block">
										<span className="md:hidden font-bold mr-2">Date:</span>
										{new Date(order.date).toLocaleDateString()}
									</TableCell>
									<TableCell className="md:table-cell block">
										<span className="md:hidden font-bold mr-2">Time:</span>
										{order.time}
									</TableCell>
									<TableCell>{order.department}</TableCell>
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
									<TableCell>{order.given_time}</TableCell>

									{activeTab === "pending" && (
										<>
											<TableCell className="md:table-cell block">
												<span className="md:hidden font-bold mr-2">
													Given Time:
												</span>
												{order.given_time || "-"}
											</TableCell>
											<TableCell className="md:table-cell block">
												<span className="md:hidden font-bold mr-2">
													Action:
												</span>
												<input
													type="checkbox"
													id={`order-checkbox-${order.id}`}
													name={`order-checkbox-${order.id}`}
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
			</div>
		);
	};
	const pendingOrders = useMemo(() => {
		if (!Array.isArray(users_data)) return [];
		return sortedOrders.filter((order) => !order.given_time).map(order => ({
			...order,
			department: users_data.find(user => user.users_email === order.user)?.department_name || 'N/A'
		}));
	}, [sortedOrders, users_data]);

	const deliveredOrders = useMemo(() => {
		if (!Array.isArray(users_data)) return [];
		return sortedOrders.filter((order) => order.given_time).map(order => ({
			...order,
			department: users_data.find(user => user.users_email === order.user)?.department_name || 'N/A'
		}));
	}, [sortedOrders, users_data]);
	const pendingOrdersCount = useMemo(
		() => pendingOrders.length,
		[pendingOrders]
	);
	const deliveredOrdersCount = useMemo(
		() => deliveredOrders.length,
		[deliveredOrders]
	);
	

	return (
		<><Header />
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">Dashboard</h1>

			<Card>
				<CardHeader>
					<CardTitle>Quick Stats</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<h3 className="text-lg font-semibold">Orders Today</h3>

							<p className="text-2xl font-bold">{ordersToday || 0}</p>
						</div>
						<div>
							<h3 className="text-lg font-semibold">Orders This Month</h3>

							<p className="text-2xl font-bold">{ordersThisMonth || 0}</p>
						</div>
						<div>
							<h3 className="text-lg font-semibold">Top Selling Item</h3>

							<p className="text-xl">{topSellingItem || "N/A"}</p>
						</div>
						<div>
							<h3 className="text-lg font-semibold">Frequent Customer</h3>

							<p className="text-xl">{frequentCustomer || "N/A"}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				
				<Card>
					<CardHeader>
						<CardTitle>Last 2 Months Sales</CardTitle>
					</CardHeader>
					<CardContent>
						<ChartContainer config={chartConfig}>
							<BarChart
								accessibilityLayer
								data={[
									...chartData.monthlySales.labels
										.slice(-2)
										.map((label, index) => ({
											month: new Date(label).toLocaleString("default", {
												month: "long",
											}),
											desktop: chartData.monthlySales.datasets[0].data.slice(-2)[index],
										})),
								]}
								margin={{
									top: 20,
								}}
							>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="month"
									tickLine={false}
									tickMargin={10}
									axisLine={false} />
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent hideLabel />} />
								<Bar dataKey="desktop" fill="#4DB6AC" radius={8}>
									<LabelList
										position="top"
										offset={12}
										className="fill-foreground"
										fontSize={12} />
								</Bar>
							</BarChart>
						</ChartContainer>
					</CardContent>
				</Card>
		
				<Card>
					<CardHeader>
						<CardTitle>Top Selling Item</CardTitle>
					</CardHeader>
					<CardContent>
						<ChartContainer config={chartConfig}>
							<BarChart
								accessibilityLayer
								data={chartData.topItems.datasets[0].data.map(
									(value, index) => ({
										month: chartData.topItems.labels[index],
										desktop: value,
									})
								)}
								layout="vertical"
								height={400}
							>
								<XAxis type="number" dataKey="desktop" />
								<YAxis
									dataKey="month"
									type="category"
									tickLine={false}
									tickMargin={10}
									axisLine={false}
									tickFormatter={(value) => value}
									width={90} />
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent hideLabel />} />
								<Bar dataKey="desktop" fill="#ff6b6b" radius={5}>
									<LabelList
										dataKey="desktop"
										position="right"
										offset={5}
										fill="#023047"
										fontSize={12} />
								</Bar>
							</BarChart>
						</ChartContainer>
					</CardContent>
				</Card>
			
				<Card className="flex flex-col">
					<CardHeader className="items-center pb-0">
						<CardTitle>Sales by Purpose</CardTitle>
					</CardHeader>
					<CardContent className="flex-1 pb-0">
						<ChartContainer
							config={chartConfig}
							className="mx-auto aspect-square max-h-[300px]"
						>
							<PieChart width={400} height={400}>
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent hideLabel />} />
								<Pie
									data={chartData.salesByPurpose.datasets[0].data.map(
										(value, index) => ({
											browser: chartData.salesByPurpose.labels[index],
											visitors: value,
										})
									)}
									dataKey="visitors"
									nameKey="browser"
									innerRadius={70}
									outerRadius={100}
									strokeWidth={5}
									fill="#FF6B6B"
								>
									{chartData.salesByPurpose.datasets[0].data.map((_, index) => (
										<Cell
											key={`cell-${index}`}
											fill={[
												"#FF6B6B",
												"#4ECDC4",
												"#45B7D1",
												"#FFA07A",
												"#98D8C8",
												"#F06292",
												"#FFD700",
												"#9370DB",
												"#20B2AA",
												"#FF4500",
												"#32CD32",
												"#BA55D3",
											][index % 12]} />
									))}
									<Label
										content={({ viewBox }) => {
											const { cx, cy } = viewBox;
											return (
												<text
													x={cx}
													y={cy}
													textAnchor="middle"
													dominantBaseline="middle"
												>
													<tspan
														x={cx}
														y={cy}
														className="fill-foreground text-3xl font-bold"
													>
														{chartData.salesByPurpose.datasets[0].data.reduce(
															(a, b) => a + b,
															0
														)}
													</tspan>
													<tspan
														x={cx}
														y={cy + 24}
														className="fill-muted-foreground"
													>
														Total
													</tspan>
												</text>
											);
										} } />
								</Pie>
							</PieChart>
						</ChartContainer>
					</CardContent>
				</Card>
			
				<Card>
					<CardHeader>
						<CardTitle>Sales by Venue</CardTitle>
					</CardHeader>
					<CardContent>
						<ChartContainer config={chartConfig}>
							<BarChart
								accessibilityLayer
								data={chartData.salesByVenue.datasets[0].data.map(
									(value, index) => ({
										month: chartData.salesByVenue.labels[index],
										desktop: value,
									})
								)}
								margin={{
									top: 20,
								}}
							>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="month"
									tickLine={false}
									tickMargin={10}
									axisLine={false} />
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent hideLabel />} />
								<Bar dataKey="desktop" fill="#7CB9E8" radius={8}>
									<LabelList
										position="top"
										offset={12}
										className="fill-foreground"
										fontSize={12} />
								</Bar>
							</BarChart>
						</ChartContainer>
					</CardContent>
				</Card>
			
				<Card  className="col-span-2">
						<CardHeader>
							<CardTitle>Order Summary</CardTitle>
							<div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center mb-4">
								<div className="flex flex-col space-y-2">
									<p className="text-4xl font-bold">{filteredOrders.length}</p>
									<p className="text-2xl font-bold">Total Orders</p>
								</div>
								<div className="flex flex-col space-y-2">
									<p className="text-4xl font-bold">{pendingOrdersCount}</p>
									<p className="text-2xl font-bold">Pending Orders</p>
								</div>
								<div className="flex flex-col space-y-2">
									<p className="text-4xl font-bold">{deliveredOrdersCount}</p>
									<p className="text-2xl font-bold">Delivered Orders</p>
								</div>
							</div>
							<div className="flex flex-col space-y-4 md:flex-row md:justify-end md:items-center mb-4">
								<div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
									<Button
										onClick={() =>
											setSortOrder(sortOrder === "asc" ? "desc" : "asc")
										}
										className="w-full md:w-auto"
									>
										Sort by Date {sortOrder === "asc" ? "↓" : "↑"}
									</Button>
									<Input
										type="text"
										id="order-search"
										name="order-search"
										value={searchTerm}
										onChange={handleSearch}
										placeholder="Search orders..."
										className="w-full md:w-auto"
									/>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="outline" className="w-full md:w-auto">
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
								<div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 mb-4">
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
													initialFocus
												/>
											</PopoverContent>
										</Popover>
									))}
								</div>
							)}
						</CardHeader>
						<CardContent>
							<Tabs value={activeTab} onValueChange={setActiveTab}>
								<TabsList className="w-full">
									<TabsTrigger value="pending" className="flex-1">
										Pending Orders
									</TabsTrigger>
									<TabsTrigger value="delivered" className="flex-1">
										Delivered Orders
									</TabsTrigger>
								</TabsList>
								<TabsContent value="pending">
									<OrderTable ordersData={pendingOrders} />
									<div className="mt-4 flex justify-center">
										{Array.from(
											{
												length: Math.ceil(pendingOrders.length / ordersPerPage),
											},
											(_, i) => (
												<Button
													key={i}
													onClick={() => setCurrentPage(i + 1)}
													className={`mx-1 border-2 border-black text-black font-bold ${
														currentPage === i + 1
															? "bg-gray-500"
															: "bg-gray-300"
													}`}
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
											{
												length: Math.ceil(
													deliveredOrders.length / ordersPerPage
												),
											},
											(_, i) => (
												<Button
													key={i}
													onClick={() => setCurrentPage(i + 1)}
													className={`mx-1 border-2 border-black text-black font-bold ${
														currentPage === i + 1
															? "bg-gray-500"
															: "bg-gray-300"
													}`}
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
