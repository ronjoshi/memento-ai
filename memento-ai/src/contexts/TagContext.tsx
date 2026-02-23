"use client";

import {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
	ReactNode,
} from "react";
import { Tag, TagColor } from "@/types";

interface TagContextType {
	// State
	availableTags: Tag[];
	selectedTagIds: number[];
	isLoading: boolean;

	// Filter operations
	setSelectedTagIds: (tagIds: number[]) => void;
	toggleTag: (tagId: number) => void;
	clearFilter: () => void;

	// CRUD operations
	addTag: (tag: Tag) => void;
	removeTag: (tagId: number) => void;
	refreshTags: () => Promise<void>;
	createTag: (name: string, color: TagColor) => Promise<Tag>;
	deleteTag: (tagId: number) => Promise<void>;
}

const TagContext = createContext<TagContextType | undefined>(undefined);

export function TagProvider({ children }: { children: ReactNode }) {
	const [availableTags, setAvailableTags] = useState<Tag[]>([]);
	const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	// Load tags on mount
	const refreshTags = useCallback(async () => {
		setIsLoading(true);
		try {
			const response = await fetch("/api/tags");
			if (!response.ok) throw new Error("Failed to fetch tags");
			const data = await response.json();
			setAvailableTags(data.tags);
		} catch (error) {
			console.error("Error loading tags:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		refreshTags();
	}, [refreshTags]);

	const toggleTag = useCallback((tagId: number) => {
		setSelectedTagIds((prev) =>
			prev.includes(tagId)
				? prev.filter((id) => id !== tagId)
				: [...prev, tagId]
		);
	}, []);

	const clearFilter = useCallback(() => {
		setSelectedTagIds([]);
	}, []);

	const addTag = useCallback((tag: Tag) => {
		setAvailableTags((prev) => [...prev, tag]);
	}, []);

	const removeTag = useCallback((tagId: number) => {
		setAvailableTags((prev) => prev.filter((tag) => tag.id !== tagId));
		setSelectedTagIds((prev) => prev.filter((id) => id !== tagId));
	}, []);

	const createTag = useCallback(
		async (name: string, color: TagColor): Promise<Tag> => {
			const response = await fetch("/api/tags", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, color }),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to create tag");
			}
			const data = await response.json();
			addTag(data.tag);
			return data.tag;
		},
		[addTag]
	);

	const deleteTag = useCallback(
		async (tagId: number): Promise<void> => {
			const response = await fetch(`/api/tags/${tagId}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete tag");
			}
			removeTag(tagId);
		},
		[removeTag]
	);

	return (
		<TagContext.Provider
			value={{
				availableTags,
				selectedTagIds,
				isLoading,
				setSelectedTagIds,
				toggleTag,
				clearFilter,
				addTag,
				removeTag,
				refreshTags,
				createTag,
				deleteTag,
			}}
		>
			{children}
		</TagContext.Provider>
	);
}

export function useTags() {
	const context = useContext(TagContext);
	if (context === undefined) {
		throw new Error("useTags must be used within a TagProvider");
	}
	return context;
}
