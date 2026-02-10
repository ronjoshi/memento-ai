"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Memory, Tag, TagColor } from "@/types";
import MemoryList from "@/components/memories/MemoryList";
import AddMemoryModal from "@/components/memories/AddMemoryModal";

export default function MemoriesPage() {
	const { signOut } = useAuth();
	const router = useRouter();
	const [memories, setMemories] = useState<Memory[]>([]);
	const [tags, setTags] = useState<Tag[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showAddModal, setShowAddModal] = useState(false);
	const [testResult, setTestResult] = useState<string | null>(null);
	const [showTestResult, setShowTestResult] = useState(false);

	const loadMemories = useCallback(async () => {
		try {
			setIsLoading(true);
			const response = await fetch("/api/memories");

			if (!response.ok) {
				throw new Error("Failed to fetch memories");
			}

			const data = await response.json();
			setMemories(data.memories);
		} catch (error) {
			console.error("Error loading memories:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

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

	const handleSaveMemory = async (memoryData: string, tagIds: number[]) => {
		const response = await fetch("/api/memories", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ memoryData, tagIds }),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "Failed to save memory");
		}

		await loadMemories();
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

	const handleTestEdge = async () => {
		try {
			const response = await fetch("/api/test", {
				method: "POST",
			});

			const data = await response.json();

			if (!response.ok) {
				setTestResult(`Error: ${data.error}`);
			} else {
				setTestResult(
					`Status: Success\n\nTotal Memories: ${data.data?.totalMemories || 0}\n\nSummary:\n${data.data?.summary || "No summary available"}`,
				);
			}
			setShowTestResult(true);
		} catch (error) {
			setTestResult(
				`Error: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
			setShowTestResult(true);
		}
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
						<div className="flex items-center space-x-4">
							<button
								onClick={handleSignOut}
								className="text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								Sign Out
							</button>
						</div>

						<h1 className="text-xl font-bold text-foreground">
							Memories
						</h1>

						<div className="flex items-center space-x-3">
							<button
								onClick={() => router.push("/app/search")}
								className="p-2 text-muted-foreground hover:text-primary transition-colors"
								title="Search"
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
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/>
								</svg>
							</button>

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
								onClick={handleTestEdge}
								className="text-sm text-success hover:text-success/80 font-medium transition-colors"
							>
								Test Edge
							</button>

							<button
								onClick={() => setShowAddModal(true)}
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
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<MemoryList
					memories={memories}
					isLoading={isLoading}
					onRefresh={loadMemories}
				/>
			</main>

			{/* Add Memory Modal */}
			<AddMemoryModal
				isOpen={showAddModal}
				onClose={() => setShowAddModal(false)}
				onSave={handleSaveMemory}
				availableTags={tags}
				onCreateTag={handleCreateTag}
				onDeleteTag={handleDeleteTag}
			/>

			{/* Test Result Modal */}
			{showTestResult && (
				<div className="fixed inset-0 z-50 overflow-y-auto">
					<div
						className="fixed inset-0 bg-foreground/50 backdrop-blur-sm"
						onClick={() => setShowTestResult(false)}
					/>
					<div className="flex min-h-full items-center justify-center p-4">
						<div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-card shadow-xl border border-card-border">
							<div className="px-6 py-4 border-b border-border">
								<h3 className="text-lg font-semibold text-card-foreground">
									Edge Function Response
								</h3>
							</div>
							<div className="px-6 py-4">
								<pre className="whitespace-pre-wrap text-sm text-muted-foreground">
									{testResult}
								</pre>
							</div>
							<div className="px-6 py-4 border-t border-border flex justify-end">
								<button
									onClick={() => setShowTestResult(false)}
									className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary-hover rounded-xl shadow-sm"
								>
									OK
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
