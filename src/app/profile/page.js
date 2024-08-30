"use client";
import AuthWrapper from "@/components/AuthWrapper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, User, Users } from "lucide-react";
import Link from "next/link";
import { CupSodaIcon } from "lucide-react";
import { MenuIcon, UserIcon, LogInIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

function Header({ setActiveTab, setIsProfileOpen }) {
	const router = useRouter();

	const handleSignOut = async () => {
		await supabase.auth.signOut();
		router.push('/signin');
	};

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
								<button onClick={handleSignOut} className="flex items-center gap-2">
									<LogInIcon className="h-4 w-4" />
									<span>Sign Out</span>
								</button>
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
export default function Component() {
	return (
		<AuthWrapper>
			<Header />
			<div className="flex items-center justify-center min-h-screen bg-gray-100">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<Avatar className="w-24 h-24 mx-auto mb-4">
							<AvatarImage
								src="/placeholder.svg?height=96&width=96"
								alt="User Avatar"
							/>
							<AvatarFallback>UN</AvatarFallback>
						</Avatar>
						<CardTitle className="text-2xl font-bold">User Profile</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center space-x-4">
							<Users className="w-6 h-6 text-gray-500" />
							<div>
								<p className="text-sm font-medium text-gray-500">Department</p>
								<p className="text-lg font-semibold">Computer Science</p>
							</div>
						</div>
						<div className="flex items-center space-x-4">
							<User className="w-6 h-6 text-gray-500" />
							<div>
								<p className="text-sm font-medium text-gray-500">HOD</p>
								<p className="text-lg font-semibold">Dr. Jane Smith</p>
							</div>
						</div>
						<div className="flex items-center space-x-4">
							<User className="w-6 h-6 text-gray-500" />
							<div>
								<p className="text-sm font-medium text-gray-500">
									Computer Operator
								</p>
								<p className="text-lg font-semibold">John Doe</p>
							</div>
						</div>
						<div className="flex items-center space-x-4">
							<Phone className="w-6 h-6 text-gray-500" />
							<div>
								<p className="text-sm font-medium text-gray-500">Phone No</p>
								<p className="text-lg font-semibold">+1 (555) 123-4567</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</AuthWrapper>
	);
}
