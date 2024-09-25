"use client";
import { CupSodaIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
/**
 * Component renders a welcome screen for the Box Tea application.
 * It checks if the user is logged in and redirects to the menu page if they are.
 */
export default function Component() {
	const router = useRouter();

	/**
	 * user_email fetches the current user's email from Supabase.
	 * @returns {Promise<Object|null>} The user object if successful, otherwise null.
	 */
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
			console.error("Unexpected error during logout:", error);
			return null;
		}
	};

	useEffect(() => {
		if (user_email()) {
			router.push("/menu");
		}
	}, [router]); // Include 'router' in the dependency array

	return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-secondary">
			<div className="text-center space-y-6 animate-fade-in">
				<div className="flex justify-center">
					<CupSodaIcon className="h-24 w-24 text-primary" />
				</div>
				<h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
					Welcome to Box Tea
				</h1>
				<p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed">
					Your journey to amazing products starts here. Sign in to get started.
				</p>

				<Button className="animate-bounce" size="lg">
					<Link href="/signin">Sign In</Link>
				</Button>
			</div>
		</div>
	);
}
