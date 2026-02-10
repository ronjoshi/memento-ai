"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AboutPage() {
	const { isSignedIn } = useAuth();
	const router = useRouter();

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="bg-card shadow-sm border-b border-card-border">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex justify-between items-center">
						<h1 className="text-xl font-bold text-foreground">
							Memento AI
						</h1>
						<div className="flex items-center space-x-4">
							{isSignedIn ? (
								<button
									onClick={() => router.push("/app/memories")}
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
						Your Personal Memory Vault
					</h2>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
						Memento AI helps you store, organize, and recall your memories with the power of AI.
						Never forget important moments, ideas, or information again.
					</p>
					<button
						onClick={() => router.push(isSignedIn ? "/app/memories" : "/login")}
						className="px-8 py-3 text-lg font-medium text-primary-foreground bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-colors"
					>
						{isSignedIn ? "Open App" : "Get Started"}
					</button>
				</div>

				{/* Features Section */}
				<div className="mt-24 grid md:grid-cols-3 gap-8">
					<div className="text-center p-6">
						<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
							<svg
								className="w-6 h-6 text-primary"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-foreground mb-2">
							Store Memories
						</h3>
						<p className="text-muted-foreground">
							Capture and store your thoughts, ideas, and experiences in a secure, personal vault.
						</p>
					</div>

					<div className="text-center p-6">
						<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
							<svg
								className="w-6 h-6 text-primary"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-foreground mb-2">
							Smart Search
						</h3>
						<p className="text-muted-foreground">
							Find what you&apos;re looking for instantly with AI-powered semantic search.
						</p>
					</div>

					<div className="text-center p-6">
						<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
							<svg
								className="w-6 h-6 text-primary"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
								/>
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-foreground mb-2">
							AI Chat
						</h3>
						<p className="text-muted-foreground">
							Chat with an AI that knows your memories and can help you recall information.
						</p>
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="border-t border-border mt-24">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<p className="text-center text-muted-foreground text-sm">
						Memento AI - Your personal memory vault
					</p>
				</div>
			</footer>
		</div>
	);
}
