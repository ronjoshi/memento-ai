"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AppPage() {
	const router = useRouter();

	useEffect(() => {
		router.replace("/app/journals");
	}, [router]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
			<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
		</div>
	);
}
