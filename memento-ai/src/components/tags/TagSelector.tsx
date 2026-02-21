"use client";

import { useState, useRef, useEffect } from "react";
import { Tag, TagColor, TAG_COLOR_CONFIG } from "@/types";
import TagBadge from "./TagBadge";
import ColorPicker from "./ColorPicker";

interface TagSelectorProps {
	availableTags: Tag[];
	selectedTagIds: number[];
	onTagsChange: (tagIds: number[]) => void;
	onCreateTag: (name: string, color: TagColor) => Promise<Tag>;
	onDeleteTag?: (tagId: number) => Promise<void>;
	disabled?: boolean;
}

export default function TagSelector({
	availableTags,
	selectedTagIds,
	onTagsChange,
	onCreateTag,
	onDeleteTag,
	disabled = false,
}: TagSelectorProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [newTagName, setNewTagName] = useState("");
	const [newTagColor, setNewTagColor] = useState<TagColor>("blue");
	const [isCreateLoading, setIsCreateLoading] = useState(false);
	const [deletingTagId, setDeletingTagId] = useState<number | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const dropdownRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const dropdownContentRef = useRef<HTMLDivElement>(null);

	const MAX_TAGS = 50;

	const selectedTags = availableTags.filter((tag) =>
		selectedTagIds.includes(tag.id),
	);

	const filteredTags = availableTags.filter((tag) =>
		tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const hasReachedLimit = availableTags.length >= MAX_TAGS;

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
				setIsCreating(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const toggleTag = (tagId: number) => {
		if (selectedTagIds.includes(tagId)) {
			onTagsChange(selectedTagIds.filter((id) => id !== tagId));
		} else {
			onTagsChange([...selectedTagIds, tagId]);
		}
	};

	const handleCreateTag = async () => {
		if (!newTagName.trim() || isCreateLoading) return;

		setIsCreateLoading(true);
		try {
			const newTag = await onCreateTag(newTagName.trim(), newTagColor);
			onTagsChange([...selectedTagIds, newTag.id]);
			setNewTagName("");
			setNewTagColor("blue");
			setIsCreating(false);
		} catch (error) {
			console.error("Failed to create tag:", error);
		} finally {
			setIsCreateLoading(false);
		}
	};

	const handleDeleteTag = async (e: React.MouseEvent, tagId: number) => {
		e.stopPropagation();
		if (!onDeleteTag || deletingTagId !== null) return;

		setDeletingTagId(tagId);
		try {
			await onDeleteTag(tagId);
			// Remove from selected if it was selected
			if (selectedTagIds.includes(tagId)) {
				onTagsChange(selectedTagIds.filter((id) => id !== tagId));
			}
		} catch (error) {
			console.error("Failed to delete tag:", error);
		} finally {
			setDeletingTagId(null);
		}
	};

	return (
		<div className="relative" ref={dropdownRef}>
			{/* Selected tags display */}
			<div
				className={`min-h-[48px] px-4 py-2 border border-border rounded-xl bg-background flex flex-wrap items-center gap-2 cursor-pointer ${
					disabled ? "opacity-50 cursor-not-allowed" : "hover:border-ring"
				}`}
				onClick={() => !disabled && setIsOpen(!isOpen)}
			>
				{selectedTags.length > 0 ? (
					selectedTags.map((tag) => (
						<TagBadge
							key={tag.id}
							tag={tag}
							size="md"
							onRemove={() => toggleTag(tag.id)}
						/>
					))
				) : (
					<span className="text-muted-foreground text-sm">
						Click to add tags...
					</span>
				)}
			</div>

			{/* Dropdown */}
			{isOpen && !disabled && (
				<div ref={dropdownContentRef} className="absolute z-50 mt-2 w-full bg-card border border-card-border rounded-xl shadow-lg overflow-hidden max-h-96 overflow-y-auto">
					{/* Search input */}
					<div className="p-2 border-b border-border">
						<input
							ref={inputRef}
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search tags..."
							className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
							autoFocus
						/>
					</div>

					{/* Tags list */}
					<div className={`max-h-48 overflow-y-auto p-2 ${isCreateLoading ? "opacity-50 pointer-events-none" : ""}`}>
						{filteredTags.length > 0 ? (
							filteredTags.map((tag) => {
								const isSelected = selectedTagIds.includes(tag.id);
								const isBeingDeleted = deletingTagId === tag.id;
								const colors = TAG_COLOR_CONFIG[tag.color];

								return (
									<button
										key={tag.id}
										type="button"
										onClick={() => toggleTag(tag.id)}
										disabled={isBeingDeleted}
										className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
											isBeingDeleted
												? "opacity-50 pointer-events-none"
												: isSelected
													? "bg-accent"
													: "hover:bg-secondary/10"
										}`}
									>
										<span
											className="w-3 h-3 rounded-full"
											style={{ backgroundColor: colors.bg }}
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
										{onDeleteTag && (
											<button
												type="button"
												onClick={(e) => handleDeleteTag(e, tag.id)}
												disabled={isBeingDeleted}
												className="p-1 text-muted-foreground hover:text-error rounded transition-colors"
												title="Delete tag"
											>
												{isBeingDeleted ? (
													<div className="w-3.5 h-3.5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
												) : (
													<svg
														className="w-3.5 h-3.5"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
														/>
													</svg>
												)}
											</button>
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

					{/* Create new tag section */}
					<div className="border-t border-border p-2">
						{isCreating ? (
							<div className="space-y-3">
								<input
									type="text"
									value={newTagName}
									onChange={(e) => setNewTagName(e.target.value)}
									placeholder="Tag name"
									className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											handleCreateTag();
										}
									}}
									autoFocus
								/>
								<ColorPicker
									selectedColor={newTagColor}
									onSelect={setNewTagColor}
								/>
								<div className="flex gap-2">
									<button
										type="button"
										onClick={() => {
											setIsCreating(false);
											setNewTagName("");
										}}
										className="flex-1 px-3 py-2 text-sm text-muted-foreground bg-muted hover:bg-secondary/10 rounded-lg"
									>
										Cancel
									</button>
									<button
										type="button"
										onClick={handleCreateTag}
										disabled={!newTagName.trim() || isCreateLoading}
										className="flex-1 px-3 py-2 text-sm text-primary-foreground bg-primary hover:bg-primary-hover rounded-lg disabled:opacity-50"
									>
										{isCreateLoading ? "Creating..." : "Create"}
									</button>
								</div>
							</div>
						) : (
							<button
								type="button"
								onClick={() => {
									setNewTagName(searchQuery);
									setSearchQuery("");
									setIsCreating(true);
									setTimeout(() => {
										dropdownContentRef.current?.scrollTo({
											top: dropdownContentRef.current.scrollHeight,
											behavior: "smooth",
										});
									}, 0);
								}}
								className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-secondary/10 rounded-lg"
							>
								<svg
									className="w-4 h-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 4v16m8-8H4"
									/>
								</svg>
								Create new tag
							</button>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
