"use client";

import { useState, useRef, useEffect } from "react";
import { useTags } from "@/contexts/TagContext";
import TagBadge from "@/components/tags/TagBadge";
import { TAG_COLOR_CONFIG } from "@/types";

export default function TagFilter() {
	const { availableTags, selectedTagIds, toggleTag, clearFilter } =
		useTags();
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const dropdownRef = useRef<HTMLDivElement>(null);

	const selectedTags = availableTags.filter((tag) =>
		selectedTagIds.includes(tag.id)
	);

	const filteredTags = availableTags.filter((tag) =>
		tag.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Close dropdown on outside click
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className="mb-6">
			<div className="flex items-center gap-3">
				{/* Filter label and display */}
				<div className="flex items-center gap-2 flex-1">
					<span className="text-sm text-muted-foreground font-medium">
						Filter:
					</span>
					{selectedTags.length === 0 ? (
						<span className="text-sm text-foreground">
							All journals
						</span>
					) : (
						<div className="flex flex-wrap gap-2">
							{selectedTags.map((tag) => (
								<TagBadge
									key={tag.id}
									tag={tag}
									size="sm"
									onRemove={() => toggleTag(tag.id)}
								/>
							))}
						</div>
					)}
				</div>

				{/* Filter button */}
				<div className="relative" ref={dropdownRef}>
					<button
						onClick={() => setIsOpen(!isOpen)}
						className="p-2 text-muted-foreground hover:text-foreground border border-border rounded-lg hover:border-ring transition-colors"
						title="Filter by tags"
					>
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
							/>
						</svg>
					</button>

					{/* Clear filter button */}
					{selectedTags.length > 0 && (
						<button
							onClick={clearFilter}
							className="ml-2 p-2 text-muted-foreground hover:text-foreground border border-border rounded-lg hover:border-ring transition-colors"
							title="Clear filters"
						>
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
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

					{/* Dropdown */}
					{isOpen && (
						<div className="absolute right-0 z-50 mt-2 w-80 bg-card border border-card-border rounded-xl shadow-lg overflow-hidden">
							{/* Search */}
							<div className="p-3 border-b border-border">
								<input
									type="text"
									value={searchQuery}
									onChange={(e) =>
										setSearchQuery(e.target.value)
									}
									placeholder="Search tags..."
									className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
									autoFocus
								/>
							</div>

							{/* Tag list */}
							<div className="max-h-64 overflow-y-auto p-2">
								{filteredTags.length > 0 ? (
									filteredTags.map((tag) => {
										const isSelected =
											selectedTagIds.includes(tag.id);
										const colors =
											TAG_COLOR_CONFIG[tag.color];

										return (
											<button
												key={tag.id}
												type="button"
												onClick={() =>
													toggleTag(tag.id)
												}
												className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
													isSelected
														? "bg-accent"
														: "hover:bg-secondary/10"
												}`}
											>
												<span
													className="w-3 h-3 rounded-full"
													style={{
														backgroundColor:
															colors.bg,
													}}
												/>
												<span className="flex-1 text-sm text-card-foreground">
													{tag.name}
												</span>
												{isSelected && (
													<svg
														className="w-4 h-4 text-primary"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M5 13l4 4L19 7"
														/>
													</svg>
												)}
											</button>
										);
									})
								) : (
									<p className="px-3 py-2 text-sm text-muted-foreground">
										No tags found
									</p>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
