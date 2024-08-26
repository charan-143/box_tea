"use client";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function SignIn() {
	const [signIn, setSignIn] = useState(false);

	return (
		<div className="h-screen w-screen flex items-center justify-center">
			<Card open={signIn} onOpenChange={setSignIn}>
				<CardContent>
					<CardHeader>
						<CardTitle>Sign In</CardTitle>
						<CardDescription>
							Enter your email and password to access your account.
						</CardDescription>
					</CardHeader>

					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input id="email" type="email" placeholder="name@example.com" />
					</div>
					<div className="space-y-2 mt-5">
						<Label htmlFor="password">Password</Label>
						<Input id="password" type="password" />
					</div>
					<Button className="w-full mt-10">Sign In</Button>
				</CardContent>
			</Card>
		</div>
	);
}
