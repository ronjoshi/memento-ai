import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const avenirNext = localFont({
	src: "./fonts/AvenirNext-Regular.ttf",
	variable: "--font-avenir",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Memento AI",
	description: "Personal journal with AI-powered search and recall",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${avenirNext.className} antialiased`}
			>
				<AuthProvider>{children}</AuthProvider>
			</body>
		</html>
	);
}
