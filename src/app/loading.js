import React from 'react';
import { CupSodaIcon } from "lucide-react";

export default function Loading() {
	return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-secondary">
			<div className="text-center space-y-4">
				<div className="relative">
					<div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
					<CupSodaIcon className="h-8 w-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
				</div>
				<h2 className="text-2xl font-semibold">Loading</h2>
			</div>
		</div>
	);
}