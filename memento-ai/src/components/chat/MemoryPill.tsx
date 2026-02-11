"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MemoryReference } from "@/types";
import { formatDate } from "@/utils/date";

interface MemoryPillProps {
	memory: MemoryReference;
}

export default function MemoryPill({ memory }: MemoryPillProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Truncate memory content for pill display
	const truncatedContent =
		memory.memoryData.length > 40
			? memory.memoryData.slice(0, 40) + "..."
			: memory.memoryData;

	return (
		<>
			<button
				onClick={() => setIsOpen(true)}
				className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md
                   bg-cyan-900/50 text-cyan-200 hover:bg-cyan-800/50
                   transition-colors cursor-pointer"
			>
				<svg
					className="w-3 h-3"
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
				<span className="truncate max-w-[150px]">{truncatedContent}</span>
			</button>

			{mounted &&
				isOpen &&
				createPortal(
					<div className="fixed inset-0 z-50 overflow-y-auto">
						{/* Backdrop */}
						<div
							className="fixed inset-0 bg-black/80 backdrop-blur-sm"
							onClick={() => setIsOpen(false)}
						/>

						{/* Modal */}
						<div className="flex min-h-full items-center justify-center p-4">
							<div className="relative w-full max-w-sm transform rounded-2xl bg-card shadow-xl border border-card-border">
								{/* Content */}
								<div className="px-6 py-5">
									<h3 className="text-lg font-semibold text-card-foreground mb-2">
										Memory
									</h3>
									<p className="text-sm text-foreground whitespace-pre-wrap">
										{memory.memoryData}
									</p>
									<p className="text-xs text-muted-foreground mt-3">
										{formatDate(memory.createdAt)}
									</p>
								</div>

								{/* Footer */}
								<div className="border-t border-border px-6 py-4 flex justify-end">
									<button
										type="button"
										onClick={() => setIsOpen(false)}
										className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted hover:bg-secondary/10 rounded-xl"
									>
										Close
									</button>
								</div>
							</div>
						</div>
					</div>,
					document.body,
				)}
		</>
	);
}