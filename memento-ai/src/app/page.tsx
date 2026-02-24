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
	const isSampleUser = user?.email === "sample@mementoai.com";
	const isRealUser = isSignedIn && !isSampleUser;

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
							{isRealUser ? (
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

			<main>
				{/* Hero Section */}
				<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
					<div className="text-center max-w-3xl mx-auto">
						<p className="text-primary font-medium tracking-wide uppercase text-sm mb-4">
							AI-Powered Personal Journal
						</p>
						<h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
							Your journal remembers.
							<br />
							<span className="text-primary">
								So you don&apos;t have to.
							</span>
						</h2>
						<p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
							Memento is a journal with an AI companion that
							actually reads your entries, finds patterns you
							miss, and helps you understand yourself over time.
						</p>
						<div className="flex flex-col sm:flex-row items-center justify-center gap-3">
							<button
								onClick={() =>
									isRealUser
										? handleOpenApp()
										: router.push("/login")
								}
								className="px-8 py-3 text-lg font-medium text-primary-foreground bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-colors"
							>
								{isRealUser ? "Open App" : "Get Started"}
							</button>
							<button
								onClick={handleTestLogin}
								disabled={isSampleLoading}
								className="px-6 py-3 text-lg font-medium text-primary border border-primary hover:bg-primary/10 rounded-xl transition-colors disabled:opacity-50"
							>
								{isSampleLoading
									? "Signing in..."
									: "Try the Demo"}
							</button>
						</div>
					</div>
				</section>

				{/* Video Previews */}
				<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
					<div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-12">
						<PhoneMockup
							videoSrc="/newmemory_vid.mov"
							caption="Write journal entries"
						/>
						<PhoneMockup
							videoSrc="/searching_in_chat_vid.mov"
							caption="Search your memories"
						/>
						<PhoneMockup
							videoSrc="/asking_about_mood_shifts_vid.mov"
							caption="Talk about your experiences"
						/>
					</div>
				</section>

				{/* What Makes It Different */}
				<section className="border-t border-card-border">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
						<div className="text-center mb-16">
							<h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
								Not just a journal. A companion that listens.
							</h3>
							<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
								Most journals collect dust. Memento reads
								between the lines, connects the dots across
								weeks and months, and reflects back what you
								might not see on your own.
							</p>
						</div>

						<div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
							{/* Feature Card 1 */}
							<div className="bg-card border border-card-border rounded-2xl p-6">
								<div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
									<svg
										className="w-5 h-5 text-primary"
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
								<h4 className="text-lg font-semibold text-foreground mb-2">
									Hybrid Memory Search
								</h4>
								<p className="text-muted-foreground text-sm leading-relaxed">
									Combines semantic understanding with keyword
									matching. Search by meaning, not just exact
									words — find that entry about &quot;feeling
									invisible at work&quot; even if you never
									wrote those exact words.
								</p>
							</div>

							{/* Feature Card 2 */}
							<div className="bg-card border border-card-border rounded-2xl p-6">
								<div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
									<svg
										className="w-5 h-5 text-primary"
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
								<h4 className="text-lg font-semibold text-foreground mb-2">
									An AI That Knows Your Story
								</h4>
								<p className="text-muted-foreground text-sm leading-relaxed">
									Ask it anything about your life. It pulls
									from your actual entries, finds recurring
									themes, and reflects back patterns — like a
									therapist with perfect memory of everything
									you&apos;ve ever written.
								</p>
							</div>

							{/* Feature Card 3 */}
							<div className="bg-card border border-card-border rounded-2xl p-6">
								<div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
									<svg
										className="w-5 h-5 text-primary"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M13 10V3L4 14h7v7l9-11h-7z"
										/>
									</svg>
								</div>
								<h4 className="text-lg font-semibold text-foreground mb-2">
									Pattern Detection Across Time
								</h4>
								<p className="text-muted-foreground text-sm leading-relaxed">
									&quot;Why do I always shut down after
									feedback?&quot; &quot;When did I start
									feeling this way?&quot; Memento connects
									entries across weeks and months to surface
									patterns you&apos;d never catch rereading
									alone.
								</p>
							</div>

							{/* Feature Card 4 */}
							<div className="bg-card border border-card-border rounded-2xl p-6">
								<div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
									<svg
										className="w-5 h-5 text-primary"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
										/>
									</svg>
								</div>
								<h4 className="text-lg font-semibold text-foreground mb-2">
									Color-Coded Tags
								</h4>
								<p className="text-muted-foreground text-sm leading-relaxed">
									Organize entries with custom tags in 36
									colors. Filter by topic, person, mood, or
									anything else. The AI uses your tags to find
									relevant entries faster.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Ask It Anything */}
				<section className="border-t border-card-border">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
						<div className="text-center mb-12">
							<h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
								Ask your journal anything.
							</h3>
							<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
								Real prompts. Real insights. Here&apos;s what
								people ask Memento.
							</p>
						</div>

						<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto">
							{[
								"When did I start feeling anxious about being visible at work?",
								"Find every time I wrote about rest not being earned.",
								"Why do compliments make me want to shrink?",
								"What changes in my mood when I eat well and rest?",
								"Pull 10 tiny joy moments I can revisit when I'm spiraling.",
								"Help me find the pattern in my self-talk about worth.",
							].map((prompt) => (
								<div
									key={prompt}
									className="bg-card border border-card-border rounded-xl px-4 py-3 text-sm text-muted-foreground leading-relaxed"
								>
									&quot;{prompt}&quot;
								</div>
							))}
						</div>
					</div>
				</section>

				{/* How It Works */}
				<section className="border-t border-card-border">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
						<div className="text-center mb-16">
							<h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
								How it works
							</h3>
						</div>

						<div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
							<div className="text-center">
								<div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
									<span className="text-primary font-bold">
										1
									</span>
								</div>
								<h4 className="text-lg font-semibold text-foreground mb-2">
									Write
								</h4>
								<p className="text-muted-foreground text-sm">
									Journal like you normally would. Tag entries
									by topic, mood, or whatever feels right.
								</p>
							</div>

							<div className="text-center">
								<div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
									<span className="text-primary font-bold">
										2
									</span>
								</div>
								<h4 className="text-lg font-semibold text-foreground mb-2">
									Ask
								</h4>
								<p className="text-muted-foreground text-sm">
									Chat with the AI about your life. It
									searches across all your entries to find
									what matters.
								</p>
							</div>

							<div className="text-center">
								<div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
									<span className="text-primary font-bold">
										3
									</span>
								</div>
								<h4 className="text-lg font-semibold text-foreground mb-2">
									Understand
								</h4>
								<p className="text-muted-foreground text-sm">
									See patterns, process feelings, and track
									growth you wouldn&apos;t notice on your own.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Final CTA */}
				<section className="border-t border-card-border">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
						<div className="text-center">
							<h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
								Your past self has a lot to say.
							</h3>
							<p className="text-lg text-muted-foreground mb-8">
								Start journaling. Start asking. Start
								understanding.
							</p>
							<div className="flex flex-col sm:flex-row items-center justify-center gap-3">
								<button
									onClick={() =>
										isSignedIn
											? handleOpenApp()
											: router.push("/login")
									}
									className="px-8 py-3 text-lg font-medium text-primary-foreground bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-colors"
								>
									{isSignedIn ? "Open App" : "Get Started"}
								</button>
								<button
									onClick={handleTestLogin}
									disabled={isSampleLoading}
									className="px-6 py-3 text-lg font-medium text-primary border border-primary hover:bg-primary/10 rounded-xl transition-colors disabled:opacity-50"
								>
									{isSampleLoading
										? "Signing in..."
										: "Try the Demo"}
								</button>
							</div>
						</div>
					</div>
				</section>
			</main>

			{/* Footer */}
			<footer className="border-t border-border">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
					<div className="bg-card border border-card-border rounded-xl px-4 py-3 max-w-2xl mx-auto">
						<p className="text-xs text-muted-foreground text-center leading-relaxed">
							<span className="font-medium text-foreground">Heads up:</span>{" "}
							This is a personal demo project, not a production app. There&apos;s no
							privacy policy — the only guarantee your data stays private is a pinky
							promise. You&apos;re welcome to use it, just know what you&apos;re signing up for.
						</p>
					</div>
					<p className="text-center text-muted-foreground text-sm">
						Memento AI
					</p>
				</div>
			</footer>
		</div>
	);
}
