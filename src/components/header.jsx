import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { supabase } from "@/lib/supabase";
import { CupSodaIcon, MenuIcon, UserIcon, LogOutIcon } from "lucide-react";

export function Header({ setActiveTab, setIsProfileOpen, onLogout }) {
	const [userRole, setUserRole] = useState(null);
	const router = useRouter();

	useEffect(() => {
		fetchUserRole();
	}, []);

	const fetchUserRole = async () => {
		const { data: { user } } = await supabase.auth.getUser();
		if (user) {
			const { data, error } = await supabase
				.from('users_data')
				.select('user_type')
				.eq('users_email', user.email)
				.single();

			if (data) {
				setUserRole(data.user_type);
			}
		}
	};

	const handleLogout = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
		  console.error("Error logging out:", error);
		} else {
		  router.push("/signin");
		}
	  };

	const navLinks = userRole === 'admin' 
		? [
			{ href: "/admin-dashboard", label: "Admin Dashboard" },
				{ href: "/menu", label: "Menu" },
				{ href: "/orders", label: "Orders" },
		]
		: userRole === 'worker' 
		? [
			{ href: "/worker-dashboard", label: "Worker Dashboard" },
			,
		]
		: [{ href: "/menu", label: "Menu" },
			{ href: "/orders", label: "Orders" },];

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
						<SheetContent
							side="left"
							className="sm:max-w-xs"
							style={{ transition: "transform 150ms ease-out" }}
						>
							<nav className="grid gap-4 text-lg font-medium">
								{navLinks.map(({ href, label }) => (
									<Link
										key={href}
										href={href}
										className={
											setActiveTab === label.toLowerCase() ? "text-primary" : ""
										}
									>
										{label}
									</Link>
								))}
							</nav>
							<Button
    variant="ghost"
    className="w-full justify-start"
    onClick={handleLogout}
  >
    <LogOutIcon className="mr-2 h-4 w-4" />
    SignOut
  </Button>
						</SheetContent>
					</Sheet>
				</div>
				<div className="hidden sm:flex items-center gap-4">
					{navLinks.map(({ href, label }) => (
						<Link
							key={href}
							href={href}
							className={
								setActiveTab === label.toLowerCase() ? "text-primary" : ""
							}
						>
							{label}
						</Link>
					))}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon">
								<UserIcon className="h-5 w-5" />
								<span className="sr-only">Account</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
								<Link href={"/profile"}>
								Profile</Link>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={handleLogout}>
								<LogOutIcon className="h-4 w-4 mr-2" />
								Sign out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
			
		</header>
	);
}
