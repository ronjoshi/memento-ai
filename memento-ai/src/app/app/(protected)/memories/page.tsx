"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { Memory, Tag, TagColor } from "@/types";
import MemoryList from "@/components/memories/MemoryList";
import MemoryModal from "@/components/memories/MemoryModal";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function MemoriesPage() {
	const { signOut } = useAuth();
	const router = useRouter();
	const PAGE_SIZE = 50;
	const [memories, setMemories] = useState<Memory[]>([]);
	const [tags, setTags] = useState<Tag[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
	const [deletingMemory, setDeletingMemory] = useState<Memory | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const loadMemories = useCallback(async (offset = 0, append = false) => {
		try {
			if (append) {
				setIsLoadingMore(true);
			} else {
				setIsLoading(true);
			}

			const response = await fetch(
				`/api/memories?limit=${PAGE_SIZE}&offset=${offset}`
			);

			if (!response.ok) {
				throw new Error("Failed to fetch memories");
			}

			const data = await response.json();

			if (append) {
				setMemories((prev) => [...prev, ...data.memories]);
			} else {
				setMemories(data.memories);
			}
			setHasMore(data.hasMore);
		} catch (error) {
			console.error("Error loading memories:", error);
		} finally {
			setIsLoading(false);
			setIsLoadingMore(false);
		}
	}, []);

	const handleLoadMore = () => {
		loadMemories(memories.length, true);
	};

	const loadTags = useCallback(async () => {
		try {
			const response = await fetch("/api/tags");

			if (!response.ok) {
				throw new Error("Failed to fetch tags");
			}

			const data = await response.json();
			setTags(data.tags);
		} catch (error) {
			console.error("Error loading tags:", error);
		}
	}, []);

	useEffect(() => {
		loadMemories();
		loadTags();
	}, [loadMemories, loadTags]);

	const handleSaveMemory = async (memoryData: string, tagIds: number[], createdAt?: string) => {
		if (editingMemory) {
			// Update existing memory
			const response = await fetch(`/api/memories/${editingMemory.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ memoryData, tagIds, createdAt }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to update memory");
			}
		} else {
			// Create new memory
			const response = await fetch("/api/memories", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ memoryData, tagIds, createdAt }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to save memory");
			}
		}

		await loadMemories();
	};

	const handleEditMemory = (memory: Memory) => {
		setEditingMemory(memory);
		setShowModal(true);
	};

	const handleDeleteMemory = (memory: Memory) => {
		setDeletingMemory(memory);
	};

	const confirmDeleteMemory = async () => {
		if (!deletingMemory) return;

		setIsDeleting(true);
		try {
			const response = await fetch(`/api/memories/${deletingMemory.id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete memory");
			}

			await loadMemories();
			setDeletingMemory(null);
		} catch (error) {
			console.error("Error deleting memory:", error);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setEditingMemory(null);
	};

	const handleOpenAddModal = () => {
		setEditingMemory(null);
		setShowModal(true);
	};

	const handleCreateTag = async (
		name: string,
		color: TagColor,
	): Promise<Tag> => {
		const response = await fetch("/api/tags", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ name, color }),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "Failed to create tag");
		}

		const data = await response.json();
		setTags((prev) => [...prev, data.tag]);
		return data.tag;
	};

	const handleDeleteTag = async (tagId: number): Promise<void> => {
		const response = await fetch(`/api/tags/${tagId}`, {
			method: "DELETE",
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "Failed to delete tag");
		}

		setTags((prev) => prev.filter((tag) => tag.id !== tagId));
	};

	const handleSignOut = async () => {
		await signOut();
		router.push("/login");
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="bg-card shadow-sm border-b border-card-border">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex justify-between items-center">
						<button
							onClick={() => router.push("/")}
							className="flex items-center gap-2"
						>
							<Image
								src="/memento_logo.svg"
								alt="Memento"
								width={40}
								height={40}
								className="logo-cyan"
							/>
							<h1 className="text-xl font-bold text-primary">
								Memories
							</h1>
						</button>

						<div className="flex items-center space-x-3">
							<button
								onClick={() => router.push("/app/chat")}
								className="p-2 text-muted-foreground hover:text-primary transition-colors"
								title="Chat"
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
										d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
									/>
								</svg>
							</button>

							<button
								onClick={handleOpenAddModal}
								className="p-2 text-muted-foreground hover:text-primary transition-colors"
								title="Add Memory"
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
										d="M12 4v16m8-8H4"
									/>
								</svg>
							</button>

							<button
								onClick={handleSignOut}
								className="p-2 text-muted-foreground hover:text-foreground transition-colors"
								title="Sign Out"
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
										d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<MemoryList
					memories={memories}
					isLoading={isLoading}
					isLoadingMore={isLoadingMore}
					hasMore={hasMore}
					onLoadMore={handleLoadMore}
					onEdit={handleEditMemory}
					onDelete={handleDeleteMemory}
				/>
			</main>

			{/* Memory Modal */}
			<MemoryModal
				isOpen={showModal}
				onClose={handleCloseModal}
				onSave={handleSaveMemory}
				availableTags={tags}
				onCreateTag={handleCreateTag}
				onDeleteTag={handleDeleteTag}
				editingMemory={editingMemory}
			/>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={!!deletingMemory}
				title="Delete Memory"
				message="Are you sure you want to delete this memory? This action cannot be undone."
				confirmText="Delete"
				cancelText="Cancel"
				onConfirm={confirmDeleteMemory}
				onCancel={() => setDeletingMemory(null)}
				isLoading={isDeleting}
			/>
		</div>
	);
}
