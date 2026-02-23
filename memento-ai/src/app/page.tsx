"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import PhoneMockup from "@/components/ui/PhoneMockup";

export default function AboutPage() {
	const { isSignedIn, signIn, signOut, user } = useAuth();
	const router = useRouter();
	const [isSampleLoading, setIsSampleLoading] = useState(false);

	const handleOpenApp = async () => {
		if (user?.email === "sample@mementoai.com") {
			await signOut();
			router.push("/login");
		} else {
			router.push("/app/journals");
		}
	};

	const handleTestLogin = async () => {
		setIsSampleLoading(true);
		try {
			await signIn("sample@mementoai.com", "sample@mementoai.com");
			router.push("/app/journals");
		} catch {
			setIsSampleLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="bg-card shadow-sm border-b border-card-border">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex justify-between items-center">
						<button
							onClick={() => router.push("/")}
							className="flex items-center gap-2"
						>
							<Image
								src="/memento_logo.svg"
								alt="Memento"
								width={40}
								height={40}
								className="logo-cyan"
							/>
							<h1 className="text-xl font-bold text-foreground">
								Memento AI
							</h1>
						</button>
						<div className="flex items-center space-x-4">
							{isSignedIn ? (
								<button
									onClick={handleOpenApp}
									className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-colors"
								>
									Go to App
								</button>
							) : (
								<>
									<button
										onClick={() => router.push("/login")}
										className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
									>
										Sign In
									</button>
									<button
										onClick={() => router.push("/login")}
										className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-colors"
									>
										Get Started
									</button>
								</>
							)}
						</div>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
				<div className="text-center">
					<h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
						Your Personal Journal
					</h2>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
						Memento AI helps you store, organize, and recall your journal entries with the power of AI.
						Never forget important moments, ideas, or information again.
					</p>
					<div className="flex flex-col items-center gap-3">
						<button
							onClick={() => isSignedIn ? handleOpenApp() : router.push("/login")}
							className="px-8 py-3 text-lg font-medium text-primary-foreground bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-colors"
						>
							{isSignedIn ? "Open App" : "Get Started"}
						</button>
						<button
							onClick={handleTestLogin}
							disabled={isSampleLoading}
							className="px-6 py-2 text-sm font-medium text-primary border border-primary hover:bg-primary/10 rounded-xl transition-colors disabled:opacity-50"
						>
							{isSampleLoading ? "Signing in..." : "Try as Sample User"}
						</button>
					</div>
				</div>

				{/* Video Previews */}
				<div className="mt-24 flex flex-col md:flex-row items-center justify-center gap-10 md:gap-12">
					<PhoneMockup
						videoSrc="/newmemory_vid.mov"
						caption="Create journal entries"
					/>
					<PhoneMockup
						videoSrc="/searching_in_chat_vid.mov"
						caption="Search through your memories"
					/>
					<PhoneMockup
						videoSrc="/asking_about_mood_shifts_vid.mov"
						caption="Chat with your journal"
					/>
				</div>
			</main>

			{/* Footer */}
			<footer className="border-t border-border mt-24">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<p className="text-center text-muted-foreground text-sm">
						Memento AI - Your personal journal
					</p>
				</div>
			</footer>
		</div>
	);
}
