"use client";

import { Memory } from "@/types";
import { formatDate } from "@/utils/date";
import TagBadge from "@/components/tags/TagBadge";

interface MemoryCardProps {
	memory: Memory;
	onEdit?: (memory: Memory) => void;
	onDelete?: (memory: Memory) => void;
}

export default function MemoryCard({ memory, onEdit, onDelete }: MemoryCardProps) {
	const hasTags = memory.tags && memory.tags.length > 0;

	return (
		<div className="bg-card rounded-xl shadow-sm border border-card-border p-4 hover:shadow-md hover:border-primary/20 transition-all duration-200 group">
			<div className="flex justify-between items-start gap-2">
				<p className="text-card-foreground text-base leading-relaxed mb-3 flex-1 line-clamp-3">
					{memory.memoryData}
				</p>
				<div className="flex items-center gap-1">
					{onEdit && (
						<button
							onClick={() => onEdit(memory)}
							className="p-1.5 text-muted-foreground hover:text-primary rounded-lg transition-colors"
							title="Edit"
						>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
								/>
							</svg>
						</button>
					)}
					{onDelete && (
						<button
							onClick={() => onDelete(memory)}
							className="p-1.5 text-muted-foreground hover:text-error rounded-lg transition-colors"
							title="Delete"
						>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
						</button>
					)}
				</div>
			</div>
			<div className="flex items-center justify-between">
				<div className="flex flex-wrap gap-1">
					{hasTags
						? memory.tags!.map((tag) => (
								<TagBadge key={tag.id} tag={tag} size="sm" />
							))
						: null}
				</div>
				<span className="text-xs text-muted-foreground">
					{formatDate(memory.createdAt)}
				</span>
			</div>
		</div>
	);
}
