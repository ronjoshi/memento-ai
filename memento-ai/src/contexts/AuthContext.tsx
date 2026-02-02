"use client";

import {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	isSignedIn: boolean;
	signUp: (email: string, password: string) => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSignedIn, setIsSignedIn] = useState(false);
	const supabase = createClient();

	useEffect(() => {
		// Check active session on mount
		const initAuth = async () => {
			try {
				const {
					data: { user },
				} = await supabase.auth.getUser();
				setUser(user);
				setIsSignedIn(!!user);
			} catch {
				setUser(null);
				setIsSignedIn(false);
			} finally {
				setIsLoading(false);
			}
		};

		initAuth();

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
			setIsSignedIn(!!session?.user);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [supabase]);

	const signUp = async (email: string, password: string) => {
		setIsLoading(true);
		try {
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
			});

			if (error) throw error;

			setUser(data.user);
			setIsSignedIn(!!data.user);
		} finally {
			setIsLoading(false);
		}
	};

	const signIn = async (email: string, password: string) => {
		setIsLoading(true);
		console.log("AuthContext: Attempting sign in for:", email);
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				console.error(
					"AuthContext: Sign in error:",
					error.message,
					error,
				);
				throw error;
			}

			console.log(
				"AuthContext: Sign in successful, user:",
				data.user?.id,
			);
			setUser(data.user);
			setIsSignedIn(!!data.user);
		} catch (err) {
			console.error("AuthContext: Sign in caught error:", err);
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	const signOut = async () => {
		setIsLoading(true);
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;

			setUser(null);
			setIsSignedIn(false);
		} finally {
			setIsLoading(false);
		}
	};

	const resetPassword = async (email: string) => {
		const { error } = await supabase.auth.resetPasswordForEmail(email);
		if (error) throw error;
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				isLoading,
				isSignedIn,
				signUp,
				signIn,
				signOut,
				resetPassword,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
