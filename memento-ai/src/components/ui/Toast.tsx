"use client";

import { useEffect } from "react";

interface ToastProps {
	message: React.ReactNode;
	isVisible: boolean;
	onClose: () => void;
}

export default function Toast({ message, isVisible, onClose }: ToastProps) {
	useEffect(() => {
		if (isVisible) {
			const timer = setTimeout(onClose, 5000);
			return () => clearTimeout(timer);
		}
	}, [isVisible, onClose]);

	if (!isVisible) return null;

	return (
		<div className="fixed top-6 left-1/2 z-[100] animate-fade-in w-[90vw] max-w-lg" style={{ transform: "translateX(-50%)" }}>
			<div className="px-6 py-5 bg-card border border-card-border rounded-xl shadow-lg text-base text-foreground text-center leading-relaxed">
				{message}
			</div>
		</div>
	);
}
