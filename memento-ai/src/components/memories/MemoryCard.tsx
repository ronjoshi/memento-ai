"use client";

import { Memory } from "@/types";
import { formatDate } from "@/utils/date";
import TagBadge from "@/components/tags/TagBadge";

interface MemoryCardProps {
	memory: Memory;
}

export default function MemoryCard({ memory }: MemoryCardProps) {
	const hasTags = memory.tags && memory.tags.length > 0;

	return (
		<div className="bg-card rounded-xl shadow-sm border border-card-border p-4 hover:shadow-md hover:border-primary/20 transition-all duration-200">
			<p className="text-card-foreground text-base leading-relaxed mb-3">
				{memory.memoryData}
			</p>
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
