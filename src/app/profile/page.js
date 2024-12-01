"use client";
import { useEffect, useState } from "react";
import AuthWrapper from "@/components/AuthWrapper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, User, Users } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { Header } from "@/components/header";

export default function Component() {
	const [userData, setUserData] = useState(null);

	useEffect(() => {
		async function fetchUserData() {
			const { data: { user } } = await supabase.auth.getUser();
			if (user) {
				const { data, error } = await supabase
					.from('users_data')
					.select('*')
					.eq('users_email', user.email)
					.single();

				if (error) {
					console.error('Error fetching user data:', error);
				} else {
					setUserData(data);
				}
			}
		}

		fetchUserData();
	}, []);

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
						{userData ? (
							<>
								<div className="flex items-center space-x-4">
									<Users className="w-6 h-6 text-gray-500" />
									<div>
										<p className="text-sm font-medium text-gray-500">Department</p>
										<p className="text-lg font-semibold">{userData.department_name || 'N/A'}</p>
									</div>
								</div>
								<div className="flex items-center space-x-4">
									<User className="w-6 h-6 text-gray-500" />
									<div>
										<p className="text-sm font-medium text-gray-500">HOD</p>
										<p className="text-lg font-semibold">{userData.hod || 'N/A'}</p>
									</div>
								</div>
								<div className="flex items-center space-x-4">
									<User className="w-6 h-6 text-gray-500" />
									<div>
										<p className="text-sm font-medium text-gray-500">
											Computer Operator
										</p>
										<p className="text-lg font-semibold">{userData.computer_operator || 'N/A'}</p>
									</div>
								</div>
								<div className="flex items-center space-x-4">
									<Phone className="w-6 h-6 text-gray-500" />
									<div>
										<p className="text-sm font-medium text-gray-500">Phone No</p>
										<p className="text-lg font-semibold">{userData.phone_number || 'N/A'}</p>
									</div>
								</div>
							</>
						) : (
							<p>Loading user data...</p>
						)}
					</CardContent>
				</Card>
			</div>
		</AuthWrapper>
	);
}
