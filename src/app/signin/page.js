"use client";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SignIn() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState(null);
	const router = useRouter();

	const handleSignIn = async (e) => {
		e.preventDefault();
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});
			if (error) throw error;
			const { data: { user } } = await supabase.auth.getUser();
			if (user) {
				const { data, error } = await supabase
					.from('users_data')
					.select('user_type')
					.eq('users_email', user.email)
					.single();
				if (data.user_type === 'worker') {
					router.push("/worker-dashboard");
				} else {
					router.push("/menu");
				}
			}
		} catch (error) {
			setError(error.message);
		}
	};

	return (
		<div className="h-screen w-screen flex items-center justify-center">
			<Card className="w-[350px]">
				<form onSubmit={handleSignIn}>
					<CardHeader>
						<CardTitle>Sign In</CardTitle>
						<CardDescription>
							Enter your email and password to access your account.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="name@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2 mt-4">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						{error && <p className="text-red-500 mt-2">{error}</p>}
					</CardContent>
					<CardFooter className="flex flex-col">
						<Button className="w-full" type="submit">
							Sign In
						</Button>
						<p className="mt-2 text-sm text-center">
							Don&apos;t have an account?&#x20;
							<Link href="/signup" className="text-blue-500 hover:underline">
								Sign up
							</Link>
						</p>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
