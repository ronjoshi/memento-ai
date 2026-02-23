"use client";

// Protected layout - redirects to login if not authenticated
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { TagProvider } from "@/contexts/TagContext";

export default function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { isSignedIn, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !isSignedIn) {
			router.push("/login");
		}
	}, [isSignedIn, isLoading, router]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	if (!isSignedIn) {
		return null;
	}

	return (
		<ChatProvider>
			<TagProvider>{children}</TagProvider>
		</ChatProvider>
	);
}
