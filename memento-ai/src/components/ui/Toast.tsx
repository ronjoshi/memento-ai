"use client";

import { useEffect } from "react";

interface ToastProps {
	message: string;
	isVisible: boolean;
	onClose: () => void;
}

export default function Toast({ message, isVisible, onClose }: ToastProps) {
	useEffect(() => {
		if (isVisible) {
			const timer = setTimeout(onClose, 3000);
			return () => clearTimeout(timer);
		}
	}, [isVisible, onClose]);

	if (!isVisible) return null;

	return (
		<div className="fixed top-6 left-1/2 z-[100] animate-fade-in" style={{ transform: "translateX(-50%)" }}>
			<div className="px-5 py-3 bg-card border border-card-border rounded-xl shadow-lg text-sm text-foreground">
				{message}
			</div>
		</div>
	);
}
