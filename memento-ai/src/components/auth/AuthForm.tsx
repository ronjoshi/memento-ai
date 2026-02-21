"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSignUp, setIsSignUp] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	const { signUp, signIn, isLoading } = useAuth();

	const handleAuth = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!email || !password) {
			setError("Please enter both email and password");
			return;
		}

		console.log(
			"AuthForm: Attempting",
			isSignUp ? "sign up" : "sign in",
			"for:",
			email,
		);

		try {
			if (isSignUp) {
				await signUp(email, password);
				console.log("AuthForm: Sign up completed successfully");
			} else {
				await signIn(email, password);
				console.log("AuthForm: Sign in completed successfully");
			}
			// Redirect to journals page after successful auth
			router.push("/app/journals");
		} catch (err) {
			console.error("AuthForm: Auth error:", err);
			setError(err instanceof Error ? err.message : "An error occurred");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background px-4">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<Image
						src="/memento_logo.svg"
						alt="Memento AI"
						width={64}
						height={64}
						className="logo-cyan mx-auto mb-4"
					/>
					<h1 className="text-4xl font-bold text-foreground mb-2">
						Memento AI
					</h1>
					<p className="text-muted-foreground mb-4">
						Your personal journal
					</p>
					<h2 className="text-2xl font-semibold text-foreground">
						{isSignUp ? "Create Account" : "Welcome Back"}
					</h2>
				</div>

				<form onSubmit={handleAuth} className="mt-8 space-y-6">
					<div className="space-y-4">
						<div>
							<label htmlFor="email" className="sr-only">
								Email
							</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="appearance-none relative block w-full px-4 py-3 border border-border placeholder-muted-foreground text-foreground rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
								placeholder="Email"
							/>
						</div>

						<div>
							<label htmlFor="password" className="sr-only">
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete={
									isSignUp
										? "new-password"
										: "current-password"
								}
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="appearance-none relative block w-full px-4 py-3 border border-border placeholder-muted-foreground text-foreground rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
								placeholder="Password"
							/>
						</div>
					</div>

					{error && (
						<div className="rounded-xl bg-error-light p-4 border border-error/20">
							<p className="text-sm text-error">{error}</p>
						</div>
					)}

					{isLoading ? (
						<div className="flex justify-center py-4">
							<div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
						</div>
					) : (
						<>
							<button
								type="submit"
								className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-primary-foreground bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring shadow-sm hover:shadow-md"
							>
								{isSignUp ? "Create Account" : "Sign In"}
							</button>

							<button
								type="button"
								onClick={() => {
									setIsSignUp(!isSignUp);
									setError("");
								}}
								className="w-full text-center text-sm text-primary hover:text-primary-hover"
							>
								{isSignUp
									? "Already have an account? Sign In"
									: "Don't have an account? Sign Up"}
							</button>
						</>
					)}
				</form>
			</div>
		</div>
	);
}
