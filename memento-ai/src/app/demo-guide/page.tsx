"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

const PROMPT_CATEGORIES = [
	{
		name: "Work & Visibility",
		prompts: [
			"Pull up every entry where I mention feeling anxious about work visibility. Help me find the pattern.",
			"Walk me through how I reacted after the 'could be more visible' performance review.",
		],
	},
	{
		name: "Anxiety & Body",
		prompts: [
			"Find the entry where I had a near panic attack and hid in the bathroom stall. What triggered it?",
			"Show me entries where my body reacts first — tight chest, clenched jaw, shoulders up. What patterns emerge?",
		],
	},
	{
		name: "Self-Worth",
		prompts: [
			"Find entries where I got compliments. Why do they hit me so hard?",
			"What have I been thinking about myself? Help me change my self-talk.",
		],
	},
	{
		name: "Relationships",
		prompts: [
			"Help me talk through the friendship fracture. What am I afraid of?",
			"Find entries where an almost-romance got ambiguous and I started performing. Help me spot the pattern.",
		],
	},
	{
		name: "Well-Being",
		prompts: [
			"What changes in my mood when I eat well, rest, or train consistently?",
			"Find every time I wrote about rest not being earned. Summarize the lessons.",
		],
	},
	{
		name: "Grounding",
		prompts: [
			"Pull 10 tiny joy moments from my journals I can revisit when I'm spiraling.",
		],
	},
];

const ACCOUNT_TAGS = [
	"Daily entries (all of 2025)",
	"Work anxiety",
	"Feedback & compliments",
	"Body stress signals",
	"Friendship & romance",
	"Rest & self-worth",
	"Tiny joys",
];

const JOURNAL_TIMELINE = [
	{
		months: "Jan – Feb",
		title: "Show Up Anyway",
		summary:
			"New Year reset. Performance review triggers insecurity. Practicing visibility at work, receiving compliments, buying herself flowers. High-functioning anxiety meets genuine hope.",
	},
	{
		months: "Mar – Apr",
		title: "Fracture & Strain",
		summary:
			"Friendship breaks. Panic attack at work. Body keeps score — tight chest, clenched jaw. Comparison spirals. Learns rest as prevention, not reward.",
	},
	{
		months: "May – Jun",
		title: "Rebuilding & Romance",
		summary:
			"Cooking wins, imperfection tolerance, almost-romance deepens. Most alive month. Romantic vulnerability triggers anxiety but she responds with dignity.",
	},
	{
		months: "Jul – Aug",
		title: "Boundaries & Stability",
		summary:
			"Family tension, party loneliness, health reset. Less chasing, more self-containment. Strength training. Calm starts to feel possible.",
	},
	{
		months: "Sep – Oct",
		title: "Courage & Rejection",
		summary:
			"Applies for dream role. Gets rejected. Processes grief instead of numbing. Chooses standards over chasing in romance. Remains ambitious without self-erasure.",
	},
	{
		months: "Nov – Dec",
		title: "Integration & Self-Trust",
		summary:
			"Presents without apologizing. Grieves the almost-romance. Rereads old entries, sees growth. Writes a letter to her future self. Ends the year choosing steadiness over self-violence.",
	},
];

export default function DemoPage() {
	const { signIn } = useAuth();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

	const handleOpenDemo = async () => {
		setIsLoading(true);
		try {
			await signIn("sample@mementoai.com", "sample@mementoai.com");
			router.push("/app/journals");
		} catch {
			setIsLoading(false);
		}
	};

	const handleCopyPrompt = (prompt: string, key: string) => {
		navigator.clipboard.writeText(prompt);
		setCopiedIndex(key);
		setTimeout(() => setCopiedIndex(null), 1500);
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="bg-card shadow-sm border-b border-card-border">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex justify-between items-center">
						<button
							onClick={() => router.push("/")}
							className="flex items-center gap-2"
						>
							<Image
								src="/memento_logo.svg"
								alt="Memento"
								width={32}
								height={32}
								className="logo-cyan"
							/>
							<span className="text-lg font-bold text-foreground">
								Memento AI
							</span>
						</button>
						<button
							onClick={() => router.push("/")}
							className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
						>
							&larr; Back
						</button>
					</div>
				</div>
			</header>

			<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				{/* Hero */}
				<div className="text-center mb-10">
					<h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
						Demo Guide
					</h1>
					<p className="text-muted-foreground max-w-xl mx-auto">
						The test account contains a full year of realistic daily
						journal entries. Here&apos;s what&apos;s inside and how to get
						the most out of it.
					</p>
				</div>

				{/* CTA + Tags */}
				<div className="text-center mb-12">
					<button
						onClick={handleOpenDemo}
						disabled={isLoading}
						className="px-8 py-3 text-lg font-medium text-primary-foreground bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-colors disabled:opacity-50 mb-6"
					>
						{isLoading ? "Signing in..." : "Open Test Account"}
					</button>
					<p className="text-sm text-muted-foreground mb-4">
						Browse the entries, then open the Chat to ask questions about them.
					</p>
					<div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
						{ACCOUNT_TAGS.map((tag) => (
							<span
								key={tag}
								className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20"
							>
								{tag}
							</span>
						))}
					</div>
				</div>

				{/* Journal Timeline */}
				<section className="mb-16">
					<div className="text-center mb-8">
						<h2 className="text-2xl font-bold text-foreground mb-2">
							What&apos;s in the account
						</h2>
						<p className="text-sm text-muted-foreground">
							A fictional year of daily entries tracking one person&apos;s growth, organized by arc.
						</p>
					</div>

					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
						{JOURNAL_TIMELINE.map((period) => (
							<div
								key={period.months}
								className="bg-card border border-card-border rounded-2xl p-5"
							>
								<p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
									{period.months}
								</p>
								<h3 className="text-sm font-semibold text-foreground mb-2">
									{period.title}
								</h3>
								<p className="text-xs text-muted-foreground leading-relaxed">
									{period.summary}
								</p>
							</div>
						))}
					</div>
				</section>

				{/* Prompts */}
				<section>
					<div className="text-center mb-8">
						<h2 className="text-2xl font-bold text-foreground mb-2">
							Prompts to try
						</h2>
						<p className="text-sm text-muted-foreground">
							Copy any of these and paste them into the Chat. They&apos;re designed to show off different retrieval and synthesis patterns.
						</p>
					</div>

					<div className="grid sm:grid-cols-2 gap-4">
						{PROMPT_CATEGORIES.map((category) => (
							<div
								key={category.name}
								className="bg-card border border-card-border rounded-2xl p-5"
							>
								<h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
									{category.name}
								</h3>
								<div className="space-y-2">
									{category.prompts.map((prompt, i) => {
										const key = `${category.name}-${i}`;
										const isCopied = copiedIndex === key;
										return (
											<button
												key={key}
												onClick={() =>
													handleCopyPrompt(
														prompt,
														key,
													)
												}
												className="w-full text-left rounded-lg px-3 py-2.5 text-sm text-muted-foreground leading-relaxed hover:bg-primary/5 transition-colors group"
											>
												<div className="flex items-start justify-between gap-2">
													<span>
														&quot;{prompt}&quot;
													</span>
													<span className="shrink-0 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
														{isCopied
															? "Copied!"
															: "Copy"}
													</span>
												</div>
											</button>
										);
									})}
								</div>
							</div>
						))}
					</div>
				</section>
			</main>
		</div>
	);
}
