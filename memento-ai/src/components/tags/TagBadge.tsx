"use client";

import { Tag, TAG_COLOR_CONFIG } from "@/types";

interface TagBadgeProps {
	tag: Tag;
	size?: "sm" | "md";
	onRemove?: () => void;
}

export default function TagBadge({
	tag,
	size = "sm",
	onRemove,
}: TagBadgeProps) {
	const colors = TAG_COLOR_CONFIG[tag.color] || TAG_COLOR_CONFIG.gray;

	const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

	return (
		<span
			className={`inline-flex items-center gap-1 rounded-md font-medium ${sizeClasses}`}
			style={{
				backgroundColor: `var(--tag-bg-${tag.color}, ${colors.bg})`,
				color: `var(--tag-text-${tag.color}, ${colors.text})`,
			}}
		>
			{tag.name}
			{onRemove && (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onRemove();
					}}
					className="ml-0.5 hover:opacity-70 focus:outline-none"
					aria-label={`Remove ${tag.name} tag`}
				>
					<svg
						className="h-3 w-3"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			)}
		</span>
	);
}
